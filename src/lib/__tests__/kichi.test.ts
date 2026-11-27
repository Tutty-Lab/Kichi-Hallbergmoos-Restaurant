import { expect, it } from "vitest";
import { STORES, initialScheduleFor } from "../stores";
import { resolveDay } from "../workHours";
import { publicHolidays } from "../holidays";
import { generateSchedule } from "../scheduler";

it("isolates Hallbergmoos and preserves supplied weekly contracts without inherited payroll", () => {
 const c=STORES[0], s=initialScheduleFor(c);
 expect(c.id).toBe("kichi-hallbergmoos");
 expect(s.address).toBe("Rathausplatz 4, 85399 Hallbergmoos");
 expect(s.employees.map(e=>e.weeklyHours)).toEqual([20,39,35,38,40]);
 expect(s.employees.map(e=>e.station)).toEqual(["KITCHEN","SERVICE","SERVICE","KITCHEN","KITCHEN"]);
 expect(s.employees.every(e=>e.monthlySalary===undefined && e.hourlyRate===undefined && e.startDate===undefined)).toBe(true);
 expect(s.shifts).toEqual([]);
});
it("uses continuous hours, Tuesday closure and New Year evening override", () => {
 const c=STORES[0], s=initialScheduleFor(c), h=publicHolidays(2026);
 const overrides=Object.fromEntries(s.dateOverrides.map(o=>[o.date,o]));
 expect(resolveDay(s.workHours!,"2026-11-23",h,overrides).blocks).toEqual([{startMinutes:630,endMinutes:1320}]);
 expect(resolveDay(s.workHours!,"2026-11-24",h,overrides).closed).toBe(true);
 expect(resolveDay(s.workHours!,"2026-01-01",h,overrides).blocks).toEqual([{startMinutes:1020,endMinutes:1320}]);
 const shifts=generateSchedule({...s,storeTag:c.id,rules:c.staffingRules,overrides});
 expect(shifts.length).toBeGreaterThan(0);
 for(const shift of shifts) {
  const day=resolveDay(s.workHours!,shift.date,h,overrides);
  expect(day.closed).toBe(false);
  expect(day.blocks.some(b=>shift.startMinutes>=b.startMinutes && shift.endMinutes<=b.endMinutes)).toBe(true);
 }
});
it("keeps Christmas closures across supported years", () => {
 const s=initialScheduleFor(STORES[0]), overrides=Object.fromEntries(s.dateOverrides.map(o=>[o.date,o]));
 for(const year of [2026,2027,2028,2029,2030]) for(const day of [24,25,26]) {
  expect(resolveDay(s.workHours!,`${year}-12-${day}`,publicHolidays(year),overrides).closed).toBe(true);
 }
});

import { weeklyBudgetMinutes } from "../contract";
import { datesOfMonth } from "../demand";
import { normalizeWorkHours } from "../workHours";
it("uses Kichi weights for both partial-week boundaries instead of inherited Sunday uplift", () => {
 const c=STORES[0], s=initialScheduleFor(c), h=publicHolidays(2026);
 const hours=normalizeWorkHours(s.workHours);
 expect(hours.dayWeights).toEqual(c.dayWeights);
 const dates=datesOfMonth(2026,11).filter(d=>!resolveDay(hours,d,h,{}).closed);
 let first=0,last=0;
 for(const e of s.employees){const b=weeklyBudgetMinutes(e,dates,{first:"2026-11-01",last:"2026-11-30"},hours);first+=b.get("2026-10-26")??0;last+=b.get("2026-11-30")??0;}
 expect(first/60).toBe(29.5);
 expect(last/60).toBe(27.5);
 expect((first-last)/60).toBeLessThanOrEqual(s.employees.length*.5);
 const shifts=generateSchedule({...s,storeTag:c.id,rules:c.staffingRules,weights:c.dayWeights,demandProfile:c.demandProfile});
 const paid=(date:string)=>shifts.filter(x=>x.date===date).reduce((n,x)=>n+x.paidMinutes,0)/60;
 expect(paid("2026-11-01")).toBe(29.5);
 expect(paid("2026-11-30")).toBe(27.5);
});
