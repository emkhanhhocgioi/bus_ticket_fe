"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Car, Mail, Phone, Eye, EyeOff, Users, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, loginPartner } from "@/api/auth";
import { useNotification, NotificationPopup } from "@/components/Dialog/notifiactions";
import { useAuth } from "@/context/AuthContext";

interface LoginDialogProps {
  children: React.ReactNode;
}

export default function LoginDialog({ children }: LoginDialogProps) {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [userType, setUserType] = useState<"customer" | "partner">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const { notification, showNotification, hideNotification } = useNotification();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      
      if (loginMethod === "email") {
        const { email } = formData;
        if (userType === "partner") {
          response = await loginPartner(email, formData.password);
        } else {
          response = await login(email, formData.password);
        }
        console.log("Login response:", response);
        
        // Console log token nếu có
        if (response.token) {
          console.log("Token:", response.token);
        }
        
        if (response.message === "Login successful" || response.message === "Partner login successful") {
          // Hiển thị thông báo thành công
          showNotification("success", "Hệ thống", "Đăng nhập thành công! Chào mừng bạn trở lại.");
          
          // Thêm role vào user data
          const userData = response.user || response.partner || response;
          const userWithRole = {
            ...userData,
            role: userType  // 'customer' hoặc 'partner'
          };
          
          // Sử dụng AuthContext để cập nhật trạng thái đăng nhập
          authLogin(userWithRole, response.token);
          
          // Đóng modal trước khi navigate
          setOpen(false);
          
          // Navigate đến trang chính
          if (userType === "partner") {
            console.log("Navigating to partner dashboard via email login...");
            try {
              router.push("/Dashboard");
              console.log("Navigation attempted to /Dashboard");
            } catch (error) {
              console.error("Navigation error:", error);
            }
          } else {
            router.push("/home");
          }
        }
      } else {
        const { phone } = formData;
        if (userType === "partner") {
          response = await loginPartner(phone, formData.password);
        } else {
          response = await login(phone, formData.password);
        }
        
        // Console log token nếu có
        if (response.token) {
          console.log("Token:", response.token);
        }
        
        if (response.message === "Login successful" || response.message === "Partner login successful") {
          // Hiển thị thông báo thành công
          showNotification("success", "Hệ thống", "Đăng nhập thành công! Chào mừng bạn trở lại.");
          
          // Thêm role vào user data
          const userData = response.user || response.partner || response;
          const userWithRole = {
            ...userData,
            role: userType  // 'customer' hoặc 'partner'
          };
          
          // Sử dụng AuthContext để cập nhật trạng thái đăng nhập
          authLogin(userWithRole, response.token);
          
          // Đóng modal trước khi navigate
          setOpen(false);
          
          // Navigate đến trang chính
          if (userType === "partner") {
            console.log("Navigating to partner dashboard via phone login...");
            try {
              router.push("/Dashboard");
              console.log("Navigation attempted to /Dashboard");
            } catch (error) {
              console.error("Navigation error:", error);
            }
          } else {
            router.push("/home");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      // Hiển thị thông báo lỗi
      showNotification("error", "Hệ thống", "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log("Google login");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md p-0" showCloseButton={true}>
        <div className="bg-white rounded-lg">
          {/* Header */}
          <DialogHeader className="text-center p-6 pb-4">
            <div className="flex justify-center items-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Car className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {userType === "partner" ? "Đăng nhập đối tác" : "Chào mừng trở lại"}
            </DialogTitle>
            <p className="mt-2 text-gray-600">
              {userType === "partner" 
                ? "Đăng nhập để quản lý dịch vụ của bạn" 
                : "Đăng nhập để đặt xe nhanh chóng"
              }
            </p>
          </DialogHeader>

          {/* Login Form */}
          <div className="px-6 pb-6">
            {/* User Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => setUserType("customer")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === "customer"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Khách hàng
              </button>
              <button
                onClick={() => setUserType("partner")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  userType === "partner"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                Đối tác
              </button>
            </div>

            {/* Login Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setLoginMethod("email")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "email"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "phone"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Phone className="w-4 h-4 mr-2" />
                Số điện thoại
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Phone Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {loginMethod === "email" ? "Địa chỉ email" : "Số điện thoại"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loginMethod === "email" ? (
                      <Mail className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Phone className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <Input
                    type={loginMethod === "email" ? "email" : "tel"}
                    name={loginMethod}
                    value={loginMethod === "email" ? formData.email : formData.phone}
                    onChange={handleInputChange}
                    placeholder={
                      loginMethod === "email"
                        ? "Nhập địa chỉ email của bạn"
                        : "Nhập số điện thoại của bạn"
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu của bạn"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Đăng nhập
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc</span>
                </div>
              </div>
            </div>

            {/* Google Login */}
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Đăng nhập với Google
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {userType === "partner" ? "Chưa trở thành đối tác?" : "Chưa có tài khoản?"}{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                  onClick={() => setOpen(false)}
                >
                  {userType === "partner" ? "Đăng ký đối tác" : "Đăng ký ngay"}
                </Link>
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                Bằng việc đăng nhập, bạn đồng ý với{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Chính sách bảo mật
                </Link>{" "}
                của chúng tôi.
              </p>
            </div>
          </div>
        </div>
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
