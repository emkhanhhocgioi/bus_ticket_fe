"use client"

import { Button } from "@/components/ui/button"
import { Phone, User, LogOut, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import LoginDialog from "@/components/Dialog/LoginDialog"
import { useAuth } from "@/context/AuthContext"

interface NavigationBarProps {
  currentPage?: "home" | "order" | "partner" | "dashboard" | "notification" | "message" | "chatbot"
}

export default function NavigationBar({ currentPage = "home" }: NavigationBarProps) {
  const router = useRouter()
  const { isLoggedIn, user, logout } = useAuth()

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout()
    router.push("/home")
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div 
              className="text-2xl font-bold text-blue-600 cursor-pointer"
              onClick={() => router.push("/home")}
            >
              Vexere
            </div>
            <nav className="hidden lg:flex space-x-6">
              <button
                className={`transition-colors ${
                  currentPage === "home" 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => router.push("/home")}
                type="button"
              >
                Trang chủ
              </button>
              <button
                className={`transition-colors ${
                  currentPage === "order" 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => router.push("/order")}
                type="button"
              >
                Đơn hàng của tôi
              </button>
              {/* Hiển thị nút Tin nhắn chỉ khi user đã đăng nhập */}
              {isLoggedIn && (
                <button
                  className={`transition-colors ${
                    currentPage === "message" 
                      ? "text-blue-600 font-medium" 
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                  onClick={() => router.push("/message")}
                  type="button"
                >
                  Tin nhắn
                </button>
              )}
              {/* Nút Chatbot */}
              <button
                className={`transition-colors ${
                  currentPage === "chatbot" 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => router.push("/chatbot")}
                type="button"
              >
                Trợ lý ảo
              </button>
              <button
                className={`transition-colors ${
                  currentPage === "partner" 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => router.push("/partner")}
                type="button"
              >
                Trở thành đối tác
              </button>
              {/* Hiển thị nút Quản lý nhà xe chỉ khi user là partner */}
              {isLoggedIn && user?.role === 'partner' && (
                <button
                  className={`transition-colors ${
                    currentPage === "dashboard" 
                      ? "text-blue-600 font-medium" 
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                  onClick={() => router.push("/Dashboard")}
                  type="button"
                >
                  Quản lý nhà xe
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>Hotline 24/7</span>
            </div>
            
            {/* Notification Button - Only show when logged in */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                className={`relative transition-colors ${
                  currentPage === "notification" 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => router.push("/notification")}
              >
                <Bell className="w-5 h-5" />
              </Button>
            )}
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    {user?.name || user?.email || "User"}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <LoginDialog>
                <Button variant="outline" size="sm">Đăng nhập</Button>
              </LoginDialog>
            )}
            <select className="text-sm border rounded px-2 py-1 bg-white">
              <option>VN</option>
              <option>EN</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
