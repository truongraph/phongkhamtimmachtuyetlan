// Nhật ký cập nhật (dev log) — hiển thị trong trang quản trị (nút 🎉 trên header).
// Thêm mục MỚI NHẤT lên ĐẦU mảng. `date` dạng YYYY-MM-DD.
export interface ChangeEntry { date: string; title: string; notes: string[] }

export const CHANGELOG: ChangeEntry[] = [
  {
    date: '2026-07-03',
    title: 'Thêm 4 khối nội dung mới cho trang',
    notes: [
      'Bổ sung 4 khối có thể bật/tắt trong “Bố cục”: Câu hỏi thường gặp (FAQ), Cảm nhận bệnh nhân, Bảng giá dịch vụ, Thư viện ảnh.',
      'Vào “Bố cục” bật khối muốn dùng — khối sẽ hiện trên website và có mục riêng trong menu để chỉnh sửa.',
      'Mỗi khối đều thêm/sửa/xoá được, sửa trực tiếp trên khung xem trước (bút chì) hoặc qua form.',
      'Đã có sẵn nội dung mẫu để bạn chỉ cần sửa lại cho đúng phòng khám.',
    ],
  },
  {
    date: '2026-07-03',
    title: 'Tùy chỉnh giao diện trực quan & Chế độ tối',
    notes: [
      'Gộp “Bố cục” và “Sửa trực quan” thành một trang “Tùy chỉnh giao diện” toàn màn hình, kiểu WordPress.',
      'Sửa ngay trên khung xem trước: rê chuột vào chữ/ảnh sẽ hiện cây bút chì — bấm để sửa tại chỗ; bảng bên trái tự mở đúng phần đang sửa.',
      'Bảng điều khiển: kéo–thả sắp xếp & ẩn/hiện các phần, thêm/sửa/xoá từng mục; xem thử máy tính · máy tính bảng · điện thoại (chuyển mượt); nút ẩn bảng để xem rộng.',
      'Nút “Xuất bản” có hiệu ứng đang lưu rồi mới báo thành công; cảnh báo khôi phục nếu rời đi khi chưa xuất bản.',
      'Thêm phần “Dải số liệu” để tự sửa các con số nổi bật (năm kinh nghiệm, chứng chỉ…).',
      'Thanh thông tin đầu trang (giờ, địa chỉ, hotline) và dải kêu gọi cuối trang giờ đều sửa được trực tiếp.',
      'Thêm Chế độ Tối / Sáng cho trang quản trị (nút ☀️/🌙 trên đầu trang).',
    ],
  },
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
