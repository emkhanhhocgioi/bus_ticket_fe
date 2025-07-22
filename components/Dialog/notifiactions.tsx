import {CheckCircle, XCircle, AlertCircle, Info, X} from "lucide-react";
import {useState, useEffect} from "react";

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationProps {
    type: NotificationType;
    username: string;
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number; // Thời gian hiển thị (ms), mặc định 5000ms
}

const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return <CheckCircle className="h-5 w-5 text-white" />;
        case 'error':
            return <XCircle className="h-5 w-5 text-white" />;
        case 'warning':
            return <AlertCircle className="h-5 w-5 text-white" />;
        case 'info':
            return <Info className="h-5 w-5 text-white" />;
        default:
            return <Info className="h-5 w-5 text-white" />;
    }
};

const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return 'bg-green-500 border-green-600';
        case 'error':
            return 'bg-red-500 border-red-600';
        case 'warning':
            return 'bg-yellow-500 border-yellow-600';
        case 'info':
            return 'bg-blue-500 border-blue-600';
        default:
            return 'bg-gray-500 border-gray-600';
    }
};

export function NotificationPopup({ 
    type, 
    username, 
    message, 
    isVisible, 
    onClose, 
    duration = 5000 
}: NotificationProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            setIsAnimating(false);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible && !isAnimating) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div 
                className={`
                    ${getNotificationStyle(type)}
                    border rounded-lg shadow-lg p-4 min-w-[320px] max-w-[400px]
                    transform transition-all duration-300 ease-in-out
                    ${isVisible 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-full opacity-0'
                    }
                `}
            >
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        {getNotificationIcon(type)}
                    </div>
                    <div className="flex-1 text-white">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{username}</p>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm mt-1 leading-relaxed">{message}</p>
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white rounded-full transition-all ease-linear"
                        style={{
                            animation: isVisible ? `shrink ${duration}ms linear` : 'none',
                            width: isVisible ? '0%' : '100%'
                        }}
                    />
                </div>
            </div>
            
            <style jsx>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}

// Hook để quản lý notifications
export function useNotification() {
    const [notification, setNotification] = useState<{
        type: NotificationType;
        username: string;
        message: string;
        isVisible: boolean;
    } | null>(null);

    const showNotification = (type: NotificationType, username: string, message: string) => {
        setNotification({
            type,
            username,
            message,
            isVisible: true
        });
    };

    const hideNotification = () => {
        setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    };

    return {
        notification,
        showNotification,
        hideNotification
    };
}

// Component chính để hiển thị notification
export function Notifications() {
    const { notification, showNotification, hideNotification } = useNotification();

    // Demo function để test
    const showDemoNotification = () => {
        const notifications = [
            { type: 'success' as NotificationType, username: 'Hệ thống', message: 'Đặt xe thành công! Xe sẽ đến vào lúc 10:30 AM.' },
            { type: 'info' as NotificationType, username: 'Tài xế Minh', message: 'Tôi đang trên đường đến địa điểm đón bạn.' },
            { type: 'warning' as NotificationType, username: 'Hệ thống', message: 'Xe có thể bị trễ 5-10 phút do tắc đường.' },
            { type: 'error' as NotificationType, username: 'Hệ thống', message: 'Không thể kết nối với tài xế. Vui lòng thử lại.' }
        ];
        
        const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
        showNotification(randomNotif.type, randomNotif.username, randomNotif.message);
    };

    return (
        <>
            {/* Demo button */}
            <button
                onClick={showDemoNotification}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                Hiển thị thông báo demo
            </button>

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
