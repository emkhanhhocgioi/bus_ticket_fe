import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api-gateway-cgv4.onrender.com/api";


export async function chatBot(message: string) {
    try {
        const response = await axios.post(`${API_URL}/chatbot`, { query: message });
        console.log("ChatBot response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in chatBot:", error);
        throw error;
    }
};

