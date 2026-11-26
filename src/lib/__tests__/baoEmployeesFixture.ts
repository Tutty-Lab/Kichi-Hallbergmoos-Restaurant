import type { Employee } from "../../types";
import { makeWeekly, makeEmployee } from "../sampleData";

export function baoEmployees(): Employee[] {
  return [
    { ...makeWeekly("bao-anh", "Nguyễn Kiều Anh Koch", "VOLLZEIT", 48), station: "KITCHEN", role: "Koch", startDate: "2026-11-08", monthlySalary: 3800, hourlyRate: 18.27 },
    { ...makeWeekly("bao-binh", "Triệu Văn Bình", "VOLLZEIT", 40), station: "KITCHEN", role: "Phụ bếp", startDate: "2026-11-08", hourlyRate: 16.15 },
    { ...makeEmployee("bao-hoa", "Nguyễn Hữu Hoá", "MINIJOB", 43), monthlySalary: 603, hourlyRate: 13.9, station: "KITCHEN", role: "Phụ bếp thứ 7 (tạm thời từ Khang)", startDate: "2026-11-13", availableWeekdays: ["saturday"], personKey: "nguyen-huu-hoa" },
    { ...makeEmployee("bao-tu", "Mạnh Tuấn Tú", "MINIJOB", 43), monthlySalary: 603, hourlyRate: 13.9, station: "SERVICE", role: "Phụ bồi tối", startDate: "2026-11-10", earliestWorkMinutes: 960 },
    { ...makeEmployee("bao-duong", "Thị Khánh Duong", "MINIJOB", 43), monthlySalary: 603, hourlyRate: 13.9, station: "SERVICE", role: "Phụ bồi", startDate: "2026-11-10" },
  ];
}



