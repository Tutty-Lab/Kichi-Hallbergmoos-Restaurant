import { expect, it } from "vitest";
import { STORES, initialScheduleFor } from "./baoStoreFixture";
import { generateSchedule } from "../scheduler";
import { monthlyTargetMinutesFor } from "../contract";
import { datesOfMonth } from "../demand";
import { applyMigrations } from "../migrations";
import { mayWorkOn } from "../availability";

for (const month of [11, 12]) it(`keeps monthly Minijobs at 43h and reports actual Saturday capacity in month ${month}`, () => {
  const c = STORES[0], s = { ...initialScheduleFor(c), month };
  const shifts = generateSchedule({ ...s, rules: c.staffingRules, weights: c.dayWeights, demandProfile: c.demandProfile, storeTag: c.id });
  // Whole-store deficit must stay visible, including infeasible weekly contracts.
  const summary = s.employees.map(e => ({
    target: monthlyTargetMinutesFor(e, datesOfMonth(2026, month), s.workHours),
    assigned: shifts.filter(x => x.employeeId === e.id).reduce((n, x) => n + x.paidMinutes, 0),
  }));
  expect(summary.map(x => x.target - x.assigned)).toEqual(month === 11 ? [400, 9, 1500, 0, 0] : [732, 15, 1140, 0, 0]);

  for (const e of s.employees.filter(e => e.employmentType === "MINIJOB")) {
    expect(monthlyTargetMinutesFor(e, datesOfMonth(2026, month), s.workHours)).toBe(2580);
    const own = shifts.filter(x => x.employeeId === e.id);
    const paid = own.reduce((n,x) => n+x.paidMinutes,0);
    expect(paid, e.name).toBe(e.id === "bao-hoa" ? (month === 11 ? 18 : 24)*60 : 2580);
    expect(own.every(x => mayWorkOn(e,x.date))).toBe(true);
    if (e.id === "bao-tu") expect(own.every(x => x.startMinutes >= 960)).toBe(true);
  }
});
it("keeps 43h even with only two employed weeks, without shifts before joining", () => {
  const c=STORES[0], s=initialScheduleFor(c);
  const e={...s.employees[4], startDate:"2026-11-17"};
  expect(monthlyTargetMinutesFor(e, datesOfMonth(2026,11), s.workHours)).toBe(2580);
  const shifts=generateSchedule({...s,employees:[e],rules:[],storeTag:c.id});
  expect(shifts.reduce((n,x)=>n+x.paidMinutes,0)).toBe(2580);
  expect(shifts.every(x=>x.date>=e.startDate)).toBe(true);
  expect(monthlyTargetMinutesFor(e,datesOfMonth(2026,10),s.workHours)).toBe(0);
});
it("migrates the old rigid evening shift without changing stored shifts", () => {
  const s=initialScheduleFor(STORES[0]);
  s.employees[3]={...s.employees[3],earliestWorkMinutes:undefined,fixedShift:{startMinutes:1020,endMinutes:1320}};
  const updated=applyMigrations("bao",s);
  expect(updated.employees[3].fixedShift).toBeUndefined();
  expect(updated.employees[3].earliestWorkMinutes).toBe(960);
  expect(updated.shifts).toBe(s.shifts);
});



