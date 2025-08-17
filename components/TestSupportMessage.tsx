"use client";

import { useState } from "react";
import { useWebSocketHelpers } from "@/context/WebSocketContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function TestSupportMessage() {
  const { sendSupportMessage } = useWebSocketHelpers();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() || !partnerId.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsSending(true);
    try {
      sendSupportMessage(partnerId, message.trim());
      setMessage("");
      alert("Đã gửi tin nhắn hỗ trợ!");
    } catch (error) {
      console.error("Error sending support message:", error);
      alert("Có lỗi xảy ra khi gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  // Don't show if not logged in
  if (!user?.id) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md">
      <h3 className="text-lg font-semibold mb-4">Test Support Message</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partner ID (To):
          </label>
          <Input
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            placeholder="Enter partner ID..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message:
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your support message..."
            rows={3}
          />
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={isSending || !message.trim() || !partnerId.trim()}
          className="w-full"
        >
          {isSending ? "Đang gửi..." : "Send Support Message"}
        </Button>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Your ID:</strong> {user.id}</p>
        <p><strong>Your Name:</strong> {user.name || "Unknown"}</p>
      </div>
    </div>
  );
}
