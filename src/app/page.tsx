
"use client";

import { useState, useEffect, useMemo } from "react";
import { ScheduleGenerator } from "@/components/schedule-generator";
import { ProgressOverview } from "@/components/progress-overview";
import { useUser, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseISO, isPast, isToday } from "date-fns";

interface ScheduleItem {
  day: string;
  date: string;
  topic: string;
  tasks: string;
  status: 'pending' | 'completed' | 'missed';
}

interface StudyPlan {
  id: string;
  topic: string;
  schedule: ScheduleItem[];
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState({ subjects: 0, completed: 0, total: 0 });

  const plansQuery = useMemo(() => {
    if (!user) return null;
    return query(collection(db, "studyPlans"), where("userId", "==", user.uid));
  }, [user]);

  const { data: plans, loading } = useCollection<StudyPlan>(plansQuery);

  useEffect(() => {
    if (plans) {
      const totalSubjects = plans.length;
      let totalCompletedTasks = 0;
      let totalTasks = 0;

      plans.forEach(plan => {
        plan.schedule.forEach(item => {
          totalTasks++;
          if (item.status === 'completed') {
            totalCompletedTasks++;
          }
        });
      });
      
      const overallCompletion = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

      setStats({
        subjects: totalSubjects,
        completed: totalCompletedTasks,
        total: overallCompletion,
      });
    }
  }, [plans]);

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
           <ScheduleGenerator />
        </div>
        <div className="lg:col-span-1">
          <ProgressOverview stats={stats} loading={loading} />
        </div>
      </div>
    </main>
  );
}
