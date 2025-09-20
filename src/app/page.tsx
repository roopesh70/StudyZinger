
"use client";

import { useState, useEffect } from "react";
import { ScheduleGenerator } from "@/components/schedule-generator";
import { ProgressOverview } from "@/components/progress-overview";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { isToday, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ subjects: 0, completed: 0, total: 0 });
  const [todaysTasks, setTodaysTasks] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "studyPlans"));
        const plans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudyPlan[];

        let totalTasks = 0;
        let completedTasks = 0;
        const todays: ScheduleItem[] = [];

        plans.forEach(plan => {
          totalTasks += plan.schedule.length;
          completedTasks += plan.schedule.filter(item => item.status === 'completed').length;
          plan.schedule.forEach(item => {
            if (isToday(parseISO(item.date))) {
              todays.push(item);
            }
          });
        });
        
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        setStats({
          subjects: plans.length,
          completed: completedTasks,
          total: completionPercentage,
        });
        setTodaysTasks(todays);

      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="flex-1 bg-background p-4 md:p-6">
       <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <ScheduleGenerator />
        </div>
        <div className="space-y-6">
            <ProgressOverview stats={stats} loading={loading} />

            <Card>
                <CardHeader>
                    <CardTitle>Today's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : todaysTasks.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Topic</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {todaysTasks.map((task, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <p className="font-medium">{task.topic}</p>
                                            <p className="text-sm text-muted-foreground">{task.tasks}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                                                {task.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No tasks scheduled for today. Great job!</p>
                    )}
                </CardContent>
            </Card>
        </div>
       </div>
    </main>
  );
}
