"use client";

import { useState, useEffect } from "react";

interface Participant {
  name: string;
  email: string;
}

interface ParticipantListModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  creatorId: string;
  eventTitle: string;
}

export default function ParticipantListModal({
  isOpen,
  onClose,
  participants,
  creatorId,
  eventTitle,
}: ParticipantListModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Handle the animation states
  useEffect(() => {
    if (isOpen) {
      // Small delay before showing the content
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle closing with animation
  const handleClose = () => {
    setIsVisible(false);
    // Wait for the animation to complete before actually closing
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  const filteredParticipants = participants.filter((participant) =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Participants
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-4 opacity-0 animate-fadeIn animation-delay-100">
          Event: {eventTitle}
        </p>

        {/* Search input */}
        <div className="mb-4 opacity-0 animate-fadeIn animation-delay-200">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search participants..."
              className="w-full px-3 py-2 pl-10 border rounded-md transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto opacity-0 animate-fadeIn animation-delay-300">
          {filteredParticipants.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No participants found
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredParticipants.map((participant, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  style={{
                    animationDelay: `${index * 50 + 400}ms`,
                  }}
                >
                  <span>{participant.name}</span>
                  {participant.email === creatorId && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Creator
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-right opacity-0 animate-fadeIn animation-delay-400">
          <p className="text-sm text-gray-500 float-left">
            {filteredParticipants.length} participant
            {filteredParticipants.length !== 1 ? "s" : ""} found
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
