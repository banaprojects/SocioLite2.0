"use client";

import Link from "next/link";
import EventDashboard from "./EventDashboard";
import LogoutButton from "./LogoutButton";
import DeleteAccountButton from "./DeleteAccountButton";

interface DashboardLayoutProps {
  userId: string;
  userName: string;
}

function DashboardLayout({ userId }: DashboardLayoutProps) {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Events Dashboard</h1>
        <div className="flex gap-4 items-center">
          <Link
            href="/settings"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            Settings
          </Link>
          <DeleteAccountButton />
          <LogoutButton />
        </div>
      </div>

      <EventDashboard userId={userId} />
    </main>
  );
}

export default DashboardLayout;
