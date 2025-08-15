"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, Upload, X } from "lucide-react";
import { createReview } from "@/api/review";
import { useAuth } from "@/context/AuthContext";
import { useNotification, NotificationPopup } from "@/components/Dialog/notifiactions";

interface ReviewDialogProps {
  children: React.ReactNode;
  routeId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewDialog({ 
  children, 
  routeId, 
  onReviewSubmitted 
}: ReviewDialogProps) {
  const { user, token } = useAuth();
  const { notification, showNotification, hideNotification } = useNotification();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("error", "Hệ thống", "Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      
      // Kiểm tra định dạng file
      if (!file.type.startsWith('image/')) {
        showNotification("error", "Hệ thống", "Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setSelectedImage(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      showNotification("error", "Hệ thống", "Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (rating === 0) {
      showNotification("error", "Hệ thống", "Vui lòng chọn số sao đánh giá");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        routeId,
        userId: user.id,
        rating,
        comment: comment.trim() || undefined,
        images: selectedImage ? [selectedImage] : undefined,
      };

      await createReview(reviewData, token || undefined);
      
      showNotification("success", "Hệ thống", "Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được gửi thành công.");
      
      // Reset form
      setRating(0);
      setHoverRating(0);
      setComment("");
      setSelectedImage(null);
      setImagePreview(null);
      setOpen(false);
      
      // Callback để refresh danh sách review
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error("Error creating review:", error);
      showNotification("error", "Hệ thống", "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-colors"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 && (
            <>
              {rating === 1 && "Rất tệ"}
              {rating === 2 && "Tệ"}
              {rating === 3 && "Bình thường"}
              {rating === 4 && "Tốt"}
              {rating === 5 && "Rất tốt"}
            </>
          )}
        </span>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-lg" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Đánh giá chuyến đi
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Chia sẻ trải nghiệm của bạn để giúp những hành khách khác
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Đánh giá của bạn *
              </label>
              <StarRating />
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhận xét (tùy chọn)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {comment.length}/500
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh (tùy chọn)
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Thêm hình ảnh về chuyến đi
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                      Chọn file
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG tối đa 5MB
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notification popup */}
      {notification && (
        <NotificationPopup
          type={notification.type}
          username={notification.username}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      )}
    </>
  );
}