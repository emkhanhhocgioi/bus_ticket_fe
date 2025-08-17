import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api-gateway-cgv4.onrender.com/api";

export const createReview = async (
    reviewData: { routeId: string; userId: string; rating: number; comment?: string; images?: File[] },
    token?: string
) => {
    try {
        console.log("Creating review with data:", reviewData);
        const formData = new FormData();
        formData.append("userId", reviewData.userId);
        formData.append("routeId", reviewData.routeId);
        formData.append("rating", reviewData.rating.toString());
        if (reviewData.comment) formData.append("comment", reviewData.comment);
        
        // Handle multiple images with the correct field name
        if (reviewData.images && reviewData.images.length > 0) {
            reviewData.images.forEach((image) => {
                formData.append("images", image);
            });
        }

        const response = await axios.post(`${API_URL}/create/review`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating review:", error);
        throw error;
    }
};

export const getRouteReviews = async (routeId: string, token?: string) => {
    try {
        const response = await axios.get(`${API_URL}/route/review/${routeId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;

    } catch (error) {
        console.error("Error fetching route reviews:", error);
        throw error;
    }
};