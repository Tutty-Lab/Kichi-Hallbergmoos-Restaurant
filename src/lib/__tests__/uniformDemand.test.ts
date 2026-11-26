import { expect, it } from "vitest";
import { STORES } from "./baoStoreFixture";
import { workloadAt } from "../staffing";
it("uses equal demand every day and minute, including holidays", () => {
 const c=STORES[0];
 for(const day of Object.keys(c.dayWeights) as (keyof typeof c.dayWeights)[]) {
  expect(c.dayWeights[day]).toBe(1);
  for(let t=0;t<1440;t++) expect(workloadAt(t,day,c.dayWeights,c.demandProfile)).toBe(1);
 }
});
