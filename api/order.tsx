import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:3001/api";

export interface Order {
  _id?: string;
  userId?: string;
  routeId: string;
  bussinessId: string;
  fullName: string;
  phone: string;
  email: string;
  paymentMethod: string;
  basePrice: number;
  orderStatus?: string;
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
    console.log("Fetched orders for route:", response.data);
    return response.data;
  } catch (error: any) {
    throw error;
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

export const getOrderByUserId = async (userId: string, token?: string) => {
  try {
    const headers: any = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(`${API_URL}/user/orders/${userId}`, { headers });
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch orders by user ID:", error);
    throw new Error("Failed to fetch orders by user ID");
  }
}

export const acceptOrder = async (orderId: string, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/order/accept/${orderId}`, {}, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to accept order:", error);
    throw new Error("Failed to accept order");
  }
};
export const rejectOrder = async (orderId: string, token: string) => {
  try {
    const response = await axios.put(`${API_URL}/order/reject/${orderId}`, {}, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to reject order:", error);
    throw new Error("Failed to reject order");
  }
};

export const searchOrdersByPhoneOrId = async (query: string) => {
  try {
    const response = await axios.get(`${API_URL}/passenger/${query}/tickets`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to search orders:", error);
    throw new Error("Failed to search orders");
  }
};  



export const createVNpayment = async (
  orderId: string,
  amount: number,
  orderInfo: string,
  bankCode: string,
  locale: string = 'vn',
  token: string
) => {
  try {
    const body = {
      orderId,
      amount,
      orderInfo,
      bankCode,
      locale,
    };
    const response = await axios.post(`${API_URL}/payment/create`, body, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    console.log("VN payment created successfully:", response.data);
    return response.data;
 
  } catch (error: any) {
    console.error("Failed to create VN payment:", error);
    throw new Error("Failed to create VN payment");
  }
};

// API cho thanh toán thẻ tín dụng
export const createCreditCardPayment = async (
  orderId: string,
  amount: number,
  cardInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
  },
  token: string
) => {
  try {
    const body = {
      orderId,
      amount,
      cardInfo,
      paymentMethod: 'credit_card'
    };
    const response = await axios.post(`${API_URL}/payment/credit-card`, body, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create credit card payment:", error);
    throw new Error("Failed to create credit card payment");
  }
};

// API cho chuyển khoản ngân hàng
export const createBankTransferPayment = async (
  orderId: string,
  amount: number,
  bankInfo: {
    bankCode: string;
    accountNumber?: string;
  },
  token: string
) => {
  try {
    const body = {
      orderId,
      amount,
      bankInfo,
      paymentMethod: 'bank_transfer'
    };
    const response = await axios.post(`${API_URL}/payment/bank-transfer`, body, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create bank transfer payment:", error);
    throw new Error("Failed to create bank transfer payment");
  }
};

// API cho ví điện tử
export const createEWalletPayment = async (
  orderId: string,
  amount: number,
  walletType: string,
  token: string
) => {
  try {
    const body = {
      orderId,
      amount,
      walletType,
      paymentMethod: 'e_wallet'
    };
    const response = await axios.post(`${API_URL}/payment/e-wallet`, body, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to create e-wallet payment:", error);
    throw new Error("Failed to create e-wallet payment");
  }
};


export const handleVnpayReturn = async (params: Record<string, string>) => {
  try {
    const response = await axios.get(`${API_URL}/payment/vnpay-return`, {
      params,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to handle VNPay return:", error);
    throw new Error("Failed to handle VNPay return");
  }
};