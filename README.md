# ThermoSCADA — Hệ SCADA web cho Nhà máy Nhiệt điện

Hệ thống **SCADA/HMI trình bày trên nền web** cho nhà máy nhiệt điện than
(mô hình **2 × 330 MW**). Toàn bộ chạy **hoàn toàn trên trình duyệt**, dữ liệu
được **mô phỏng thời gian thực** để giao diện sống động như phòng điều khiển
thật.

> ⚠️ Đây là bản **trình bày/demo**: không kết nối thiết bị thật, không backend,
> không Modbus/OPC-UA. Số liệu là mô phỏng, phục vụ minh hoạ giao diện & luồng
> nghiệp vụ SCADA.

---

## ✨ Đặc điểm

- **Zero-dependency**: chỉ HTML + CSS + JavaScript thuần, không thư viện, không
  CDN, không cần build — chạy được offline (phù hợp môi trường OT/DMZ).
- **12 phân hệ SCADA** chia theo dây chuyền công nghệ, dùng chung một ngôn ngữ
  thiết kế.
- **Mô phỏng có liên động vật lý**: một biến "tải" cho mỗi tổ máy, các đại lượng
  còn lại suy ra theo quan hệ gần đúng (tải ↑ → hơi ↑ → than ↑ → khói ↑).
- **Kịch bản cảnh báo** dựng sẵn: máy nghiền 1A của S1 nóng dần (drift), bơm dự
  phòng offline… để minh hoạ hệ cảnh báo.
- **Đồ thị, gauge, sơ đồ P&ID/SLD** tự vẽ bằng SVG/Canvas.
- **Giao diện đáp ứng** (responsive), hỗ trợ chọn tổ máy S1/S2.

---

## 🗂️ Các phân hệ (12 màn hình)

| Nhóm | Màn hình | Nội dung |
|------|----------|----------|
| Giám sát | **Tổng quan nhà máy** | KPI toàn nhà máy, sơ đồ dây chuyền P&ID, xu hướng công suất, cảnh báo, truyền thông, tình trạng hệ thống |
| | **Lò hơi & Đốt** | Áp/nhiệt hơi, O₂, quá trình đốt–khói, mức bao hơi (điều khiển 3 phần tử) |
| | **Tua-bin & Máy phát** | Tốc độ, công suất, chân không, độ rung, gối trục, thông số máy phát |
| | **Nước cấp & Ngưng tụ** | Bình ngưng, khử khí, bơm cấp, gia nhiệt |
| | **Nước làm mát** | Nước tuần hoàn, sơ đồ tháp giải nhiệt, quạt biến tần |
| | **Cấp nhiên liệu** | Bảng 5 máy nghiền, kho–băng tải, bunker |
| | **Điện & Trạm phân phối** | Sơ đồ một sợi (SLD) 220kV, U/f/P/cosφ, máy phát, lộ đường dây |
| | **Khí thải & CEMS** | SO₂/NOx/bụi/opacity, FGD/ESP, xu hướng % tuân thủ QCVN |
| Vận hành | **Cảnh báo & Sự kiện** | Danh sách cảnh báo + bộ lọc + ack, nhật ký sự kiện (SOE) |
| | **Historian & Xu hướng** | Đồ thị đa kênh, so sánh 2 tổ máy, thống kê min/max/TB |
| | **Báo cáo** | Báo cáo ca: sản lượng, suất hao nhiệt, phát thải, biểu đồ giờ |
| Cấu hình | **Cấu hình hệ thống** | Tài sản · Thiết bị I/O · Người dùng · Cài đặt |

---

## 🚀 Chạy thử

Không cần cài đặt gì. Chỉ cần một web server tĩnh:

```bash
# cách 1: Python
python3 -m http.server 8099
# rồi mở http://localhost:8099

# cách 2: Node
npx serve .
```

> Cần chạy qua HTTP server (không mở trực tiếp `file://`) để trình duyệt nạp
> đúng các file JS module.

---

## 🏗️ Kiến trúc mã nguồn

```
index.html                 App shell (sidebar + topbar + vùng view)
assets/
  css/
    design-system.css      Tokens màu/typography, badge, nút, trạng thái
    layout.css             Sidebar, topbar, khung, responsive
    components.css         Card, KPI, gauge, band, bảng, P&ID, alarm…
  js/
    core/
      format.js            Hàm định dạng số/giờ, nhiễu mô phỏng
      store.js             "Tag database" (metadata) + trạng thái + pub/sub
      engine.js            Vòng lặp mô phỏng, liên động, cảnh báo, historian
      components.js        Thư viện render (gauge, trend, kpi, metric, alarm…)
      router.js            Hash router (#/overview …)
    views/                 12 màn hình (mỗi file 1 phân hệ)
    app.js                 Bootstrap: nav, topbar, đăng ký view, khởi động
```

### Luồng dữ liệu

1. `engine.js` cập nhật `store` mỗi **1000 ms** → phát sự kiện `emit()`.
2. `router` gắn hàm `update()` của màn hình đang mở vào `store.subscribe`.
3. `components.refresh()` cập nhật tại chỗ các phần tử `data-live` / `data-gauge`
   / `data-band` / `data-meter` (không dựng lại DOM → không nhấp nháy).
4. Các đồ thị canvas được vẽ lại mỗi nhịp.

### Thêm một điểm đo (tag)

Khai báo trong `store.js » SPEC` (mô tả, đơn vị, mã ISA, ngưỡng cảnh báo/alarm)
và gán giá trị trong `engine.js » derive()`. Trạng thái màu (bình thường/cảnh
báo/sự cố) tự suy ra theo ngưỡng.

---

## 🎨 Thiết kế

- Vỏ tối (sidebar/topbar) + vùng nội dung sáng, accent xanh dương — theo phong
  cách phòng điều khiển công nghiệp.
- Mã màu trạng thái **luôn kèm icon + nhãn chữ** (không chỉ dựa vào màu), palette
  đồ thị đã đối chiếu độ phân biệt cho người mù màu (CVD).
- Số đo dùng `tabular-nums` để cột thẳng hàng.

---

## 🧭 Lộ trình (đã hoàn thành)

- **GĐ0** Nền tảng · **GĐ1** 3 màn hình lõi · **GĐ2** Nhiệt–Nước–Nhiên liệu ·
  **GĐ3** Điện & Môi trường · **GĐ4** Vận hành & Dữ liệu · **GĐ5** Cấu hình &
  hoàn thiện.

### Hướng mở rộng (nếu cần chạy thật)

- Backend Node.js/Python + WebSocket đẩy dữ liệu thời gian thực.
- Driver **Modbus TCP / IEC 60870-5-104 / OPC-UA** kết nối PLC/RTU/DCS.
- Historian **PostgreSQL/TimescaleDB**, xác thực người dùng, phân quyền.

---

*Bản trình bày phục vụ minh hoạ. Số liệu mô phỏng.*
