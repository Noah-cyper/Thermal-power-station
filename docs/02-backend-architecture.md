# GIAI ĐOẠN 2 — Kiến trúc Backend (ThermoSCADA real)

> Chốt GĐ0: backend **mới**, chạy trên **máy anh (Docker Compose)**, nguồn dữ
> liệu **mô phỏng + thật**, khởi đầu **walking skeleton**. Giữ 2×330 MW.

## 1. Nguyên tắc

- **Model ≠ Transport ≠ View.** Frontend HMI không biết giao thức: nó chỉ nhận
  giá trị tag qua WebSocket. Nguồn dữ liệu (sim hay PLC thật) thay được **không
  sửa frontend** (master prompt §2.3).
- **2 chế độ HMI**: (a) Cloudflare tĩnh — sim trong trình duyệt (demo công khai,
  giữ nguyên); (b) Local — HMI nhận **dữ liệu live từ backend**. HMI tự phát hiện:
  có cấu hình `VITE_WS`/`?api=` thì nối backend, không thì chạy sim trình duyệt.

## 2. Tech stack (theo §7.1)

| Lớp | Chọn | Lý do |
|---|---|---|
| API + WS Hub | **NestJS (TypeScript)** | REST versioned + WS 1 kênh, DI/module rõ ràng |
| Simulation engine | **Node worker (TS)** | Port `engine.js`/`store.js` sẵn có sang server, step 100 ms |
| Data bus | **MQTT (Mosquitto)** | Nguồn (sim/gateway) publish; API subscribe. Sparkplug B ở sprint sau |
| Current value + pub/sub | **Redis** | Giá trị mới nhất + fan-out cho WS |
| Historian | **TimescaleDB** | *(Sprint 3 — thiết kế sẵn chỗ, chưa dựng ở skeleton)* |
| Config/RBAC | **PostgreSQL** | *(Sprint sau)* |
| Gateway thật | **OPC UA / Modbus (Node)** | *(cho "dữ liệu thật" — abstraction có ngay, driver thật sprint sau)* |
| Frontend | **HMI hiện tại** + WS client | Không viết lại; thêm lớp kết nối |

## 3. Cấu trúc repo (mở rộng repo hiện tại — KHÔNG phá Cloudflare)

```
Thermal-power-station/
├─ index.html, assets/, dist/      # HMI tĩnh (Cloudflare deploy giữ nguyên)
├─ server/                         # ★ backend mới
│  ├─ apps/
│  │  ├─ api/        # NestJS: REST /api/v1 + WS hub + AuthZ (sau)
│  │  ├─ sim/        # Simulation engine → publish MQTT (UTM tag frame)
│  │  └─ gateway/    # OPC UA/Modbus → publish MQTT (nguồn "thật")
│  ├─ packages/
│  │  ├─ tag-model/  # schema tag (dùng chung SPEC hiện có) + Zod
│  │  └─ contracts/  # kiểu WS/REST dùng chung FE+BE
│  └─ docker-compose.yml           # mosquitto + redis + api + sim (+ timescaledb sprint sau)
└─ docs/
```

## 4. Luồng dữ liệu

```
[sim engine]  ─┐                         ┌─→ Redis (last value) ─┐
               ├─ MQTT: plant1/S1/DDATA ─┤                        ├─→ WS (delta) ─→ HMI
[gateway PLC] ─┘  (Modbus/OPC UA → UTM)  └─→ (TimescaleDB sprint3)┘
```

- **Sim** và **gateway thật** là 2 *nguồn* bình đẳng, cùng publish lên MQTT theo 1
  khung tag chuẩn → API gộp lại. Bật/tắt từng nguồn qua config (chạy sim, hoặc nối
  PLC thật, hoặc cả hai cho các tag khác nhau).

## 5. Hợp đồng (contract)

**Tag frame (MQTT/WS)** — tái dùng tag ISA hiện có (`msP`, `spd`…):
```jsonc
{ "unit": "S1", "ts": 1730000000000,
  "tags": { "msP": { "v": 167.5, "q": "good" }, "spd": { "v": 3000, "q": "good" } } }
```
**WebSocket** `/ws`: client gửi `{subscribe:[tag...]}` (theo màn đang mở) → server
đẩy **delta** mỗi nhịp + heartbeat 5 s, auto-resubscribe khi reconnect.
**REST** `/api/v1`: `/tags`, `/tags/:id/history` *(sprint3)*, `/health`, `/sim/scenario`.

## 6. HMI đổi gì (nhỏ, không phá sim trình duyệt)

- Thêm `assets/js/core/link.js`: nếu có backend → mở WS, nhận tag frame, ghi vào
  `Store.u[uid]` rồi `Store.emit()` (đúng chỗ engine trình duyệt đang ghi). Nếu
  không → giữ `engine.js` chạy sim như hiện tại. **Components/views không đổi.**

## 7. Walking skeleton (Sprint 1 — mục tiêu duyệt & chạy)

`docker compose up` trên máy anh → **mosquitto + redis + api + sim** chạy; sim đẩy
**toàn bộ tag 2 tổ máy** lên MQTT → API → WS; mở HMI (local) thấy **số liệu chạy
từ server** (không phải sim trình duyệt). Bằng chứng: tắt sim → số liệu đứng; đổi
kịch bản sim → HMI phản ánh. Chưa có historian/alarm-engine/RBAC (sprint sau).

**Định nghĩa hoàn thành:** `docker compose up` xanh; HMI local hiển thị live từ
backend; ≥ toàn bộ tag hiện có; p95 sim→pixel < 500 ms; reconnect tự động.

## 8. Sau skeleton (lộ trình rút gọn)

S2 Historian (TimescaleDB) + trend lịch sử · S3 Alarm engine server (ISA-18.2) +
audit · S4 Gateway Modbus/OPC UA thật (dữ liệu thật) + PLC simulator · S5 Auth/RBAC
+ lệnh ghi (setpoint) có audit · S6 Sparkplug B + hardening.

## 9. Rủi ro / lưu ý

- Backend chạy **máy anh** → HMI công khai (Cloudflare) **không** gọi được
  `localhost`. "Chế độ thật" chạy **local** (compose phục vụ cả HMI + backend ở
  `localhost`). Muốn HMI công khai nối backend thật → phải expose backend (domain
  + TLS) — tính sau.
- Giữ 2×330 MW; tag/ngưỡng lấy từ `store.js` hiện có (không bịa số mới).
