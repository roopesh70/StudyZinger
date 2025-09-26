
"use client";

import { ScheduleGenerator } from "@/components/schedule-generator";

export default function DashboardPage() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="flex justify-center">
        <ScheduleGenerator />
      </div>
    </main>
  );
}
