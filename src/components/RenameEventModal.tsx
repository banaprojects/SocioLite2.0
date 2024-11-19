"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";

interface RenameEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  currentTitle: string;
  onSuccess: () => void;
}

export default function RenameEventModal({
  isOpen,
  onClose,
  eventId,
  currentTitle,
  onSuccess,
}: RenameEventModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rename event");
      }

      const socket = io({
        path: "/api/socket",
        addTrailingSlash: false,
      });

      socket.emit("event-renamed", {
        eventId,
        oldTitle: data.oldTitle,
        newTitle: title,
      });

      socket.disconnect();

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename event");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center p-4 z-50 ${
        isVisible ? "bg-opacity-50" : "bg-opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold opacity-0 animate-fadeIn">
            Rename Event
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm opacity-0 animate-fadeIn animation-delay-100">
              {error}
            </div>
          )}

          <div className="opacity-0 animate-fadeIn animation-delay-200">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              New Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter new title"
            />
          </div>

          <div className="flex gap-2 justify-end mt-6 opacity-0 animate-fadeIn animation-delay-300">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || title === currentTitle}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading ? "Renaming..." : "Rename"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
