"use client";

import { useState, useEffect } from "react";
import { StudyTipsGenerator } from "@/components/study-tips-generator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { db } from "@/lib/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { isPast, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";

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
  createdAt: Timestamp;
}

interface ProgressItem {
    subject: string;
    value: number; // Completion percentage
    completed: number;
    missed: number;
    pending: number;
}

interface ChartDataItem {
    month: string;
    desktop: number; // Represents completed tasks count
}


const chartConfig = {
  desktop: {
    label: "Tasks Completed",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ProgressPage() {
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState<ProgressItem[]>([]);
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [summary, setSummary] = useState("");

    useEffect(() => {
        async function fetchProgress() {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "studyPlans"));
                const plans = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as StudyPlan[];

                // Calculate Subject Progress
                const newProgressData = plans.map(plan => {
                    const totalTasks = plan.schedule.length;
                    if (totalTasks === 0) {
                        return { subject: plan.topic, value: 0, completed: 0, missed: 0, pending: 0 };
                    }
                    
                    const completed = plan.schedule.filter(item => item.status === 'completed').length;
                    const missed = plan.schedule.filter(item => item.status === 'missed').length;
                    const pending = totalTasks - completed - missed;
                    
                    const value = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
                    return { subject: plan.topic, value, completed, missed, pending };
                });
                setProgressData(newProgressData);

                // Calculate Completed Tasks This Year for Bar Chart
                 const monthlyTasks: {[key: string]: number} = {
                    January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
                    July: 0, August: 0, September: 0, October: 0, November: 0, December: 0,
                };
                
                plans.forEach(plan => {
                    plan.schedule.forEach(item => {
                        if (item.status === 'completed') {
                            const itemDate = parseISO(item.date);
                            const monthName = itemDate.toLocaleString('default', { month: 'long' });
                            monthlyTasks[monthName]++;
                        }
                    });
                });

                const newChartData = Object.entries(monthlyTasks).map(([month, tasks]) => ({
                    month: month,
                    desktop: tasks,
                }));

                setChartData(newChartData);

                // Create dynamic summary for StudyTipsGenerator
                const progressSummary = newProgressData.map(p => `${p.subject}: ${p.value}% completion (${p.completed} done, ${p.missed} missed)`).join(', ');
                const overallCompletion = newProgressData.length > 0 ? Math.round(newProgressData.reduce((acc, p) => acc + p.value, 0) / newProgressData.length) : 0;
                setSummary(`Overall progress is at ${overallCompletion}%. Progress breakdown: ${progressSummary}.`);

            } catch (error) {
                console.error("Error fetching progress data: ", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProgress();
    }, []);

    if (loading) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        );
    }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Tasks Completed This Year</CardTitle>
            <CardDescription>A look at your completed tasks month by month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
            <CardDescription>Your completion rate for each subject.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressData.length > 0 ? progressData.map(item => (
                <div key={item.subject} className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.subject}</span>
                        <span className="text-sm text-muted-foreground">{item.value}%</span>
                    </div>
                    <Progress value={item.value} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completed: {item.completed}</span>
                        <span>Missed: {item.missed}</span>
                        <span>Pending: {item.pending}</span>
                    </div>
                </div>
            )) : (
                <p className="text-sm text-muted-foreground text-center pt-4">No study targets saved yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <StudyTipsGenerator initialSummary={summary} />
    </main>
  );
}
