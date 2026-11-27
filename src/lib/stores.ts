import type { Employee, Schedule } from "../types";
import { type WeekdayKey } from "./demand";
import { type DemandBand, type StaffingRule } from "./staffing";
import { DEFAULT_WORK_HOURS, type WorkHoursConfig } from "./workHours";
import { kichiEmployees } from "./restaurantData";
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

const dayWeights: Record<WeekdayKey, number> = { monday: 1, tuesday: 0, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1 };
const open = [{ startMinutes: 630, endMinutes: 1320 }];
export const STORES: StoreConfig[] = [{
  id: "kichi-hallbergmoos", name: "Kichi", shortName: "Kichi Hallbergmoos",
  address: "Rathausplatz 4, 85399 Hallbergmoos",
  sampleEmployees: kichiEmployees,
  workHours: {
    dayWeights,
    perWeekday: { monday: open, tuesday: [], wednesday: open, thursday: open, friday: open, saturday: open, sunday: open },
    holiday: open,
    closedWeekdays: { monday: false, tuesday: true, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false },
  },
  demandProfile: [
    { startMinutes: 0, endMinutes: 690, level: 1, label: "Chuẩn bị / ngoài cao điểm" },
    { startMinutes: 690, endMinutes: 780, level: 2, label: "Cao điểm trưa 11:30–13:00" },
    { startMinutes: 780, endMinutes: 1020, level: 1, label: "Ngoài cao điểm" },
    { startMinutes: 1020, endMinutes: 1170, level: 2, label: "Cao điểm tối 17:00–19:30" },
    { startMinutes: 1170, endMinutes: 1440, level: 1, label: "Ngoài cao điểm" },
  ],
  dayWeights,
  staffingRules: [],
  notes: "Làm 10:30–22:00 liên tục, không nghỉ trưa. Nghỉ thứ Ba. Ngày lễ mở như thường trừ 24–26/12 đóng cả ngày; 01/01 chỉ mở từ 17:00. Cao điểm 11:30–13:00 và 17:00–19:30. Thứ Bảy doanh thu không cao hơn nhiều nên tạm cùng trọng số. Chủ không có mặt cả ngày, không tính vào nhân sự. Chưa có yêu cầu định biên cụ thể; ví dụ 2 bếp tối thứ Sáu trong câu hỏi khảo sát không phải yêu cầu đã xác nhận. Chưa có bảng lương. Quyền 20h/tuần tạm ghi Teilzeit; bốn người còn lại Vollzeit theo mô tả.",
}];
export const DEFAULT_STORE_ID = STORES[0].id;

/** Merkt sich die zuletzt gewählte Filiale auf diesem Gerät. */
const STORE_KEY = "kichi-hallbergmoos-app:store";

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
    dateOverrides: Array.from({ length: 5 }, (_, i) => 2026 + i).flatMap(year => [
      ...[24, 25, 26].map(day => ({ date: `${year}-12-${day}`, closed: true, note: "Nghỉ Giáng sinh" })),
      // 01/01 mở buổi tối, kể cả khi trùng thứ Ba.
      { date: `${year}-01-01`, closed: false, window: { startMinutes: 1020, endMinutes: 1320 }, note: "Mở 17:00–22:00" },
    ]),
    employees: store.sampleEmployees(),
    shifts: [],
  };
}



