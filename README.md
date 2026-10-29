# Fantasy Realm - 2D Tower Defense Game

Một tựa game thủ thành 2D hoàn chỉnh, hiện đại và tối ưu hóa hiệu năng cao, được phát triển bằng **React + TypeScript + Vite** kết hợp **HTML5 Canvas** thuần túy mà không dùng bất kỳ hình ảnh hay tài nguyên ngoài nào tải từ Internet.

---

## 🌟 Tính Năng Nổi Bật

### 1. Đồ Họa Procedural Tinh Tế (HTML5 Canvas)
- **100% Đồ họa vẽ bằng code**: Tất cả tháp canh, đường sá, quái vật, đường đạn, vòng hào quang và hiệu ứng khói lửa được vẽ trực tiếp qua Canvas 2D API. Không dùng emoji làm hình ảnh chính.
- **Hiệu ứng thị giác chân thực**:
  - Đạn bay theo quỹ đạo, mũi tên xoay theo góc bắn, pháo nổ tạo sóng xung kích (shockwave) và tia lửa đỏ rực.
  - Ma thuật tích tụ năng lượng tím với các tinh thể quay quanh đài tháp và hiệu ứng làm chậm quái vật dạng băng giá.
  - Quái vật có bước đi chuyển động (walk cycle animation), thanh máu hiển thị trạng thái và nhấp nháy trắng khi dính sát thương.
  - Chữ số sát thương và tiền vàng nổi lên mượt mà (floating combat text).
- **Hỗ trợ HiDPI / Retina Display**: Tự động nhân tỉ lệ `devicePixelRatio` cho hình ảnh sắc nét.

### 2. Hệ Thống Tháp Phòng Thủ (Towers)
Mỗi tháp đều có 3 cấp nâng cấp riêng biệt với thay đổi diện mạo rõ rệt và chiến lược mục tiêu linh hoạt (*Đi đầu tiên*, *Đi sau cùng*, *Gần nhất*, *Máu cao nhất*, *Máu thấp nhất*):
- 🏹 **Tháp Cung Thủ (Archer Tower)**: Giá 70 Vàng. Tốc độ bắn cực nhanh (2.2 - 3.2 phát/giây), tầm bắn trung bình, đơn mục tiêu ổn định.
- 💣 **Pháo Thần Công (Cannon Tower)**: Giá 125 Vàng. Bắn đạn pháo nổ diện rộng (AoE Splash 75px - 110px), uy lực hủy diệt nhưng tốc độ bắn chậm.
- 🔮 **Tháp Pháp Thuật (Magic Tower)**: Giá 100 Vàng. Tầm bắn xa (175px - 220px), sát thương phép xuyên giáp và áp dụng hiệu ứng **làm chậm 35% - 55%** tốc độ kẻ địch.
- **Quy tắc công trình**:
  - Không cho phép xây đè lên đường đi của quái, ngoài bản đồ hoặc chồng lấn lên tháp khác.
  - Bán lại tháp thu hồi **70% tổng số vàng** đã đầu tư (bao gồm cả tiền mua gốc và tiền nâng cấp).

### 3. Kẻ Địch & Cơ Chế Wave
- 👺 **Goblin Trinh Sát**: Di chuyển nhanh, máu thấp, thường tràn vào theo đàn.
- 👹 **Orc Chiến Binh**: Di chuyển chậm chạp, giáp nặng, lượng máu dồi dào.
- 🥷 **Kẻ Đột Kích (Runner)**: Di chuyển siêu tốc, cực kỳ nguy hiểm nếu không có tháp làm chậm.
- 👿 **Chúa Quỷ Titan (Boss Đợt 10)**: Máu cực lớn (1.100 HP), sải bước khổng lồ, trừ 3 máu nếu chạm tới căn cứ!
- **Đảm bảo tính toàn vẹn (Gameplay Integrity)**:
  - Kẻ địch chết chỉ được tính đúng 1 lần, không thưởng vàng trùng.
  - Đạn không tiếp tục gây sát thương lên kẻ địch đã chết.
  - Không cho phép bắt đầu đợt mới khi game đang tạm dừng, đã thắng hoặc đã thua.

### 4. Hệ Thống Âm Thanh Tổng Hợp (Web Audio API)
- Tích hợp bộ tổng hợp âm thanh đa tần số (procedural audio synthesizer) thuần JavaScript, không cần tải bất kỳ file mp3/wav nào.
- Đầy đủ tiếng bắn tên, tiếng pháo rền nổ, tiếng ma pháp tích tụ, tiếng vàng leng keng, tiếng tù và khai trận, nhạc chiến thắng và thua cuộc.
- Có nút bật/tắt âm thanh (Mute/Unmute) tiện lợi.

---

## 🎮 Hướng Dẫn Điều Khiển & Phím Tắt

| Phím Tắt | Chức Năng |
| :--- | :--- |
| `1` | Chọn xây Tháp Cung Thủ (Archer Tower) |
| `2` | Chọn xây Pháo Thần Công (Cannon Tower) |
| `3` | Chọn xây Tháp Pháp Thuật (Magic Tower) |
| `Space` | Bắt đầu đợt quái tiếp theo (Xuất trận) |
| `P` | Tạm dừng / Tiếp tục trận chiến |
| `M` | Bật / Tắt âm thanh |
| `R` | Chơi lại ván mới từ đầu |
| `Esc` | Hủy đặt tháp hoặc bỏ chọn tháp |
| `1x / 2x / 4x` | Điều chỉnh tốc độ mô phỏng trận đấu trên thanh công cụ |

---

## 📁 Cấu Trúc Mã Nguồn

```
projectgame/
├── index.html                  # File HTML chính
├── package.json                # Cấu hình dự án & thư viện
├── tsconfig.json               # Cấu hình TypeScript
├── vite.config.ts              # Cấu hình Vite & Vitest
├── src/
│   ├── main.tsx                # Entry point React
│   ├── App.tsx                 # Root component & keyboard bindings
│   ├── App.css                 # Giao diện Fantasy responsive & Glassmorphism
│   ├── index.css               # Reset CSS & biến màu hệ thống
│   ├── types/
│   │   └── game.ts             # Định nghĩa toàn bộ interfaces & types
│   ├── config/
│   │   └── gameConfig.ts       # Cân bằng chỉ số tháp, quái, bản đồ & wave
│   ├── utils/
│   │   └── math.ts             # Thuật toán hình học & khoảng cách đoạn thẳng
│   ├── engine/
│   │   ├── GameEngine.ts       # Nhạc trưởng trung tâm điều phối toàn bộ game
│   │   ├── GameLoop.ts         # Vòng lặp requestAnimationFrame với delta time
│   │   ├── MapManager.ts       # Quản lý đường đi waypoints & kiểm tra vị trí xây
│   │   ├── TowerManager.ts     # Logic tháp, tìm mục tiêu & tốc độ hồi chiêu
│   │   ├── EnemyManager.ts     # Spawning, di chuyển & đảm bảo chết một lần
│   │   ├── ProjectileManager.ts# Bay đạn, tính va chạm & sát thương lan (AoE)
│   │   ├── ParticleManager.ts  # Hệ thống hạt khói lửa, tia sáng & chữ sát thương
│   │   ├── CanvasRenderer.ts   # Bộ vẽ 2D Canvas đồ họa fantasy sắc nét
│   │   └── SoundManager.ts     # Trình tạo âm thanh tổng hợp Web Audio API
│   ├── components/
│   │   ├── TopBar.tsx          # Thanh chỉ số: Máu căn cứ, Vàng, Wave & Tốc độ
│   │   ├── CanvasView.tsx      # Khung canvas hiển thị chiến trường
│   │   ├── TowerShop.tsx       # Bảng mua tháp phòng thủ
│   │   ├── TowerInspector.tsx  # Bảng nâng cấp, đổi mục tiêu ưu tiên & bán trụ
│   │   ├── WaveControl.tsx     # Bảng thông tin đợt quái kế tiếp & nút gọi đợt
│   │   ├── NotificationToast.tsx # Hệ thống thông báo cảnh báo tức thì
│   │   └── GameModal.tsx       # Màn hình Chiến thắng / Thất bại & Thống kê
│   └── __tests__/
│       ├── economy.test.ts     # Test kinh tế: vàng, mua, nâng cấp, bán, hạ quái
│       ├── damage.test.ts      # Test sát thương đơn, sát thương lan AoE, mất máu
│       ├── upgrades.test.ts    # Test cấp 1 -> 2 -> 3, chỉ số và chi phí
│       ├── singleDeath.test.ts # Test chết đúng 1 lần, đạn an toàn, chặn spam wave
│       └── reset.test.ts       # Test làm mới toàn bộ trạng thái khi chơi lại
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Môi Trường
- **Node.js**: Phiên bản 18+ (khuyên dùng Node 20 hoặc 24).
- **npm** (hoặc `npm.cmd` trên Windows PowerShell).

### 1. Cài đặt Dependencies
Mở terminal tại thư mục dự án `C:\ProjectPhong\VideoAI\projectgame`:
```bash
npm install
```

### 2. Chạy Môi Trường Phát Triển (Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ mở tại địa chỉ: `http://localhost:5173`.

### 3. Chạy Kiểm Thử Tự Động (Unit Tests)
```bash
npm test
```
Tất cả 17 bài kiểm tra (Vitest) cho các quy tắc quan trọng (Economy, Damage, Upgrades, Single Death, Reset) sẽ được chạy và báo cáo chi tiết.

### 4. Kiểm tra Typecheck & Build Bản Sản Phẩm
```bash
npm run typecheck
npm run build
```
Bản build sản phẩm tối ưu sẽ được sinh ra tại thư mục `dist/`.

---

## 🏆 Tiêu Chuẩn Nghiệm Thu Đã Đạt
- [x] Giao diện fantasy hiện đại, cân đối, responsive trên cả màn hình lớn và nhỏ.
- [x] Không sử dụng bất kỳ hình ảnh ngoài, hoàn toàn tự vẽ bằng Canvas 2D mượt mà.
- [x] Đầy đủ 3 loại tháp với chỉ số và 3 cấp độ nâng cấp trực quan.
- [x] Đầy đủ 3 loại quái vật đặc trưng và trùm cuối Titan ở đợt 10.
- [x] Cơ chế game chặt chẽ: xử lý delta time, quản lý vòng đời requestAnimationFrame chuẩn xác, không leak memory.
- [x] Kiểm thử tự động đạt 100% tỉ lệ pass cho tất cả các quy tắc cốt lõi.

