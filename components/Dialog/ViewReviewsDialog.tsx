"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, MessageCircle, User, Calendar, Image as ImageIcon } from "lucide-react";
import { getRouteReviews } from "@/api/review";
import { useAuth } from "@/context/AuthContext";

interface Review {
  _id: string;
  userId: {
    _id: string;
    name?: string;
    email?: string;
  };
  routeId: string;
  rating: number;
  comment?: string;
  images?: string[];
  isActive: boolean;
  isApproved: boolean;
  timeCreate: string;
  updatedAt: string;
  __v: number;
}

interface ReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    statistics: {
      averageRating: number;
      totalReviews: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      limit: number;
    };
  };
}

interface ViewReviewsDialogProps {
  children: React.ReactNode;
  routeId: string;
  routeName?: string;
}

export default function ViewReviewsDialog({ 
  children, 
  routeId, 
  routeName 
}: ViewReviewsDialogProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<{averageRating: number; totalReviews: number} | null>(null);
  const [pagination, setPagination] = useState<{currentPage: number; totalPages: number; totalReviews: number; limit: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!routeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response: ReviewsResponse = await getRouteReviews(routeId, token || undefined);
      if (response?.success && response.data) {
        setReviews(response.data.reviews || []);
        setStatistics(response.data.statistics || null);
        setPagination(response.data.pagination || null);
      } else {
        setReviews([]);
        setStatistics(null);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Không thể tải đánh giá. Vui lòng thử lại.");
      setReviews([]);
      setStatistics(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchReviews();
    }
  }, [open, routeId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Rất tệ";
      case 2: return "Tệ";
      case 3: return "Bình thường";
      case 4: return "Tốt";
      case 5: return "Rất tốt";
      default: return "";
    }
  };

  const calculateAverageRating = () => {
    if (statistics) {
      return statistics.averageRating;
    }
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getAverageRatingText = () => {
    return calculateAverageRating().toFixed(1);
  };

  const getTotalReviews = () => {
    return statistics ? statistics.totalReviews : reviews.length;
  };

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Đánh giá chuyến xe</span>
          </DialogTitle>
          {routeName && (
            <p className="text-sm text-gray-600 mt-1">{routeName}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={fetchReviews}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Thử lại
              </Button>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có đánh giá
              </h3>
              <p className="text-gray-600">
                Hãy là người đầu tiên đánh giá chuyến xe này!
              </p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <>
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {getAverageRatingText()}
                      </div>
                      <StarRating rating={Math.round(calculateAverageRating())} />
                      <div className="text-sm text-gray-600 mt-1">
                        {getTotalReviews()} đánh giá
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 ml-8">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviews.filter(r => r.rating === rating).length;
                      const totalReviews = getTotalReviews();
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center space-x-2 mb-1">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews
                  .filter(review => review.isActive && review.isApproved) // Only show approved and active reviews
                  .map((review) => (
                  <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {review.userId?.name || review.userId?.email || "Người dùng ẩn danh"}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <StarRating rating={review.rating} />
                              <span className="text-sm text-gray-600">
                                {getRatingText(review.rating)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(review.timeCreate)}
                          </div>
                        </div>
                        
                        {review.comment && (
                          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        
                        {review.images && review.images.length > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {review.images.length} hình ảnh
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {review.images.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review image ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => window.open(image, '_blank')}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ))}
                              {review.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center cursor-pointer hover:bg-gray-200">
                                  <span className="text-xs text-gray-600">
                                    +{review.images.length - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination info */}
              {pagination && pagination.totalPages > 1 && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  Trang {pagination.currentPage} / {pagination.totalPages} 
                  ({pagination.totalReviews} đánh giá)
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
