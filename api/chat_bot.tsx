import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api-gateway-cgv4.onrender.com/api";


export async function chatBot(message: string) {
    try {
        const response = await axios.get(`${API_URL}/chatbot/${message}`);
        console.log("ChatBot response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in chatBot:", error);
        throw error;
    }
};

