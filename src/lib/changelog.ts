// Nhật ký cập nhật (dev log) — hiển thị trong trang quản trị (nút 🎉 trên header).
// Thêm mục MỚI NHẤT lên ĐẦU mảng. `date` dạng YYYY-MM-DD.
export interface ChangeEntry { date: string; title: string; notes: string[] }

export const CHANGELOG: ChangeEntry[] = [
  {
    date: '2026-07-03',
    title: 'Đặt lịch & Email',
    notes: [
      'Nút “Đặt lịch khám” giờ mở popup ngay tại chỗ, không phải cuộn lên đầu trang.',
      'Nhận đặt lịch qua Gmail (SMTP) cấu hình bằng giao diện, có nút “Gửi thử”.',
      'Thiết kế lại email báo đặt lịch: bố cục thẻ đẹp, màu theo bộ màu thương hiệu.',
      'Header dạng kính mờ khi cuộn; thêm nút “Lên đầu trang” và nút gọi hotline nổi.',
      'Thêm “Trang chủ” vào menu; logo hiển thị to & gọn hơn.',
    ],
  },
  {
    date: '2026-07-02',
    title: 'Giao diện & màu sắc',
    notes: [
      '20 mẫu giao diện được làm khác biệt rõ (kiểu thẻ, biểu tượng, nền, nhãn tiêu đề riêng).',
      'Xem trước mẫu giao diện dạng popup: máy tính · máy tính bảng · điện thoại.',
      'Bộ màu 3 tông: màu chính · phụ · đỏ — đổi màu là toàn site đổi theo.',
      'Sửa lỗi “đã lưu vẫn báo chưa lưu”; kéo–thả bố cục áp dụng ngay lập tức.',
      'Thêm “Ghi nhớ đăng nhập” ở trang đăng nhập.',
    ],
  },
]
