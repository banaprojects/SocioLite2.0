"use client";

import { useState, useEffect } from "react";

interface InviteParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onSuccess: () => void;
}

export default function InviteParticipantModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: InviteParticipantModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setTimeout(() => {
      onClose();
      setEmail("");
      setError("");
      setSuccess("");
    }, 300);
  };

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/events/${eventId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite participant");
      }

      setSuccess("Participant invited successfully!");
      setEmail("");
      onSuccess();
      setTimeout(handleClose, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to invite participant"
      );
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
            Invite Participant
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

          {success && (
            <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm opacity-0 animate-fadeIn animation-delay-100">
              {success}
            </div>
          )}

          <div className="opacity-0 animate-fadeIn animation-delay-200">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Participant Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="participant@example.com"
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
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
            >
              {isLoading ? "Inviting..." : "Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
