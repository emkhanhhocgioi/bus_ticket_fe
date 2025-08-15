import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

interface ToastProps {
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  isVisible: boolean
  onClose: () => void
}

export function Toast({ type, title, message, isVisible, onClose }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  }

  const Icon = icons[type]

  return (
    <div className="animate-in slide-in-from-top-2">
      <div
        className={cn(
          "max-w-sm w-full border rounded-lg p-4 shadow-lg",
          colors[type]
        )}
      >
        <div className="flex items-start">
          <Icon className={cn("h-5 w-5 mt-0.5 mr-3 flex-shrink-0", iconColors[type])} />
          <div className="flex-1">
            <h4 className="font-medium">{title}</h4>
            {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<{
    type: "success" | "error" | "warning" | "info"
    title: string
    message?: string
    isVisible: boolean
  } | null>(null)

  const showToast = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string
  ) => {
    setToast({ type, title, message, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null)
  }

  return {
    toast,
    showToast,
    hideToast,
  }
}
