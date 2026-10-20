# Frame — Portfolio Before/After

Website một trang cho dịch vụ chỉnh sửa ảnh kiến trúc và bất động sản. Vite + TypeScript thuần, không có framework giao diện, backend, database hoặc thư viện animation. Toàn bộ ảnh và font được phục vụ cục bộ.

**Frame là tên tạm cho demo.** Website chưa nhận ảnh hay yêu cầu dịch vụ khi chưa cấu hình thông tin liên hệ. Ảnh có nhãn Demo là dữ liệu minh họa, không phải dự án khách hàng.

## Chạy tại máy

Cần Node.js **22.12+** (khuyến nghị Node 24 LTS) và npm.

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal. Không cần biến môi trường hay API key.

```sh
npm run build     # TypeScript typecheck + production build
npm run preview   # Xem thử thư mục dist sau build
```

Nếu máy cloud không ghi được npm cache mặc định, dùng `npm ci --cache /workspace/.npm-cache`.

## Cấu trúc

```text
src/
  config.ts       # Thông tin công ty, liên hệ, danh mục và sản phẩm
  comparison.ts   # Component Before/After độc lập, tái sử dụng
  main.ts         # Trang, bộ lọc và dialog xem ảnh lớn
  style.css       # Giao diện responsive và chuyển động gợi ý
public/
  images/         # Ảnh demo và ghi chú nguồn gốc
  favicon.svg     # Biểu tượng tạm; thay khi có nhận diện thật
tests/            # Kiểm tra tương tác bằng Playwright
  artifacts/        # Ảnh chụp do kiểm tra sinh ra, không đưa vào Git
```

## Thay tên, logo và liên hệ

Sửa `site` trong **`src/config.ts`**:

- `companyName`, `companyNote`, `logo`: tên, ghi chú nhận diện và đường dẫn logo; để `logo: null` để dùng biểu tượng tạm.
- `email`, `phone`, `contactUrl`, `location`: thông tin thật. Mặc định `null`. Điện thoại dùng mã quốc gia; `contactUrl` phải bắt đầu bằng `https://`.
- Có email sẽ hiện liên kết `mailto:`, có điện thoại sẽ hiện `tel:`, có URL sẽ mở kênh liên hệ thật. Đây là liên kết liên hệ, không phải biểu mẫu gửi file. Nếu tất cả đều thiếu, trang chỉ hiển thị trạng thái đang cập nhật.
- `heroProjectId`: ID sản phẩm dùng cho khung lớn đầu trang.
- `demo`: tắt nhãn thương hiệu demo khi đã có thông tin công ty chính thức. Nhãn ảnh được điều khiển riêng bằng `demo` trong từng sản phẩm.

Cập nhật `title`, `description` trong `index.html` và `public/favicon.svg` khi chốt thương hiệu. Tiêu đề trang tự lấy tên công ty khi JavaScript chạy, nhưng metadata HTML cần được cập nhật để dùng khi chia sẻ và lập chỉ mục.

## Thay và thêm ảnh

Toàn bộ danh sách nằm trong `projects` ở **`src/config.ts`**. Mỗi sản phẩm gồm `id` duy nhất (kebab-case), `title`, `category`, `service`, `before`, `after`, `description`, `alt`, `demo`, và bộ lọc CSS tùy chọn.

```ts
{
  id: 'living-room-01',
  title: 'Phòng khách bên vườn',
  category: 'interior',
  service: 'Cân bằng sáng & màu sắc',
  before: '/images/living-before.webp',
  after: '/images/living-after.webp',
  description: 'Mô tả chính xác công việc thực hiện.',
  alt: 'Phòng khách nhìn ra khu vườn qua cửa kính',
  demo: false,
}
```

1. Đặt ảnh trong `public/images/`. Nên dùng WebP/JPEG tối ưu, rộng khoảng 1400–1800px.
2. Hai ảnh phải **cùng cảnh, cùng tỷ lệ, cùng kích thước và đăng ký khớp vị trí**. Không dùng hai ngôi nhà khác nhau cho một cặp.
3. Thay đường dẫn `before`/`after`, bỏ `beforeFilter`/`afterFilter` khi dùng kết quả chỉnh sửa thật. Đổi `demo: false` chỉ khi dữ liệu thực sự là dự án thật được phép công bố.
4. Thêm sản phẩm trong danh sách; số lượng hiển thị và bộ lọc tự cập nhật. Thêm nhóm dịch vụ vào `categories` khi cần.

Ảnh demo hiện tại được tạo bằng AI, dùng cùng một ảnh ở hai phía với CSS filter thay đổi sáng/màu, không mô phỏng mọi nghiệp vụ chỉnh sửa. Xem nguồn gốc tại [`public/images/credits.md`](public/images/credits.md).

## Hành vi component

`mountComparison(host, options)` trong `src/comparison.ts` trả về `getValue()` và `destroy()`. Giá trị ban đầu là 30%. Hai ảnh luôn giữ nguyên kích thước; `clip-path` thay đổi phần ảnh nhìn thấy.

- Vòng tròn cố định **54 × 54px**, SVG nằm bên trong. Tại hai mép, nút được đưa vào trong khung mà đường chia vẫn ở đúng vị trí.
- Tọa độ SVG phụ thuộc trực tiếp vào vị trí: mũi tên phải → chấm tại 50% → mũi tên trái. Không dùng hướng kéo trước đó hoặc đổi icon theo ngưỡng.
- Chỉ SVG bên trong nhịp nhẹ trước lần tương tác đầu tiên. Dừng khi focus, chạm, kéo hoặc dùng bàn phím; tắt với `prefers-reduced-motion`.
- Pointer capture giữ thao tác khi con trỏ ra ngoài. Thả/hủy kết thúc thao tác, không đưa đường chia về giữa.
- `touch-action: pan-y` và ngưỡng xác định ý định giữ khả năng cuộn dọc trên điện thoại.
- Bàn phím: `←`/`→` điều chỉnh 1%, `Shift` + phím mũi tên điều chỉnh 10%; `Home`/`End` đến 0%/100%. Có vai trò slider và giá trị ARIA.
- Nút mở rộng và tên sản phẩm mở dialog riêng, tránh việc kéo vô tình mở ảnh. Dialog tiếp tục từ vị trí vừa so sánh, giữ focus bên trong, đóng bằng nút, vùng nền hoặc `Escape`, rồi trả focus về nút mở.

## Kiểm tra

```sh
npx playwright install chromium
npm test
```

Hoặc dùng Chromium đã có sẵn trên Linux:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Playwright tự khởi động Vite tại cổng 5173. Bộ kiểm tra bao gồm desktop và điện thoại mô phỏng: hình dạng SVG ở hai phía/chính giữa, kích thước nút, giữ nguyên hình học ảnh, pointer capture, bàn phím, bộ lọc, dialog/focus, giảm chuyển động, và cảm ứng qua Chromium CDP. Thử cảm ứng mô phỏng không thay thế việc kiểm tra Safari/iPhone hay thiết bị thật.

## Triển khai Cloudflare Pages

Task này **chưa xuất bản công khai**. Khi sẵn sàng:

1. Đẩy repository lên GitHub, tạo project **Cloudflare Pages → Connect to Git**.
2. Chọn repository và nhánh `main`.
3. Framework preset: **Vite** (hoặc None); root directory: để trống nếu project ở gốc repository.
4. **Build command:** `npm run build`.
5. **Build output directory:** `dist`.
6. Đặt biến build `NODE_VERSION=24` để dùng Node 24. Không cần secret hoặc biến runtime.

Có thể build tại máy rồi upload **nội dung thư mục `dist`** bằng Direct Upload của Pages. Không upload `node_modules` hoặc source thay cho `dist`. Đây là trang tĩnh với điều hướng anchor, không cần Workers, Functions hay cấu hình SPA fallback.
