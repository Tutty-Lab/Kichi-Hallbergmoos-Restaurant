import { applyMigrations } from "../migrations";
import { describe, expect, it } from "vitest";
import { STORES, initialScheduleFor } from "./baoStoreFixture";
import { mayWorkOn } from "../availability";
import { resolveDay } from "../workHours";
import { publicHolidays } from "../holidays";
describe("Quán Bảo", () => {
  it("isolates store and seeds November without actual shifts", () => {
    expect(STORES.map(s => s.id)).toEqual(["bao"]);
    const s = initialScheduleFor(STORES[0]);
    expect(s.month).toBe(11); expect(s.employees).toHaveLength(5); expect(s.shifts).toEqual([]);
    expect(s.employees[0]).toMatchObject({ weeklyHours: 48, monthlySalary: 3800, hourlyRate: 18.27, startDate: "2026-11-08" });
    expect(s.employees[1]).toMatchObject({ weeklyHours: 40, hourlyRate: 16.15 });
    expect(s.employees.slice(2).every(e => e.targetMinutes === 2580 && e.monthlySalary === 603 && e.hourlyRate === 13.9)).toBe(true);
  });
  it("allows Hoá only Saturdays after joining", () => {
    const e = STORES[0].sampleEmployees()[2];
    expect(mayWorkOn(e, "2026-11-07")).toBe(false);
    expect(mayWorkOn(e, "2026-11-13")).toBe(false);
    expect(mayWorkOn(e, "2026-11-14")).toBe(true);
    expect(mayWorkOn(e, "2026-11-15")).toBe(false);
  });
  it("uses supplied normal, weekend and holiday windows", () => {
    const s = initialScheduleFor(STORES[0]); const h = publicHolidays(2026);
    expect(resolveDay(s.workHours!, "2026-11-09", h, {}).blocks).toEqual([{ startMinutes: 690, endMinutes: 900 }, { startMinutes: 1020, endMinutes: 1320 }]);
    for (const d of ["2026-11-14", "2026-11-15", "2026-12-25"])
      expect(resolveDay(s.workHours!, d, h, {}).blocks).toEqual([{ startMinutes: 960, endMinutes: 1320 }]);
  });
});

it("updates saved Minijobs once while preserving schedules and later edits", () => {
  const s = initialScheduleFor(STORES[0]);
  s.employees[2].targetMinutes = 0;
  const updated = applyMigrations("bao", s);
  expect(updated.employees[2]).toMatchObject({ targetMinutes: 2580, monthlySalary: 603, hourlyRate: 13.9, availableWeekdays: ["saturday"] });
  expect(updated.shifts).toBe(s.shifts);
  updated.employees[2].targetMinutes = 1200;
  expect(applyMigrations("bao", updated).employees[2].targetMinutes).toBe(1200);
  expect(applyMigrations("other", s).employees[2].targetMinutes).toBe(0);
});
