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
  availableSeats?: number;
  busType: string;
  licensePlate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const createRoute = async (routeData: Omit<Route, '_id' | 'createdAt' | 'updatedAt' | 'availableSeats'>, token: string) => {
  try {
    const response = await axios.post(`${API_URL}/trip/create`, routeData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create route:", error);
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

    const url = partnerId ? `${API_URL}/trip/${partnerId}` : `${API_URL}/trip`;
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch routes:", error);
    throw new Error("Failed to fetch routes");
  }
};

export const updateRoute = async (routeId: string, routeData: Partial<Route>, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/trip/update/${routeId}`, routeData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update route:", error);
    throw new Error("Failed to update route");
  }
};

export const deleteRoute = async (routeId: string, token: string) => {
  try {
    const response = await axios.delete(`${API_URL}/trip/delete/${routeId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete route:", error);
    throw new Error("Failed to delete route");
  }
};

export const searchRoutes = async (
  searchParams: { from?: string; to?: string; departureTime?: string },
  token?: string
) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Updated endpoint to match backend route
    const response = await axios.get(
      `${API_URL}/trips/search`,
      {
        params: searchParams,
        headers,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to search routes:", error);
    throw new Error("Failed to search routes");
  }
};


export  const getRouteDataById = async (routeId: string, token?: string) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/route/data/${routeId}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch route data by ID:", error);
    throw new Error("Failed to fetch route data by ID");
  }
};


export const getPopularRoutes = async (token?: string) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/popular-routes`, { headers });
    console.log("Popular routes fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch popular routes:", error);
    throw new Error("Failed to fetch popular routes");
  }
};  

