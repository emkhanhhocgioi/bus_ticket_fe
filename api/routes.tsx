import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

export interface Route {
  _id?: string;
  routeCode: string;
  partnerId: string;
  from: string;
  to: string;
  departureTime: string;
  duration: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createRoute = async (routeData: Omit<Route, '_id' | 'createdAt' | 'updatedAt'>, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/trip/create`, routeData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to create route");
  }
};

export const getRoutes = async (partnerId?: string, token?: string) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = partnerId ? `${API_URL}/routes?partnerId=${partnerId}` : `${API_URL}/routes`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch routes");
  }
};

export const updateRoute = async (routeId: string, routeData: Partial<Route>, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/routes/${routeId}`, routeData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to update route");
  }
};

export const deleteRoute = async (routeId: string, token: string) => {
  try {
    const response = await axios.delete(`${API_URL}/routes/${routeId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete route");
  }
};
