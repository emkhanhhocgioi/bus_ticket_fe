"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Mail, Phone, User, Lock, Eye, EyeOff } from "lucide-react";
import { register } from "@/api/auth";
import { NotificationPopup } from "@/components/Dialog/notifiactions";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [notif, setNotif] = useState({
    type: "error",
    username: "",
    message: "",
    isVisible: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic đăng ký ở đây
    console.log("Registration data:", formData);
    if(formData.password !== formData.confirmPassword) {
      setNotif({
        type: 'error',
        username: formData.name,
        message: "Mật khẩu không khớp, vui lòng kiểm tra lại.",
        isVisible: true,
      });
      return;
    } else {
      const response = await register(formData.name, formData.email, formData.phone, formData.password);
      if(response.status === 200) {
        setNotif({
          type: 'success',
          username: formData.name,
          message: "Đăng ký thành công! Vui lòng đăng nhập.",
          isVisible: true,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="flex items-center gap-3 mb-8">
            <Car className="w-12 h-12" />
            <h1 className="text-4xl font-bold">CarBooking</h1>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Đặt xe dễ dàng, di chuyển tiện lợi
          </h2>
          <p className="text-lg text-center text-blue-100 max-w-md">
            Tham gia cùng hàng ngàn người dùng đã tin tướng chọn chúng tôi cho mọi chuyến đi
          </p>
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
              <Car className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-foreground">CarBooking</h1>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Đăng ký tài khoản</h2>
            <p className="mt-2 text-muted-foreground">
              Tạo tài khoản để bắt đầu đặt xe ngay hôm nay
            </p>
          </div>

          {/* Đăng ký tài khoản - chỉ còn 1 trường account */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="fullName"
                  name="name"
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu mạnh"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Chính sách bảo mật
                </Link>
              </label>
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full h-11 text-base font-semibold">
              Tạo tài khoản
            </Button>
          </form>

          {/* Social registration */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">Hoặc đăng ký với</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-11" type="button">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng ký với Google
            </Button>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
      <NotificationPopup
        type={notif.type as any}
        username={notif.username}
        message={notif.message}
        isVisible={notif.isVisible}
        onClose={() => setNotif(n => ({ ...n, isVisible: false }))}
      />
    </div>
  );
}