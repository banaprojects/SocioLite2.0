"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Image from "next/image";

interface Message {
  id: string;
  message_text: string;
  user_name: string;
  created_at: string;
  user_id: string;
  isSystemMessage?: boolean;
  media_url?: string;
  media_type?: "image" | "video";
}

interface ChatWindowProps {
  eventId: string;
  userId: string;
}

export default function ChatWindow({ eventId, userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?eventId=${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    socketRef.current = io({
      path: "/api/socket",
      addTrailingSlash: false,
    });

    socketRef.current.emit("join-event", eventId);
    fetchMessages();

    socketRef.current.on("message-received", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    socketRef.current.on("event-rename-notification", (data) => {
      if (data.eventId === eventId) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            message_text: `Event renamed from "${data.oldTitle}" to "${data.newTitle}"`,
            user_name: "System",
            created_at: new Date().toISOString(),
            user_id: "system",
            isSystemMessage: true,
          },
        ]);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-event", eventId);
        socketRef.current.disconnect();
      }
    };
  }, [eventId, fetchMessages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const newMessageObj = {
        id: data.messageId,
        message_text: newMessage,
        user_id: userId,
        created_at: data.createdAt,
        user_name: data.userName,
      };

      setMessages((prev) => [...prev, newMessageObj]);
      socketRef.current?.emit("new-message", {
        ...newMessageObj,
        eventId,
      });
      setNewMessage("");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    } catch {
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleFileUpload(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/messages/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { url, type } = await uploadResponse.json();

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          mediaUrl: url,
          mediaType: type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const newMessageObj = {
        id: data.messageId,
        user_id: userId,
        created_at: data.createdAt,
        user_name: data.userName,
        media_url: url,
        media_type: type,
        message_text: "",
      };

      setMessages((prev) => [...prev, newMessageObj]);
      socketRef.current?.emit("new-message", {
        ...newMessageObj,
        eventId,
      });
    } catch {
      setError("Failed to upload media");
    } finally {
      setIsUploading(false);
    }
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[600px] border rounded-lg bg-white">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-[600px] border rounded-lg bg-white">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );

  return (
    <div className="flex flex-col h-[450px] border rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        <div className="flex-1" />
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.isSystemMessage
                ? "items-center"
                : message.user_id === userId
                ? "items-end"
                : "items-start"
            } opacity-0 animate-fadeIn`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 transition-all duration-300 ${
                message.isSystemMessage
                  ? "bg-gray-100 text-gray-600 text-sm italic hover:bg-gray-200"
                  : message.user_id === userId
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 hover:bg-gray-200"
              } transform hover:scale-[1.02]`}
            >
              {!message.isSystemMessage && (
                <p className="text-sm font-semibold mb-1">
                  {message.user_name}
                </p>
              )}
              {message.message_text && (
                <p className="break-words">{message.message_text}</p>
              )}
              {message.media_url && (
                <div className="mt-2">
                  {message.media_type === "image" ? (
                    <Image
                      src={message.media_url}
                      alt="Shared image"
                      width={500}
                      height={300}
                      className="rounded-md max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.media_url, "_blank")}
                    />
                  ) : (
                    <video
                      src={message.media_url}
                      controls
                      className="rounded-md max-w-full"
                    />
                  )}
                </div>
              )}
              {!message.isSystemMessage && (
                <p className="text-xs opacity-75 mt-1">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-100 bg-gray-50"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isSending || isUploading}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isUploading}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            type="submit"
            disabled={
              isSending || isUploading || (!newMessage.trim() && !isUploading)
            }
            className={`px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              isSending || isUploading ? "animate-pulse" : ""
            }`}
          >
            {isUploading ? "Uploading..." : isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
