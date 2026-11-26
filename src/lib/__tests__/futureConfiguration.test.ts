import { describe, expect, it } from "vitest";
import type { Employee } from "../../types";
import { generateSchedule } from "../scheduler";
import { STORES, initialScheduleFor } from "./baoStoreFixture";
import { makeEmployee } from "../sampleData";
import { datesOfMonth } from "../demand";
import { publicHolidays } from "../holidays";
import { resolveDay, type WorkHoursConfig, type OverrideMap } from "../workHours";
import { validateSchedule } from "../validation";
import { mayWorkOn } from "../availability";

const c=STORES[0];
const added: Employee[] = [
 {...makeEmployee("new-kitchen","New kitchen","TEILZEIT",60), station:"KITCHEN"},
 {...makeEmployee("new-service","New service","MINIJOB",43), station:"SERVICE"},
];
const changed=structuredClone(c.workHours!);
for(const day of Object.keys(changed.perWeekday) as (keyof typeof changed.perWeekday)[]) changed.perWeekday[day]=[{startMinutes:600,endMinutes:840},{startMinutes:960,endMinutes:1260}];
changed.holiday=[{startMinutes:960,endMinutes:1260}];
const narrow=structuredClone(changed);
for(const day of Object.keys(narrow.perWeekday) as (keyof typeof narrow.perWeekday)[]) narrow.perWeekday[day]=[{startMinutes:1080,endMinutes:1320}];
narrow.holiday=[{startMinutes:1080,endMinutes:1320}];
const cases: {name:string;hours:WorkHoursConfig;overrides?:OverrideMap}[]=[
 {name:"new employees",hours:c.workHours!},
 {name:"different lunch and evening hours",hours:changed},
 {name:"narrow evening-only hours",hours:narrow},
 {name:"closed and exceptional dates",hours:changed,overrides:{"2026-12-15":{date:"2026-12-15",closed:true},"2026-12-16":{date:"2026-12-16",closed:false,window:{startMinutes:1080,endMinutes:1260}}}},
];
describe("future Bao configuration",()=>{
 for(const scenario of cases) it(scenario.name,()=>{
  const employees=[...initialScheduleFor(c).employees,...added];
  const input={year:2026,month:12,employees,workHours:scenario.hours,overrides:scenario.overrides,rules:c.staffingRules,weights:c.dayWeights,demandProfile:c.demandProfile,storeTag:c.id};
  const shifts=generateSchedule(input);
  const holidays=publicHolidays(2026);
  const openDates=datesOfMonth(2026,12).filter(d=>!resolveDay(scenario.hours,d,holidays,scenario.overrides??{}).closed);
  expect(validateSchedule(employees,shifts,2026,openDates,scenario.hours).errors.filter(e=>e.severity!=="warning")).toEqual([]);
  for(const shift of shifts){
   const e=employees.find(e=>e.id===shift.employeeId)!;
   const day=resolveDay(scenario.hours,shift.date,holidays,scenario.overrides??{});
   expect(mayWorkOn(e,shift.date)).toBe(true);
   expect(day.closed).toBe(false);
   expect(day.blocks.some(b=>shift.startMinutes>=b.startMinutes&&shift.endMinutes<=b.endMinutes),JSON.stringify(shift)).toBe(true);
  }
  expect(shifts.some(s=>s.employeeId==="new-kitchen")).toBe(true);
  expect(shifts.some(s=>s.employeeId==="new-service")).toBe(true);
  expect(generateSchedule({...input,employees:[...employees].reverse()})).toEqual(shifts);
 });
 it("does not allocate by station or monthly employment label",()=>{
  const employees=added.map(e=>({...e,targetMinutes:43*60,employmentType:"TEILZEIT" as const}));
  const input={year:2026,month:12,employees,workHours:c.workHours!,rules:c.staffingRules,weights:c.dayWeights,demandProfile:c.demandProfile,storeTag:c.id};
  expect(generateSchedule({...input,employees:employees.map(e=>({...e,station:e.station==="KITCHEN"?"SERVICE":"KITCHEN",employmentType:"MINIJOB"}))})).toEqual(generateSchedule(input));
 });
});
