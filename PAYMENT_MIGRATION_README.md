# Payment Migration to Order Page

## Các chức năng đã migrate từ confirmation page sang order page:

### 1. Import và Dependencies
- Đã thêm import cho `createVNpayment`, `createVnpayqrcode`, `handleVnpayReturn` từ API order
- Đã thêm import `QRCode` library
- Đã thêm các icon cần thiết từ lucide-react

### 2. State Management
Đã thêm các state sau để quản lý thanh toán:
- `showQRModal`: Hiển thị modal QR code
- `qrCodeData`: Dữ liệu QR code từ API
- `qrCountdown`: Đếm ngược thời gian hết hạn QR
- `qrCodeImage`: Hình ảnh QR code đã generate
- `isSubmitting`: Trạng thái đang xử lý thanh toán
- `selectedBank`: Ngân hàng được chọn
- `paymentResult`: Kết quả thanh toán
- `isCheckingPayment`: Trạng thái đang kiểm tra kết quả thanh toán
- `showSuccessModal`: Hiển thị modal thành công
- `selectedOrderForPayment`: Order được chọn để thanh toán

### 3. Helper Functions
- `formatPrice()`: Format giá tiền theo định dạng VN
- `generateQRCodeImage()`: Tạo hình ảnh QR code từ string
- `formatCountdown()`: Format thời gian đếm ngược

### 4. useEffect Hooks
- **VNPay Return Handler**: Xử lý kết quả trả về từ VNPay
- **QR Countdown**: Đếm ngược thời gian hết hạn QR code
- **QR Expiry Time**: Tính toán thời gian hết hạn từ API
- **QR Image Generation**: Tự động tạo hình ảnh QR khi có dữ liệu

### 5. Payment Handlers
- `handlePayment()`: Xử lý thanh toán bằng QR code
- `handlePaymentWithBank()`: Xử lý thanh toán với ngân hàng cụ thể

### 6. UI Components
#### QR Modal
- Hiển thị QR code để quét
- Đếm ngược thời gian hết hạn
- Thông tin đơn hàng
- Hướng dẫn thanh toán
- Nút làm mới QR khi hết hạn
- Nút thanh toán qua website

#### Success Modal
- Thông báo thanh toán thành công
- Thông tin kết quả
- Hướng dẫn sử dụng vé

#### Payment Checking Screen
- Màn hình loading khi đang xử lý kết quả thanh toán

### 7. Integration với Order List
- **Nút thanh toán**: Hiển thị cho orders có status "confirmed" và paymentMethod "cash"
- **Loading state**: Hiển thị loading khi đang xử lý thanh toán
- **Responsive**: Hoạt động cho cả user đã login và guest lookup

## Cách sử dụng:

1. **Đối với user đã login**: 
   - Xem danh sách order trong trang order
   - Nhấn "Thanh toán" cho các order có status "confirmed"
   - Quét QR code hoặc chuyển sang website thanh toán
   - Xem kết quả thanh toán

2. **Đối với guest**: 
   - Nhập số điện thoại để tra cứu order
   - Nhấn "Thanh toán" cho các order cần thanh toán
   - Quét QR code hoặc chuyển sang website thanh toán

## Luồng thanh toán:

1. User nhấn nút "Thanh toán"
2. Gọi API `createVnpayqrcode` để tạo QR code
3. Hiển thị QR Modal với mã QR
4. User quét QR bằng app ngân hàng
5. Sau khi thanh toán, VNPay redirect về trang order với kết quả
6. `handleVnpayReturn` xử lý kết quả và hiển thị Success Modal
7. Refresh danh sách order để cập nhật trạng thái

## Lưu ý:
- QR code có thời gian hết hạn 15 phút
- Có thể làm mới QR code khi hết hạn
- Hỗ trợ cả thanh toán QR và redirect sang website VNPay
- Tự động refresh danh sách order sau khi thanh toán thành công
