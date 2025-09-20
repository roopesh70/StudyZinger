"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, BookCopy, CalendarDays } from "lucide-react";

interface ScheduleItem {
  day: string;
  date: string;
  topic: string;
  tasks: string;
}

interface StudyPlan {
  id: string;
  topic: string;
  notes: string;
  schedule: ScheduleItem[];
  createdAt: Timestamp;
}

export default function TargetsPage() {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudyPlans() {
      setLoading(true);
      try {
        const q = query(collection(db, "studyPlans"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const plans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as StudyPlan[];
        setStudyPlans(plans);
      } catch (error) {
        console.error("Error fetching study plans: ", error);
        // Optionally, show a toast message here
      } finally {
        setLoading(false);
      }
    }

    fetchStudyPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Your Saved Study Targets</h1>
      {studyPlans.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8">
          You haven't saved any study plans yet. Go to the Home tab to generate and save one!
        </p>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {studyPlans.map(plan => (
            <Card key={plan.id}>
              <AccordionItem value={plan.id} className="border-0">
                <AccordionTrigger className="p-6 hover:no-underline">
                   <div className="text-left">
                        <h2 className="text-xl font-semibold">{plan.topic}</h2>
                        <p className="text-sm text-muted-foreground">
                            Saved on: {plan.createdAt ? new Date(plan.createdAt.seconds * 1000).toLocaleDateString() : 'Date not available'}
                        </p>
                   </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="px-6 pb-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold flex items-center mb-2"><CalendarDays className="mr-2" /> Study Schedule</h3>
                             <Card>
                                <CardContent className="p-0">
                                    <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead className="w-[80px]">Day</TableHead>
                                        <TableHead className="w-[150px]">Date</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Tasks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plan.schedule.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.day}</TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.topic}</TableCell>
                                            <TableCell>{item.tasks}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                    </Table>
                                </CardContent>
                             </Card>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold flex items-center mb-2"><BookCopy className="mr-2" /> Introductory Notes</h3>
                            <div className="prose prose-sm max-w-none bg-muted rounded-lg p-4 whitespace-pre-wrap prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline" dangerouslySetInnerHTML={{ __html: plan.notes.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      )}
    </main>
  );
}
