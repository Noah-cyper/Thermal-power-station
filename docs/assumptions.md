# Giả định (assumptions)

> Theo nguyên tắc chống bịa của master prompt (§4.4): mọi số liệu/mã không có
> nguồn chắc chắn được đánh dấu `[GIẢ ĐỊNH]` và ghi tại đây.

## Cấu hình nhà máy

- App giữ **2 × 330 MW** (không đổi sang 1×600 MW của master prompt §3) — theo
  quyết định của chủ dự án. Do đó **không dùng** các con số §3 (BMCR 2008 t/h,
  17,5 MPa, 500 kV…); giữ bộ tham số 2×330 MW đang có trong `assets/js/core/store.js`.

## Mã KKS trên sơ đồ / faceplate  `[GIẢ ĐỊNH]`

Các mã KKS hiển thị (faceplate + tooltip thiết bị) là **minh hoạ**, **chưa phải
KKS đã duyệt theo VGB-B106**. Dùng để thể hiện đúng *hình thức* mã KKS, không đảm
bảo đúng key hệ thống thực tế của nhà máy.

| Thiết bị | KKS (giả định) | Ghi chú |
|---|---|---|
| Bunker than | `<u>HFB10` | u = số tổ máy (1/2) |
| Máy nghiền | `<u>HFC10` | |
| Lò hơi / buồng lửa | `<u>HAD10` | |
| Ống khói · CEMS | `<u>HNA10` | đường khói |
| Tua-bin | `<u>MAA10` | HP turbine |
| Máy phát | `<u>MKA10` | |
| MBA đầu cực (GSU) | `<u>BAT10` | |
| Bình ngưng | `<u>MAG10` | |
| Tháp giải nhiệt | `<u>PAH10` | |
| Khử khí + Bơm cấp | `<u>LAA10` | |

Mã đo (KKS measurement) tham chiếu §10.1: `CP` áp suất · `CT` nhiệt độ · `CF` lưu
lượng · `CL` mức · `CQ` phân tích · `CY` rung · `CG` vị trí · `CE` tốc độ. Trên sơ
đồ vẫn dùng mã **ISA-5.1** (PT/TT/FT/LT/AT…) làm nhãn chính cho dễ đọc.

Khi cần KKS chuẩn: thay bảng trên bằng bộ mã VGB-B106 đã được kỹ sư nhà máy xác nhận.

## Bảng màu môi chất

Áp theo master prompt §9.4 (Hơi `#D93A3A`, Tái nhiệt `#E8791E`, Nước cấp `#2E6FD9`,
Nước ngưng `#29A38A`, Nước tuần hoàn `#1FA5D6`, Gió `#93B8D8`, Khói `#8B7355`,
Than `#4A4A4A`, Điện `#E0A300`). Màu "Điện" (#E0A300) không có trong danh sách §9.4
→ chọn theo thông lệ (hổ phách cho mạch điện). `[GIẢ ĐỊNH]`
