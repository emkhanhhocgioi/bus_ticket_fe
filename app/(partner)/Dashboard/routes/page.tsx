"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Toast, useToast } from "@/components/ui/toast";
import {createRoute, getRoutes, updateRoute, deleteRoute} from "@/api/routes";


// Mock data interface
interface Route {
  _id: string;
  routeCode: string;
  partnerId: string;
  from: string;
  to: string;
  departureTime: string;
  duration: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  busType: string;
  licensePlate: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

// Mock routes data
const mockRoutes: Route[] = [
  {
    _id: "1",
    routeCode: "HN-DN-001",
    partnerId: "partner1",
    from: "Hà Nội",
    to: "Đà Nẵng",
    departureTime: "08:00",
    duration: "12 giờ",
    price: 450000,
    totalSeats: 45,
    availableSeats: 30,
    busType: "Ghế ngồi",
    licensePlate: "29A-12345",
    description: "Tuyến xe khách chất lượng cao, có wifi và điều hòa"
  },
  {
    _id: "2",
    routeCode: "HCM-NT-002",
    partnerId: "partner1",
    from: "TP. Hồ Chí Minh",
    to: "Nha Trang",
    departureTime: "14:30",
    duration: "8 giờ",
    price: 320000,
    totalSeats: 40,
    availableSeats: 25,
    busType: "Giường nằm",
    licensePlate: "50A-67890",
    description: "Xe giường nằm cao cấp, phục vụ suất ăn nhẹ"
  },
  {
    _id: "3",
    routeCode: "HN-HUE-003",
    partnerId: "partner1",
    from: "Hà Nội",
    to: "Huế",
    departureTime: "20:00",
    duration: "10 giờ",
    price: 380000,
    totalSeats: 35,
    availableSeats: 0,
    busType: "Ghế ngồi",
    licensePlate: "30B-11111",
    description: "Tuyến đường về miền Trung, ghế ngồi thoải mái"
  },
  {
    _id: "4",
    routeCode: "HCM-DL-004",
    partnerId: "partner1",
    from: "TP. Hồ Chí Minh",
    to: "Đà Lạt",
    departureTime: "06:00",
    duration: "6 giờ",
    price: 290000,
    totalSeats: 32,
    availableSeats: 18,
    busType: "Limousine",
    licensePlate: "51C-22222",
    description: "Tuyến lên Đà Lạt, phong cảnh đẹp"
  },
  {
    _id: "5",
    routeCode: "DN-QN-005",
    partnerId: "partner1",
    from: "Đà Nẵng",
    to: "Quy Nhon",
    departureTime: "09:30",
    duration: "5 giờ",
    price: 250000,
    totalSeats: 38,
    availableSeats: 28,
    busType: "Ghế ngồi",
    licensePlate: "43D-33333",
    description: "Tuyến duyên hải miền Trung"
  }
];

export default function RouteManagement() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const [routes, setRoutes] = useState<Route[]>(mockRoutes);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    routeCode: "",
    partnerId: "",
    from: "",
    to: "",
    departureTime: "",
    duration: "",
    price: "",
    totalSeats: "",
    availableSeats: "",
    busType: "",
    licensePlate: "",
    description: "",
  });

  useEffect(() => {
    fetchRoutes();
  }, [user, token]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        partnerId: user.id || "",
      }));
    }
  }, [user]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      
      if (!token || !user?.id) {
        console.log("No token or user ID available, using mock data");
        setRoutes(mockRoutes);
        return;
      }
      
      console.log("Fetching routes for partnerId:", user.id);
      const response = await getRoutes(user.id, token);
      console.log("Raw API response:", response);
      
      if (response && response.data && Array.isArray(response.data)) {
        setRoutes(response.data);
        console.log("Fetched routes:", response.data);
      } else if (response && Array.isArray(response)) {
        // Trường hợp API trả về array trực tiếp thay vì wrapped trong data
        setRoutes(response);
        console.log("Fetched routes (direct array):", response);
      } else {
        // Fallback to mock data if no routes returned
        setRoutes(mockRoutes);
        showToast("info", "Thông báo", "Chưa có tuyến đường nào, hiển thị dữ liệu mẫu");
      }
    } catch (error) {
      console.error("Failed to fetch routes:", error);
      // Fallback to mock data on error
      setRoutes(mockRoutes);
      showToast("error", "Lỗi", "Không thể tải danh sách tuyến đường, hiển thị dữ liệu mẫu");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      routeCode: "",
      partnerId: user?.id || "",
      from: "",
      to: "",
      departureTime: "",
      duration: "",
      price: "",
      totalSeats: "",
      availableSeats: "",
      busType: "",
      licensePlate: "",
      description: "",
    });
    setEditingRoute(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      showToast("error", "Lỗi", "Bạn cần đăng nhập để thực hiện thao tác này");
      return;
    }
    
    try {
      setLoading(true);
      
      const requiredFields = [
        "routeCode",
        "partnerId",
        "from",
        "to",
        "departureTime",
        "duration",
        "price",
        "totalSeats",
        "busType",
        "licensePlate",
        "description",
      ];

      // Chỉ check availableSeats khi đang edit
      if (editingRoute) {
        requiredFields.push("availableSeats");
      }

      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData].toString().trim() === "") {
          showToast("error", "Thiếu thông tin", `Vui lòng nhập đầy đủ trường: ${field}`);
          return;
        }
      }

      // Chuẩn bị dữ liệu để gửi API
      const routeData = {
        routeCode: formData.routeCode,
        partnerId: formData.partnerId,
        from: formData.from,
        to: formData.to,
        departureTime: formData.departureTime,
        duration: formData.duration,
        price: parseFloat(formData.price),
        totalSeats: parseInt(formData.totalSeats),
        busType: formData.busType,
        licensePlate: formData.licensePlate,
        description: formData.description,
        // Chỉ thêm availableSeats khi update, không thêm khi create
        ...(editingRoute && { availableSeats: parseInt(formData.availableSeats) }),
      };

      console.log("Sending route data:", routeData);
      
      let response;
      if (editingRoute) {
        // Update existing route
        response = await updateRoute(editingRoute._id!, routeData, token);
        console.log("Update API Response:", response);
        
        if (response) {
          console.log("Route updated successfully:", response);
          showToast("success", "Thành công", "Đã cập nhật tuyến đường thành công");
        }
      } else {
        // Create new route
        response = await createRoute(routeData, token);
        console.log("Create API Response:", response);
        
        if (response) {
          console.log("Route created successfully:", response);
          showToast("success", "Thành công", "Đã tạo tuyến đường mới thành công");
        }
      }
      
      if (response) {
        // Reset form và đóng dialog
        resetForm();
        setIsDialogOpen(false);
        
        // Gọi lại fetchRoutes để lấy dữ liệu mới nhất từ server
        await fetchRoutes();
      }
    } catch (error) {
      console.error("Failed to create/update route:", error);
      const action = editingRoute ? "cập nhật" : "tạo";
      showToast("error", "Lỗi", `Có lỗi xảy ra khi ${action} tuyến đường. Vui lòng thử lại.`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      routeCode: route.routeCode,
      partnerId: route.partnerId,
      from: route.from,
      to: route.to,
      departureTime: route.departureTime,
      duration: route.duration,
      price: route.price.toString(),
      totalSeats: route.totalSeats.toString(),
      availableSeats: route.availableSeats.toString(),
      busType: route.busType,
      licensePlate: route.licensePlate,
      description: route.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (routeId: string) => {
    if (!token) {
      showToast("error", "Lỗi", "Bạn cần đăng nhập để thực hiện thao tác này");
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa tuyến đường này?")) {
      try {
        await deleteRoute(routeId, token);
        
        // Remove route from state
        const updatedRoutes = routes.filter(route => route._id !== routeId);
        setRoutes(updatedRoutes);
        showToast("success", "Thành công", "Đã xóa tuyến đường");
      } catch (error) {
        console.error("Failed to delete route:", error);
        showToast("error", "Lỗi", "Có lỗi xảy ra khi xóa tuyến đường");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('vi-VN');
  };

  const handleRouteClick = (routeId: string) => {
    router.push(`/Dashboard/order/${routeId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tuyến đường</h1>
          <p className="text-gray-600 mt-2">Quản lý các tuyến đường và lịch trình của bạn</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm tuyến đường
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRoute ? "Chỉnh sửa tuyến đường" : "Thêm tuyến đường mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="routeCode">Mã tuyến đường</Label>
                  <Input
                    id="routeCode"
                    name="routeCode"
                    value={formData.routeCode}
                    onChange={handleInputChange}
                    placeholder="VD: HN-DN-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="partnerId">ID Đối tác</Label>
                  <Input
                    id="partnerId"
                    name="partnerId"
                    value={formData.partnerId}
                    onChange={handleInputChange}
                    placeholder="ID của đối tác"
                    required
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from">Điểm xuất phát</Label>
                  <Input
                    id="from"
                    name="from"
                    value={formData.from}
                    onChange={handleInputChange}
                    placeholder="VD: Hà Nội"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="to">Điểm đến</Label>
                  <Input
                    id="to"
                    name="to"
                    value={formData.to}
                    onChange={handleInputChange}
                    placeholder="VD: Đà Nẵng"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departureTime">Giờ khởi hành</Label>
                  <Input
                    id="departureTime"
                    name="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    placeholder="VD: 08:00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Thời gian di chuyển</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="VD: 12 giờ"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Giá vé (VNĐ)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="500000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalSeats">Tổng số ghế</Label>
                  <Input
                    id="totalSeats"
                    name="totalSeats"
                    type="number"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    placeholder="45"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="availableSeats">Ghế trống</Label>
                  <Input
                    id="availableSeats"
                    name="availableSeats"
                    type="number"
                    value={formData.availableSeats}
                    onChange={handleInputChange}
                    placeholder="45"
                    required={!!editingRoute}
                    disabled={!editingRoute}
                  />
                  {!editingRoute && (
                    <p className="text-sm text-gray-500 mt-1">
                      Sẽ được tự động đặt bằng tổng số ghế khi tạo mới
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="busType">Loại xe</Label>
                  <Input
                    id="busType"
                    name="busType"
                    value={formData.busType}
                    onChange={handleInputChange}
                    placeholder="VD: Ghế ngồi, Giường nằm, Limousine"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licensePlate">Biển số xe</Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    placeholder="VD: 29A-12345"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả về tuyến đường, tiện ích..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingRoute ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng tuyến đường</p>
              <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Tổng ghế</p>
              <p className="text-2xl font-bold text-gray-900">
                {routes.reduce((sum, route) => sum + route.totalSeats, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ghế trống</p>
              <p className="text-2xl font-bold text-gray-900">
                {routes.reduce((sum, route) => sum + route.availableSeats, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Giá trung bình</p>
              <p className="text-2xl font-bold text-gray-900">
                {routes.length > 0 
                  ? formatCurrency(routes.reduce((sum, route) => sum + route.price, 0) / routes.length)
                  : formatCurrency(0)
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách tuyến đường</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : routes.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500">Chưa có tuyến đường nào</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã tuyến</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Giờ khởi hành</TableHead>
                  <TableHead>Thời gian di chuyển</TableHead>
                  <TableHead>Giá vé</TableHead>
                  <TableHead>Ghế</TableHead>
                  <TableHead>Loại xe</TableHead>
                  <TableHead>Biển số xe</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow 
                    key={route._id} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRouteClick(route._id)}
                  >
                    <TableCell className="font-medium">{route.routeCode}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        {route.from} → {route.to}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        {route.departureTime}
                      </div>
                    </TableCell>
                    <TableCell>{route.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                        {formatCurrency(route.price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        {route.availableSeats}/{route.totalSeats}
                      </div>
                    </TableCell>
                    <TableCell>{route.busType}</TableCell>
                    <TableCell>{route.licensePlate}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        route.availableSeats > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {route.availableSeats > 0 ? 'Còn chỗ' : 'Hết chỗ'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(route);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(route._id!);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
