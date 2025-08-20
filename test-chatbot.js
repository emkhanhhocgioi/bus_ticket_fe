// Simple test for chatbot API
const axios = require('axios');

const API_URL = "https://api-gateway-cgv4.onrender.com/api";

async function testChatbot() {
    try {
        console.log('Testing chatbot API...');
        const response = await axios.get(`${API_URL}/chatbot/xe từ Đà Nẵng đi Quảng Bình`);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testChatbot();
