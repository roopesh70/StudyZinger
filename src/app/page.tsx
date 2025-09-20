import { ScheduleGenerator } from "@/components/schedule-generator";
import { ProgressOverview } from "@/components/progress-overview";
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
           <ScheduleGenerator />
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Latest Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="h-[280px] w-full animate-pulse rounded-md bg-muted" />}>
                        <ProgressOverview />
                    </Suspense>
                    <Button asChild variant="outline" className="w-full mt-4">
                        <Link href="/progress">
                            View Full Report <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
