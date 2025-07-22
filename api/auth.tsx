import axios from "axios";


const API_URL = process.env.API_URL || "http://localhost:3001/api";

export const login = async (loginparam: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            loginparam,
            password,
        });
        return response.data;
    } catch (error) {
        throw new Error("Login failed");
    }
};

export const register = async (name: string, email: string, phone: string, password: string) => {
    try {
        const   items = {
            name: name || "",
            email: email || "",
            phone: phone || "",
            password: password || "",
        };
        const response = await axios.post(`${API_URL}/createuser`, items,{
            headers: {
                "Content-Type": "application/json",
            },  
        });
        return response.data;
    } catch (error) {
        throw new Error("Registration failed");
    }
};

export const createPartner = async (
    company: string,
    email: string,
    phone: string,
    address: string,
    password: string,
    vehicleCount: number = 0,
    description: string = "",
    operatingYears: number = 0,
    businessLicense: string = "",
    website: string = "",
    routes: string = ""
) => {
    try {
        const items = {
            company: company || "",
            email: email || "",
            phone: phone || "",
            address: address || "",
            password: password || "",
            vehicleCount: vehicleCount || 0,
            description: description || "",
            operatingYears: operatingYears || 0,
            businessLicense: businessLicense || "",
            website: website || "",
            routes: routes || ""
        };

        const response = await axios.post(`${API_URL}/create/partner`, items, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating partner:", error);
        throw new Error("Failed to create partner");
    }
};
 