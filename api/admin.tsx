import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api-gateway-cgv4.onrender.com/api";

const ADMIN_URL = `${API_URL}/admin`;


// Helper: Lấy token từ localStorage
const getAdminToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken");
  }
  return null;
};

// Helper: Tạo config header có token
const getAuthConfig = () => {
  const token = getAdminToken();
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

// Admin authentication
export const adminLogin = async (credentials: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${ADMIN_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createAdmin = async (adminData: any) => {
  try {
    const response = await axios.post(`${ADMIN_URL}/create`, adminData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Dashboard
export const getDashboard = async () => {
  try {
    const response = await axios.get(`${ADMIN_URL}/dashboard`, getAuthConfig());
    console.log("Dashboard data:", response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// User Management
export const getUsers = async (queryParams?: Record<string, any>) => {
  try {
    const queryString = queryParams ? new URLSearchParams(queryParams).toString() : '';
    const url = `${ADMIN_URL}/users${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserById = async (userId: string) => {
  try {
    const response = await axios.get(`${ADMIN_URL}/users/${userId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserStatus = async (userId: string, statusData: any) => {
  try {
    const response = await axios.patch(`${ADMIN_URL}/users/${userId}/status`, statusData, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await axios.delete(`${ADMIN_URL}/users/${userId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getPartners = async (queryParams?: Record<string, any>) => {
  try {
    const queryString = queryParams ? new URLSearchParams(queryParams).toString() : '';
    const url = `${ADMIN_URL}/partners${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPartnerById = async (partnerId: string) => {
  try {
    const response = await axios.get(`${ADMIN_URL}/partners/${partnerId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyPartner = async (partnerId: string, verificationData: any) => {
  try {
    const response = await axios.patch(`${ADMIN_URL}/partners/${partnerId}/verify`, verificationData, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Order Management
export const getOrders = async (queryParams?: Record<string, any>) => {
  try {
    const queryString = queryParams ? new URLSearchParams(queryParams).toString() : '';
    const url = `${ADMIN_URL}/orders${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrderById = async (orderId: string) => {
  try {
    const response = await axios.get(`${ADMIN_URL}/orders/${orderId}`, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Review Management
export const getReviews = async (queryParams?: Record<string, any>) => {
  try {
    const queryString = queryParams ? new URLSearchParams(queryParams).toString() : '';
    const url = `${ADMIN_URL}/reviews${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const approveReview = async (reviewId: string, approvalData: any) => {
  try {
    const response = await axios.patch(`${ADMIN_URL}/reviews/${reviewId}/approve`, approvalData, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Route Management
export const getRoutes = async (queryParams?: Record<string, any>) => {
  try {
    const queryString = queryParams ? new URLSearchParams(queryParams).toString() : '';
    const url = `${ADMIN_URL}/routes${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateRouteStatus = async (routeId: string, statusData: any) => {
  try {
    const response = await axios.patch(`${ADMIN_URL}/routes/${routeId}/status`, statusData, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Ticket Management
export const getTickets = async (queryParams?: Record<string, any>) => {
  try {
    const queryString = queryParams ? new URLSearchParams(queryParams).toString() : '';
    const url = `${ADMIN_URL}/tickets${queryString ? `?${queryString}` : ''}`;
    const response = await axios.get(url, getAuthConfig());
    return response.data;
  } catch (error) {
    throw error;
  }
};
