"use client";

import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";
import CreateEventModal from "./CreateEventModal";
import InviteParticipantModal from "./InviteParticipantModal";
import RenameEventModal from "./RenameEventModal";
import ParticipantListModal from "./ParticipantListModal";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  creator_id: string;
  creator_name: string;
  participant_count: number;
  participants: Array<{
    name: string;
    email: string;
  }>;
}

interface EventDashboardProps {
  userId: string;
}

interface ExpandedState {
  [key: string]: boolean;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ userId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "created" | "participating">(
    "all"
  );
  const [expandedEvents, setExpandedEvents] = useState<ExpandedState>({});
  const [searchTerm, setSearchTerm] = useState("");
  // const [closingEvents, setClosingEvents] = useState<{
  //   [key: string]: boolean;
  // }>({});
  // const [showParticipants, setShowParticipants] = useState(false);

  async function fetchEvents() {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Event fetch error:", errorData);
        throw new Error(errorData.error || "Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);

      // Update selected event if it exists in the new data
      if (selectedEvent) {
        const updatedEvent = data.find((e: Event) => e.id === selectedEvent.id);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
        }
      }
    } catch (err) {
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
    // Set up polling for updates every 30 seconds
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // If the selected event is no longer in the events list, clear the selection
    if (selectedEvent && !events.find((e) => e.id === selectedEvent.id)) {
      setSelectedEvent(null);
    }
  }, [events, selectedEvent]);

  const handleEventSelect = (event: Event) => {
    // If clicking the same event, do nothing
    if (selectedEvent?.id === event.id) return;

    // Simply update the selected event
    setSelectedEvent(event);
  };

  const filteredEvents = events.filter((event) => {
    // First apply search filter
    const matchesSearch =
      searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.creator_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Then apply tab filter
    switch (filter) {
      case "created":
        return event.creator_id === userId;
      case "participating":
        return (
          event.creator_id !== userId &&
          event.participants.some((p) => p.email === userId)
        );
      default:
        return true;
    }
  });

  // Sort events by date, with upcoming events first
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.event_date);
    const dateB = new Date(b.event_date);
    const now = new Date();

    // If both dates are in the past or both are in the future, sort by closest to now
    if ((dateA < now && dateB < now) || (dateA >= now && dateB >= now)) {
      return (
        Math.abs(dateA.getTime() - now.getTime()) -
        Math.abs(dateB.getTime() - now.getTime())
      );
    }
    // Put future events first
    return dateA >= now ? -1 : 1;
  });

  function handleInviteSuccess() {
    fetchEvents();
    setIsInviteModalOpen(false);
  }

  const toggleEventDetails = (eventId: string) => {
    setExpandedEvents((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );

  if (error)
    return <div className="text-red-500 p-4 text-center">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Events</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md ${
                filter === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFilter("created")}
              className={`px-3 py-1 rounded-md ${
                filter === "created"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Created ({events.filter((e) => e.creator_id === userId).length})
            </button>
            <button
              onClick={() => setFilter("participating")}
              className={`px-3 py-1 rounded-md ${
                filter === "participating"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Invited ({events.filter((e) => e.creator_id !== userId).length})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {sortedEvents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {searchTerm ? (
                  <>
                    No events found matching &quot;{searchTerm}&quot;
                    {filter !== "all" && (
                      <>
                        {" "}
                        in{" "}
                        {filter === "created"
                          ? "created events"
                          : "invitations"}
                      </>
                    )}
                  </>
                ) : filter === "all" ? (
                  "No events found"
                ) : filter === "created" ? (
                  "You haven't created any events yet"
                ) : (
                  "You haven't been invited to any events yet"
                )}
              </div>
            ) : (
              sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedEvent?.id === event.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    onClick={() => handleEventSelect(event)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      {event.creator_id === userId ? (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Creator ({event.participant_count} participants)
                        </span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Participant ({event.participant_count} total)
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1">{event.description}</p>
                  </div>

                  <div className="mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEventDetails(event.id);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      {expandedEvents[event.id]
                        ? "Hide Details"
                        : "Show Details"}
                    </button>

                    <div
                      className={`transition-height ${
                        expandedEvents[event.id] ? "height-auto" : "height-zero"
                      }`}
                    >
                      <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                        <p className="text-sm text-gray-500 opacity-0 animate-fadeIn animation-delay-100">
                          Date: {format(new Date(event.event_date), "PPp")}
                        </p>
                        <p className="text-sm text-gray-500 opacity-0 animate-fadeIn animation-delay-200">
                          Created by: {event.creator_name}
                        </p>
                        {event.creator_id === userId && (
                          <div className="text-sm text-gray-500 opacity-0 animate-fadeIn animation-delay-300">
                            <p className="font-medium">Participants:</p>
                            <ul className="ml-2 mt-1">
                              {event.participants.map((participant, index) => (
                                <li
                                  key={index}
                                  className="flex items-center space-x-1 animate-fadeIn"
                                  style={{
                                    animationDelay: `${index * 50 + 400}ms`,
                                    opacity: 0,
                                  }}
                                >
                                  <span>• {participant.name}</span>
                                  {participant.email === event.creator_id && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                      Creator
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedEvent ? (
          <div key={selectedEvent.id}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    {selectedEvent.title}
                  </h2>
                  {selectedEvent.creator_id === userId && (
                    <button
                      onClick={() => setIsRenameModalOpen(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Rename
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {format(new Date(selectedEvent.event_date), "PPp")}
                </p>
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">
                      {selectedEvent.creator_id === userId ? (
                        <div className="flex items-center gap-2">
                          <span>
                            Participants ({selectedEvent.participants.length})
                          </span>
                          <button
                            onClick={() => setIsParticipantListOpen(true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View List
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-600">
                          {selectedEvent.participants.length} participants in
                          this event
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              </div>
              {selectedEvent.creator_id === userId && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Invite Participant
                </button>
              )}
            </div>
            <ChatWindow
              key={selectedEvent.id}
              eventId={selectedEvent.id}
              userId={userId}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select an event to view the chat
          </div>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={fetchEvents}
      />

      {selectedEvent && (
        <>
          <InviteParticipantModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            eventId={selectedEvent.id}
            onSuccess={handleInviteSuccess}
          />
          <RenameEventModal
            isOpen={isRenameModalOpen}
            onClose={() => setIsRenameModalOpen(false)}
            eventId={selectedEvent.id}
            currentTitle={selectedEvent.title}
            onSuccess={fetchEvents}
          />
          <ParticipantListModal
            isOpen={isParticipantListOpen}
            onClose={() => setIsParticipantListOpen(false)}
            participants={selectedEvent.participants}
            creatorId={selectedEvent.creator_id}
            eventTitle={selectedEvent.title}
          />
        </>
      )}
    </div>
  );
};

export default EventDashboard;
