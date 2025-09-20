
"use client";

import { useState, useEffect } from "react";
import { ScheduleGenerator } from "@/components/schedule-generator";

export default function DashboardPage() {
  return (
    <main className="flex-1 bg-background p-4 md:p-6 flex justify-center">
      <ScheduleGenerator />
    </main>
  );
}
