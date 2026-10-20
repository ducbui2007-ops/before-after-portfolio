/** Thay thông tin thương hiệu, liên hệ và toàn bộ sản phẩm tại đây. */
export const site = {
  companyName: "frame",
  companyNote: "Tên & nhận diện tạm cho bản demo",
  logo: null as string | null, // Ví dụ: '/images/logo.svg'
  email: null as string | null,
  phone: null as string | null, // Có mã quốc gia, ví dụ '+84…'; để null nếu chưa có.
  contactUrl: null as string | null, // Đường dẫn https:// tới kênh liên hệ thật.
  location: null as string | null,
  heroProjectId: "quiet-living",
  demo: true,
};

export const categories = [
  { id: "all", label: "Tất cả" },
  { id: "interior", label: "Nội thất" },
  { id: "exterior", label: "Ngoại thất" },
  { id: "twilight", label: "Ánh sáng chiều" },
] as const;

export interface Project {
  id: string;
  title: string;
  category: Exclude<(typeof categories)[number]["id"], "all">;
  service: string;
  before: string;
  after: string;
  beforeFilter?: string;
  afterFilter?: string;
  description: string;
  alt: string;
  demo: boolean;
}

// Bản demo dùng cùng ảnh nguồn ở hai phía + bộ lọc CSS để minh họa.
// Khi có ảnh thật, thay before/after bằng hai file riêng cùng góc chụp,
// bỏ beforeFilter/afterFilter và đổi demo thành false.
export const projects: Project[] = [
  {
    id: "quiet-living",
    title: "Khoảng lặng trong nắng",
    category: "interior",
    service: "Cân bằng sáng & màu sắc",
    before: "/images/hero.webp",
    after: "/images/hero.webp",
    beforeFilter: "brightness(.68) saturate(.66) sepia(.16)",
    description:
      "Minh họa cân bằng ánh sáng và màu sắc cho không gian sống. Hai phía được mô phỏng từ cùng một ảnh mẫu, không phải kết quả dự án khách hàng.",
    alt: "Không gian phòng khách với ánh sáng tự nhiên và nội thất tinh giản",
    demo: true,
  },
  {
    id: "open-house",
    title: "Mở ra một góc nhìn",
    category: "exterior",
    service: "Tinh chỉnh ảnh ngoại thất",
    before: "/images/exterior.webp",
    after: "/images/exterior.webp",
    beforeFilter: "brightness(.73) saturate(.55) contrast(.9)",
    description:
      "Minh họa làm rõ chi tiết kiến trúc, ánh sáng và màu sắc ngoại thất bằng bộ lọc trên cùng một ảnh mẫu.",
    alt: "Ngôi nhà hiện đại với các đường nét kiến trúc rõ ràng",
    demo: true,
  },
  {
    id: "warm-interior",
    title: "Chạm vào sự ấm áp",
    category: "interior",
    service: "Cân bằng tông màu nội thất",
    before: "/images/interior.webp",
    after: "/images/interior.webp",
    beforeFilter: "brightness(.72) saturate(.5) contrast(.95)",
    description:
      "Minh họa điều chỉnh tông màu và độ sáng trong không gian nội thất. Cùng một ảnh được dùng ở cả hai phía để giữ nguyên bố cục.",
    alt: "Không gian nội thất ấm áp với đồ gỗ và màu sắc tự nhiên",
    demo: true,
  },
  {
    id: "evening-light",
    title: "Khi ánh chiều ở lại",
    category: "twilight",
    service: "Sắc độ & ánh sáng chiều",
    before: "/images/twilight.webp",
    after: "/images/twilight.webp",
    beforeFilter: "brightness(.62) saturate(.45)",
    afterFilter: "sepia(.12) saturate(1.12)",
    description:
      "Mô phỏng tinh chỉnh sắc độ ấm của ảnh ngoại thất. Đây là minh họa bằng bộ lọc màu, không phải ví dụ chuyển ảnh ngày thành đêm.",
    alt: "Kiến trúc nhà ở với ánh sáng ấm và không gian ngoài trời",
    demo: true,
  },
];
