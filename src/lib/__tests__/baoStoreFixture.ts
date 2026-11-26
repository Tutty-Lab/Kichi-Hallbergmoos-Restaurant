import type { Employee, Schedule } from "../../types";
import { type WeekdayKey } from "../demand";
import { type DemandBand, type StaffingRule } from "../staffing";
import { DEFAULT_WORK_HOURS, type WorkHoursConfig } from "../workHours";
import { baoEmployees } from "./baoEmployeesFixture";
export type StoreConfig = {
  /** Schlüssel der Zeile in store_data – nach dem Anlegen NICHT mehr ändern. */
  id: string;
  name: string;
  /** Kurzname für den Umschalter in der Kopfzeile. */
  shortName: string;
  address: string;
  /** Belegschaft beim allerersten Öffnen. */
  sampleEmployees: () => Employee[];
  workHours?: WorkHoursConfig;
  notes?: string;
  demandProfile?: readonly DemandBand[];
  /** Welche Wochentage stark sind (Umsatz) – steuert die Stundenverteilung. */
  dayWeights: Record<WeekdayKey, number>;
  /** Wie viele Leute wann im Haus sein sollen. */
  staffingRules: readonly StaffingRule[];
};

export const LUNCH_BLOCK = { startMinutes: 690, endMinutes: 900 };
export const EVENING_BLOCK = { startMinutes: 1020, endMinutes: 1320 };
const specialEvening = { startMinutes: 960, endMinutes: 1320 };
const normal = [LUNCH_BLOCK, EVENING_BLOCK];
export const STORES: StoreConfig[] = [{
  id: "bao", name: "Quán Bảo", shortName: "Bảo", address: "",
  sampleEmployees: baoEmployees,
  demandProfile: [{ startMinutes: 0, endMinutes: 1440, level: 1, label: "Đồng đều, chưa phân cao điểm" }],
  workHours: {
    perWeekday: { monday: normal, tuesday: normal, wednesday: normal, thursday: normal, friday: normal, saturday: [specialEvening], sunday: [specialEvening] },
    holiday: [specialEvening],
    closedWeekdays: { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
  },
  dayWeights: { monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1 },
  staffingRules: [{ label: "Trong giờ mở cửa", when: "suốt mỗi khung mở", minStaff: 1, maxStaff: Infinity, scaled: false, windows: blocks => blocks }],
  notes: "11:30–15:00 / 17:00–22:00. Thứ 7, CN, ngày lễ: 16:00–22:00. Hữu Hoá phụ bếp thứ 7, tạm thời tháng 11. Minijob 603 €/tháng, 13,90 €/giờ, mục tiêu 43 giờ/tháng. Chưa có địa chỉ, định mức nhân sự. Năm 2026 và lịch lễ München tạm theo dự án gốc; cần xác nhận.",
}];
export const DEFAULT_STORE_ID = STORES[0].id;

/** Merkt sich die zuletzt gewählte Filiale auf diesem Gerät. */
const STORE_KEY = "bao-app:store";

export function loadStoreId(): string {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved && STORES.some((s) => s.id === saved)) return saved;
  } catch {
    /* ignorieren */
  }
  return DEFAULT_STORE_ID;
}

export function saveStoreId(id: string): void {
  try {
    localStorage.setItem(STORE_KEY, id);
  } catch {
    /* ignorieren */
  }
}

export function storeById(id: string): StoreConfig {
  return STORES.find((s) => s.id === id) ?? STORES[0];
}

/**
 * Ältere Stände (gespeichert, bevor Nieu 37 dazukam) kennen noch keinen
 * personKey. Dann erkennt „Tạo lịch làm việc" nicht, dass Bá Việt Nguyen im
 * Shin und im Nieu derselbe Mensch ist, und plant ihn am selben Tag in beiden
 * Läden. Fehlt der personKey, übernimmt ein Mitarbeiter mit derselben id und
 * demselben Namen wie in der Startbelegschaft personKey und – nur in diesem
 * einen Schritt – auch maxDaysPerWeek. Danach steht der personKey im Stand, und
 * ein später geleertes „tối đa … ngày/tuần" bleibt leer. Löst man die
 * Verbindung im Tab Nhân viên, steht dort "" statt nichts.
 */
export function withSharedPersonDefaults(employees: Employee[], store: StoreConfig): Employee[] {
  const starters = new Map(store.sampleEmployees().map((e) => [e.id, e]));
  return employees.map((employee) => {
    const starter = starters.get(employee.id);
    // "" = im Tab Nhân viên bewusst gelöst – dann nicht wieder verbinden.
    if (employee.personKey !== undefined || !starter?.personKey || starter.name !== employee.name) return employee;
    return {
      ...employee,
      personKey: starter.personKey,
      maxDaysPerWeek: employee.maxDaysPerWeek ?? starter.maxDaysPerWeek,
    };
  });
}

/** Startstand einer Filiale: September 2026 mit der Belegschaft aus der Angabe. */
export function initialScheduleFor(store: StoreConfig): Schedule {
  return {
    companyName: store.name,
    address: store.address,
    year: 2026,
    month: 11,
    workHours: structuredClone(store.workHours ?? DEFAULT_WORK_HOURS),
    dateOverrides: [],
    employees: store.sampleEmployees(),
    shifts: [],
  };
}



