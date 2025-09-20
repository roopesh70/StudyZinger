

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, BookCopy, CalendarDays, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday } from "date-fns";
import { getNotesForTopic, GetNotesForTopicOutput } from "@/ai/flows/get-notes-for-topic";

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

function TodayNotes({ topic }: { topic: string }) {
  const [notes, setNotes] = useState<GetNotesForTopicOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      if (!topic) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await getNotesForTopic({ topic });
        setNotes(result);
      } catch (error) {
        console.error("Error fetching today's notes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [topic]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading today's notes...</p>
      </div>
    );
  }

  if (!notes?.notes) {
    return <p className="text-muted-foreground">No notes available for today's topic.</p>;
  }

  return (
    <div 
      className="prose prose-sm max-w-none bg-muted rounded-lg p-4 prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline" 
      dangerouslySetInnerHTML={{ __html: notes.notes.replace(/\n/g, '<br />') }} 
    />
  );
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

  // A simple markdown to HTML converter
  const markdownToHtml = (markdown: string) => {
    return markdown
      .replace(/### (.*)/g, '<h3>$1</h3>') // h3
      .replace(/## (.*)/g, '<h2>$1</h2>') // h2
      .replace(/# (.*)/g, '<h1>$1</h1>') // h1
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>') // Links
      .replace(/^- (.*)/gm, '<ul><li>$1</li></ul>') // Basic lists (will wrap each item in a ul)
      .replace(/<\/ul>\n<ul>/g, '') // Combine consecutive list items
      .replace(/\n/g, '<br />'); // New lines
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
          {studyPlans.map(plan => {
             const todaysTopic = plan.schedule.find(item => isToday(new Date(item.date)))?.topic;
            return (
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
                                        {plan.schedule.map((item, index) => {
                                          const isCurrentDay = isToday(new Date(item.date));
                                          return (
                                            <TableRow 
                                              key={index}
                                              className={cn(isCurrentDay && "bg-primary/10")}
                                            >
                                                <TableCell className={cn(isCurrentDay && "font-bold text-primary")}>{item.day}</TableCell>
                                                <TableCell className={cn(isCurrentDay && "font-bold text-primary")}>{item.date}</TableCell>
                                                <TableCell>{item.topic}</TableCell>
                                                <TableCell>{item.tasks}</TableCell>
                                            </TableRow>
                                          );
                                        })}
                                    </TableBody>
                                    </Table>
                                </CardContent>
                             </Card>
                        </div>
                        {todaysTopic && (
                          <div>
                            <h3 className="text-lg font-bold flex items-center mb-2"><Edit className="mr-2" /> Today's Notes</h3>
                            <TodayNotes topic={todaysTopic} />
                          </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold flex items-center mb-2"><BookCopy className="mr-2" /> Introductory Notes</h3>
                            <div className="prose prose-sm max-w-none bg-muted rounded-lg p-4 prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline" dangerouslySetInnerHTML={{ __html: markdownToHtml(plan.notes) }} />
                        </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            </Card>
            )
          })}
        </Accordion>
      )}
    </main>
  );
}
