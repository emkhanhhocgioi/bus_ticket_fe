import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

export interface Order {
  _id?: string;
  routeId: string;
  seatNumber: string;
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: string;
  basePrice: number;
  createdAt?: string;
  updatedAt?: string;
}

export const createOrder = async (orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>, token?: string) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_URL}/order/create`, orderData, { headers });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create order:", error);
    throw new Error("Failed to create order");
  }
};

export const getOrderByRouteId = async (routeId: string, token?: string) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/order/route/${routeId}`, { headers });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch order by route ID:", error);
    throw new Error("Failed to fetch order by route ID");
  }
}

export const getAllOrdersByPartner = async (partnerId: string, token?: string) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/order/partner/${partnerId}`, { headers });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch orders by partner ID:", error);
    throw new Error("Failed to fetch orders by partner ID");
  }
}