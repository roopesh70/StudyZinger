import { ScheduleGenerator } from "@/components/schedule-generator";

export default function DashboardPage() {
  return (
    <main className="flex-1 bg-background">
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <ScheduleGenerator />
      </div>
    </main>
  );
}
