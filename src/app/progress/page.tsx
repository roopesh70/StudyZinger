"use client";

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

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Hours Studied",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const progressData = [
    { subject: "Algebra II", value: 85 },
    { subject: "Chemistry", value: 62 },
    { subject: "World History", value: 78 },
    { subject: "English Literature", value: 45 },
]

export default function ProgressPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Study Hours This Year</CardTitle>
            <CardDescription>A look at your study time month by month.</CardDescription>
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
            {progressData.map(item => (
                <div key={item.subject} className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.subject}</span>
                        <span className="text-sm text-muted-foreground">{item.value}%</span>
                    </div>
                    <Progress value={item.value} />
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <StudyTipsGenerator />
    </main>
  );
}
