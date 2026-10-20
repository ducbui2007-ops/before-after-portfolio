# Ảnh minh họa / Demo images

Cả bốn ảnh được tạo bằng công cụ image generation cho bản demo này. Đây là các cảnh tổng hợp bằng AI, **không phải dự án khách hàng**, ảnh thật của công ty hay bằng chứng kết quả dịch vụ.

| File | Nội dung | Kích thước |
| --- | --- | --- |
| `hero.webp` | Phòng khách tối giản, sofa kem, gỗ sồi, cửa kính và ánh sáng chiều | 1536 × 1024 |
| `interior.webp` | Phòng ngủ gỗ sồi, vải linen và ánh sáng tự nhiên | 1536 × 1024 |
| `exterior.webp` | Ngoại thất biệt thự đương đại ban ngày | 1536 × 1024 |
| `twilight.webp` | Biệt thự hiện đại và hồ nước lúc chạng vạng | 1536 × 1024 |

Mỗi cặp Before/After dùng **cùng một file ảnh, cùng kích thước và cùng bố cục**, với CSS filter mô phỏng thay đổi sáng/màu. Không ghép hai căn nhà khác nhau thành một cặp chỉnh sửa; không mô phỏng thay đổi hình học, xóa vật thể hay thay bầu trời. Hãy thay bằng các cặp ảnh thực tế được phép sử dụng khi có dữ liệu công ty.

Các file được lưu cục bộ, mã hóa WebP để giảm dung lượng, không thay đổi bố cục/nội dung; website không phụ thuộc dịch vụ ảnh ngoài hoặc khóa API lúc chạy. PNG gốc được giữ trong `/workspace/generated_images` của môi trường phát triển, không cần đưa vào bản build.
