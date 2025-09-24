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
import { isPast, parseISO, differenceInCalendarDays, isToday, subDays, startOfDay } from "date-fns";
import { Loader2, ShieldCheck, Star, Zap, Trophy, Leaf } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface Badge {
  name: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
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
    const [badges, setBadges] = useState<Badge[]>([]);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        async function fetchProgress() {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "studyPlans"));
                const plans = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as StudyPlan[];

                const today = startOfDay(new Date());

                // Calculate Subject Progress
                const newProgressData = plans.map(plan => {
                    let completed = 0;
                    let missed = 0;
                    let pending = 0;

                    plan.schedule.forEach(item => {
                        const itemDate = startOfDay(parseISO(item.date));
                        if (item.status === 'completed') {
                            completed++;
                        } else if (item.status === 'missed') {
                            missed++;
                        } else if (isPast(itemDate) && !isToday(itemDate)) {
                            // Also count pending tasks from the past as missed for stats
                            missed++;
                        } else {
                            pending++;
                        }
                    });

                    const totalTasks = plan.schedule.length;
                    if (totalTasks === 0) {
                        return { subject: plan.topic, value: 0, completed: 0, missed: 0, pending: 0 };
                    }
                    
                    const value = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
                    return { subject: plan.topic, value, completed, missed, pending };
                });
                setProgressData(newProgressData);

                // Calculate Completed Tasks This Year for Bar Chart
                 const monthlyTasks: {[key: string]: number} = {
                    January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
                    July: 0, August: 0, September: 0, October: 0, November: 0, December: 0,
                };

                const completedDates = new Set<string>();
                
                plans.forEach(plan => {
                    plan.schedule.forEach(item => {
                        if (item.status === 'completed') {
                            const itemDate = parseISO(item.date);
                            const monthName = itemDate.toLocaleString('default', { month: 'long' });
                            monthlyTasks[monthName]++;
                            completedDates.add(item.date);
                        }
                    });
                });

                const newChartData = Object.entries(monthlyTasks).map(([month, tasks]) => ({
                    month: month,
                    desktop: tasks,
                }));

                setChartData(newChartData);

                // Calculate Streak
                const sortedDates = Array.from(completedDates).map(d => startOfDay(parseISO(d))).sort((a,b) => b.getTime() - a.getTime());
                let currentStreak = 0;
                if(sortedDates.length > 0) {
                    let lastDate = new Date();
                    // Check if today or yesterday is in the completed dates to count the streak
                    if (isToday(sortedDates[0]) || differenceInCalendarDays(lastDate, sortedDates[0]) === 1) {
                        currentStreak = 1;
                        lastDate = sortedDates[0];
                        for(let i = 1; i < sortedDates.length; i++) {
                            const diff = differenceInCalendarDays(lastDate, sortedDates[i]);
                            if (diff === 1) {
                                currentStreak++;
                                lastDate = sortedDates[i];
                            } else if (diff > 1) {
                                break;
                            }
                        }
                    }
                }
                setStreak(currentStreak);

                // Calculate Badges
                const earnedBadges: Badge[] = [
                    { name: "Topic Explorer", description: "Start study plans for 3+ different topics.", icon: Leaf, earned: plans.length >= 3 },
                    { name: "Quick Starter", description: "Complete a task on the first day of a study plan.", icon: Zap, earned: plans.some(p => p.schedule.some(i => i.status === 'completed' && i.day === 'Day 1')) },
                    { name: "Consistent Learner", description: "Maintain a 3-day study streak.", icon: ShieldCheck, earned: currentStreak >= 3 },
                    { name: "Streak Master", description: "Maintain a 7-day study streak.", icon: Star, earned: currentStreak >= 7 },
                    { name: "Plan Completer", description: "Complete your first study plan (all tasks).", icon: Trophy, earned: newProgressData.some(p => p.value === 100) },
                ];
                setBadges(earnedBadges);

                // Create dynamic summary for StudyTipsGenerator
                const progressSummary = newProgressData.map(p => `${p.subject}: ${p.value}% completion (${p.completed} done, ${p.missed} missed)`).join(', ');
                const overallCompletion = newProgressData.length > 0 ? Math.round(newProgressData.reduce((acc, p) => acc + p.value, 0) / newProgressData.length) : 0;
                setSummary(`Overall progress is at ${overallCompletion}%. Current study streak is ${currentStreak} days. Progress breakdown: ${progressSummary}.`);

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

       <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Celebrate your progress with these badges and streaks!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="relative flex justify-center items-center h-32 w-32 rounded-full bg-primary/10">
              <div className="absolute flex justify-center items-center h-28 w-28 rounded-full bg-primary/20">
                <span className="text-5xl font-bold text-primary">{streak}</span>
              </div>
            </div>
            <p className="font-semibold text-lg">Day Streak</p>
          </div>
          <div className="flex-1">
            <TooltipProvider>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {badges.map(badge => (
                  <Tooltip key={badge.name}>
                    <TooltipTrigger asChild>
                      <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 ${badge.earned ? 'border-primary bg-primary/5' : 'border-dashed opacity-50'}`}>
                        <badge.icon className={`h-10 w-10 ${badge.earned ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="text-xs font-semibold text-center">{badge.name}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{badge.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <StudyTipsGenerator initialSummary={summary} />
    </main>
  );
}
