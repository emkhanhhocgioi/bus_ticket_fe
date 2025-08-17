const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api-gateway-cgv4.onrender.com/api";



export const getAllSupportMessage = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/messages/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userId}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch support messages");
    }

    const data = await response.json();
    console.log("Fetched support messages:", data);
    return data;
  } catch (error) {
    console.error("Error fetching support messages:", error);
    throw error;
  }
};
