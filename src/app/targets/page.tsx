
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, BookCopy, CalendarDays, Edit, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isToday, parseISO } from "date-fns";
import { getNotesForTopic, GetNotesForTopicOutput } from "@/ai/flows/get-notes-for-topic";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  notes: string;
  schedule: ScheduleItem[];
  createdAt: Timestamp;
  autoDeleteOnCompletion?: boolean;
}

// A simple markdown to HTML converter
const markdownToHtml = (markdown: string) => {
  if (!markdown) return '';
  return markdown
    .replace(/### (.*)/g, '<h3 class="font-semibold text-lg mb-2 mt-4">$1</h3>') // h3
    .replace(/## (.*)/g, '<h2 class="font-semibold text-xl mb-3 mt-5">$1</h2>')   // h2
    .replace(/# (.*)/g, '<h1>$1</h1>')   // h1
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>') // Links
    .replace(/^- (.*)/gm, '<ul class="list-disc pl-5"><li>$1</li></ul>') // Basic lists (will wrap each item in a ul)
    .replace(/<\/ul>\n<ul class="list-disc pl-5">/g, '') // Combine consecutive list items
    .replace(/\n/g, '<br />'); // New lines
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
      dangerouslySetInnerHTML={{ __html: markdownToHtml(notes.notes) }} 
    />
  );
}

const statusIcons = {
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  missed: <XCircle className="h-5 w-5 text-red-500" />,
  pending: <AlertCircle className="h-5 w-5 text-yellow-500" />,
};

const statusColors: { [key: string]: 'default' | 'destructive' | 'secondary' } = {
  completed: 'default',
  missed: 'destructive',
  pending: 'secondary',
};

export default function TargetsPage() {
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{[key: string]: boolean}>({});
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchStudyPlans();
  }, []);

  const handleDelete = async (planId: string) => {
    try {
      await deleteDoc(doc(db, "studyPlans", planId));
      setStudyPlans(prev => prev.filter(p => p.id !== planId));
      toast({
        title: "Success",
        description: "Study plan deleted.",
      });
    } catch (error) {
      console.error("Error deleting plan: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete study plan.",
      });
    } finally {
      setPlanToDelete(null);
    }
  };

  const handleUpdateStatus = async (planId: string, itemDate: string, newStatus: 'completed' | 'pending') => {
    setUpdating(prev => ({...prev, [`${planId}-${itemDate}`]: true}));
    try {
      const planIndex = studyPlans.findIndex(p => p.id === planId);
      if (planIndex === -1) return;

      let newStudyPlans = [...studyPlans];
      const plan = {...newStudyPlans[planIndex]};
      const newSchedule = plan.schedule.map(item => 
        item.date === itemDate ? {...item, status: newStatus} : item
      );
      plan.schedule = newSchedule;

      const allCompleted = newSchedule.every(item => item.status === 'completed');

      if (allCompleted && plan.autoDeleteOnCompletion) {
          await deleteDoc(doc(db, "studyPlans", planId));
          newStudyPlans.splice(planIndex, 1);
          setStudyPlans(newStudyPlans);
          toast({
              title: "Plan Completed!",
              description: `"${plan.topic}" has been completed and automatically deleted.`,
          });
      } else {
        const planRef = doc(db, "studyPlans", planId);
        await updateDoc(planRef, { schedule: newSchedule });
        
        newStudyPlans[planIndex] = plan;
        setStudyPlans(newStudyPlans);

        toast({
          title: "Success",
          description: `Task marked as ${newStatus}.`,
        });
      }

    } catch (error) {
      console.error("Error updating status: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status.",
      });
    } finally {
       setUpdating(prev => ({...prev, [`${planId}-${itemDate}`]: false}));
    }
  };

  const handleAutoDeleteToggle = async (planId: string, checked: boolean) => {
    const planIndex = studyPlans.findIndex(p => p.id === planId);
    if (planIndex === -1) return;

    const newStudyPlans = [...studyPlans];
    newStudyPlans[planIndex].autoDeleteOnCompletion = checked;
    setStudyPlans(newStudyPlans);

    try {
        const planRef = doc(db, "studyPlans", planId);
        await updateDoc(planRef, { autoDeleteOnCompletion: checked });
        toast({
            title: "Settings updated",
            description: `Auto-delete on completion is now ${checked ? 'ON' : 'OFF'}.`,
        });
    } catch (error) {
        console.error("Error updating auto-delete setting: ", error);
        // Revert UI change
        newStudyPlans[planIndex].autoDeleteOnCompletion = !checked;
        setStudyPlans(newStudyPlans);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update auto-delete setting.",
        });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <main className="flex-1 p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Your Saved Study Targets</h1>
      {studyPlans.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8">
          You haven't saved any study plans yet. Go to the Home tab to generate and save one!
        </p>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {studyPlans.map(plan => {
             const todaysTopic = plan.schedule.find(item => isToday(parseISO(item.date)))?.topic;
            return (
            <Card key={plan.id}>
              <AccordionItem value={plan.id} className="border-0">
                <div className="flex items-center p-6">
                    <AccordionTrigger className="flex-1 hover:no-underline p-0">
                       <div className="text-left">
                            <h2 className="text-xl font-semibold">{plan.topic}</h2>
                            <p className="text-sm text-muted-foreground">
                                Saved on: {plan.createdAt ? new Date(plan.createdAt.seconds * 1000).toLocaleDateString() : 'Date not available'}
                            </p>
                       </div>
                    </AccordionTrigger>
                     <Button variant="ghost" size="icon" className="ml-4 text-muted-foreground hover:text-destructive" onClick={() => setPlanToDelete(plan.id)}>
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
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
                                        <TableHead className="w-[120px]">Date</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Tasks</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[120px]">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plan.schedule.map((item, index) => {
                                          const isCurrentDay = isToday(parseISO(item.date));
                                          const isItemUpdating = updating[`${plan.id}-${item.date}`];
                                          return (
                                            <TableRow 
                                              key={index}
                                              className={cn(isCurrentDay && "bg-primary/10")}
                                            >
                                                <TableCell className={cn(isCurrentDay && "font-bold text-primary")}>{item.day}</TableCell>
                                                <TableCell className={cn(isCurrentDay && "font-bold text-primary")}>{item.date}</TableCell>
                                                <TableCell>{item.topic}</TableCell>
                                                <TableCell>{item.tasks}</TableCell>
                                                <TableCell>
                                                  <Badge variant={statusColors[item.status]} className="capitalize">
                                                    {item.status}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  {item.status !== 'completed' ? (
                                                    <Button 
                                                      size="sm" 
                                                      variant="outline"
                                                      onClick={() => handleUpdateStatus(plan.id, item.date, 'completed')}
                                                      disabled={isItemUpdating}
                                                    >
                                                      {isItemUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                      Done
                                                    </Button>
                                                  ) : (
                                                    <Button 
                                                      size="sm" 
                                                      variant="secondary"
                                                      onClick={() => handleUpdateStatus(plan.id, item.date, 'pending')}
                                                      disabled={isItemUpdating}
                                                    >
                                                       {isItemUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                      Undo
                                                    </Button>
                                                  )}
                                                </TableCell>
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
                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <Switch 
                                id={`auto-delete-${plan.id}`}
                                checked={!!plan.autoDeleteOnCompletion}
                                onCheckedChange={(checked) => handleAutoDeleteToggle(plan.id, checked)}
                            />
                            <Label htmlFor={`auto-delete-${plan.id}`}>Delete plan when all tasks are completed</Label>
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
    <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && setPlanToDelete(null)}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your study plan and all of its data.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => planToDelete && handleDelete(planToDelete)} className="bg-destructive hover:bg-destructive/90">
            Delete
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
