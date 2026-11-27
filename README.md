# Kichi Hallbergmoos

Source: Bao-Restaurant. Store riêng `kichi-hallbergmoos`, tách Kichi Vietnamese Foodtour tại Hamburg.

Rathausplatz 4, 85399 Hallbergmoos. Làm 10:30–22:00 liên tục, không nghỉ trưa; nghỉ thứ Ba.
Ngày lễ mở bình thường trừ 24–26/12 đóng cửa. 01/01 mở 17:00–22:00.
Cao điểm 11:30–13:00 và 17:00–19:30. Doanh thu thứ Bảy không cao hơn nhiều: tạm cùng trọng số.
Chủ không hỗ trợ cả ngày. Không áp dụng ví dụ 2 bếp tối thứ Sáu trong câu hỏi khảo sát thành yêu cầu.

| Nhân viên | Giờ/tuần | Vị trí |
|---|---:|---|
| Vu Van Quyen | 20 | Phụ bếp |
| Pham The Vinh | 39 | Bồi |
| Nguyen Thanh Thanh | 35 | Bồi |
| Nguyen Quoc Cong | 38 | Koch |
| Nguyen Hung Anh | 40 | Sushi |

Quyền tạm ghi Teilzeit theo 20h/tuần; bốn người còn lại Vollzeit theo mô tả. Không tự thêm lương, ngày vào làm.
Lịch lễ Bavaria kế thừa BAO.

Production: https://kichi-hallbergmoos-restaurant.vercel.app
Vercel liên kết repo GitHub, nhánh `main`. Storage: Supabase `stundenzettel`, kết nối qua Vercel Marketplace cho production, preview, development.
Store production dùng hàng `kichi-hallbergmoos`; local dùng `dev-kichi-hallbergmoos`; preview dùng prefix `preview-`.
Đã kiểm tra đọc/ghi bằng hàng tạm và xoá sau kiểm tra. Không cần chạy lại schema trên database dùng chung.

Local: `npx vercel env pull .env.local`, sau đó `npm run dev`. Chỉ URL và anon/publishable key được đưa vào frontend. File `.env.local` không commit.

```sh
npm ci
npm run dev
npm run build
npm test
```

Mật khẩu ban đầu `1991`. Không sao chép `.env`, dữ liệu lịch hoặc thông tin kết nối BAO.

Các tài liệu audit trong `docs/` và fixture BAO lưu lại lịch sử source, không phải thông tin vận hành Kichi.
