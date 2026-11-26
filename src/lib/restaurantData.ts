import type { Employee } from "../types";
import { makeWeekly } from "./sampleData";

// Giờ hợp đồng mỗi tuần và vị trí theo thông tin khách cung cấp.
export function kichiEmployees(): Employee[] {
  return [
    { ...makeWeekly("kh-quyen", "Vu Van Quyen", "TEILZEIT", 20), station: "KITCHEN", role: "Phụ bếp" },
    { ...makeWeekly("kh-vinh", "Pham The Vinh", "VOLLZEIT", 39), station: "SERVICE", role: "Bồi" },
    { ...makeWeekly("kh-thanh", "Nguyen Thanh Thanh", "VOLLZEIT", 35), station: "SERVICE", role: "Bồi" },
    { ...makeWeekly("kh-cong", "Nguyen Quoc Cong", "VOLLZEIT", 38), station: "KITCHEN", role: "Koch" },
    { ...makeWeekly("kh-anh", "Nguyen Hung Anh", "VOLLZEIT", 40), station: "KITCHEN", role: "Sushi" },
  ];
}
