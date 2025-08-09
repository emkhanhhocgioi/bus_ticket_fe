const axios = require('axios');

const API_URL = "http://localhost:3001/api";

// Test the VNPay payment creation endpoint
async function testVNPayEndpoint() {
  try {
    console.log('Testing VNPay payment creation endpoint...');
    console.log('URL:', `${API_URL}/payment/create`);
    
    const testData = {
      orderId: "674d6b8a5f123456789abcde", // Sample ObjectId format
      amount: 150000,
      orderInfo: "Thanh toán vé xe Hà Nội - Hồ Chí Minh - Nguyen Van A",
      bankCode: "VNPAYQR",
      locale: "vn"
    };
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${API_URL}/payment/create`, testData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token-123",
      },
    });
    
    console.log('SUCCESS Response:', response.data);
    return response.data;
    
  } catch (error) {
    console.log('ERROR Response:');
    if (error.response) {
      // Server responded with error status
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      // Request was made but no response received
      console.log('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.log('Error message:', error.message);
    }
  }
}

// Test different scenarios
async function runTests() {
  console.log('=== VNPay API Endpoint Test ===\n');
  
  // Test 1: Basic request
  console.log('Test 1: Basic VNPay request with QR code');
  await testVNPayEndpoint();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Different bank codes
  const bankCodes = ['VNBANK', 'VIETCOMBANK', 'BIDV', 'AGRIBANK', 'TECHCOMBANK'];
  
  for (const bankCode of bankCodes) {
    console.log(`Test with bank code: ${bankCode}`);
    try {
      const testData = {
        orderId: "674d6b8a5f123456789abcde",
        amount: 200000,
        orderInfo: `Test payment with ${bankCode}`,
        bankCode: bankCode,
        locale: "vn"
      };
      
      const response = await axios.post(`${API_URL}/payment/create`, testData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer test-token-123",
        },
      });
      
      console.log(`✓ ${bankCode}: Success`);
      if (response.data.paymentUrl) {
        console.log(`  Payment URL: ${response.data.paymentUrl.substring(0, 80)}...`);
      }
      
    } catch (error) {
      console.log(`✗ ${bankCode}: Error -`, error.response?.data?.message || error.message);
    }
    console.log('');
  }
}

runTests().catch(console.error);
