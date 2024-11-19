"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showConfirm]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowConfirm(false), 300);
  };

  async function handleLogout() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      router.refresh();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
      >
        Logout
      </button>

      {showConfirm && (
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center p-4 z-50 ${
            isVisible ? "bg-opacity-50" : "bg-opacity-0"
          }`}
          onClick={handleClose}
        >
          <div
            className={`bg-white rounded-lg p-6 w-full max-w-md transform transition-all duration-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold opacity-0 animate-fadeIn">
                Confirm Logout
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-6 opacity-0 animate-fadeIn animation-delay-100">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end space-x-3 opacity-0 animate-fadeIn animation-delay-200">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LogoutButton;
