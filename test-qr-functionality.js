// Test QR code functionality
const testQrString = "VNPAY|2.1.0|pay|JZH20A58|25625000|6898a590d0343f8b7ef31199|Thanh%2Bto%25C3%25A1n%2Bv%25C3%25A9%2Bxe%2BQu%25E1%25BA%25A3ng%2BB%25C3%25ACnh%2B-%2B%25C4%2590%25C3%25A0%2BN%25E1%25B5ng%2B-%2BL%25C3%25AA%2BVinh%2BKh%25C3%25A1nh|20250810205840|99c32361e80f0314ee4b132ede2f7dcea24f6462b228785d521715d2fe6b810dc11cbf750ba72b148cc051ee0b07b3cafd0e7f12c0c5474d54900342a5fe61e5";

const testApiResponse = {
    "success": true,
    "message": "QR payment created successfully",
    "data": {
        "orderId": "6898a590d0343f8b7ef31199",
        "amount": 256250,
        "orderInfo": "Thanh toán vé xe Quảng Bình - Đà Nẵng - Lê Vinh Khánh",
        "clientIP": "127.0.0.1",
        "expiryTime": "2025-08-10T14:13:40.645Z",
        "qrString": testQrString,
        "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=25625000&vnp_BankCode=VNPAYQR&vnp_Command=pay&vnp_CreateDate=20250810205840&vnp_CurrCode=VND&vnp_ExpireDate=20250810211340&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+to%C3%A1n+v%C3%A9+xe+Qu%E1%BA%A3ng+B%C3%ACnh+-+%C4%90%C3%A0+N%E1%BA%B5ng+-+L%C3%AA+Vinh+Kh%C3%A1nh&vnp_OrderType=other&vnp_PaymentType=qr&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2FpaymentReturn&vnp_TmnCode=JZH20A58&vnp_TxnRef=6898a590d0343f8b7ef31199&vnp_Version=2.1.0&vnp_SecureHash=99c32361e80f0314ee4b132ede2f7dcea24f6462b228785d521715d2fe6b810dc11cbf750ba72b148cc051ee0b07b3cafd0e7f12c0c5474d54900342a5fe61e5",
        "expiryMinutes": 15,
        "createdAt": "2025-08-10T13:58:40.645Z"
    }
};

console.log("Testing QR functionality...");
console.log("QR String length:", testQrString.length);
console.log("Amount (VND cents):", testApiResponse.data.amount);
console.log("Amount (VND):", testApiResponse.data.amount / 100);
console.log("Expiry time:", testApiResponse.data.expiryTime);
console.log("Order ID:", testApiResponse.data.orderId);
console.log("Payment URL available:", !!testApiResponse.data.paymentUrl);
