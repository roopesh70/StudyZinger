
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generatePersonalizedStudySchedule, GeneratePersonalizedStudyScheduleOutput } from "@/ai/flows/generate-personalized-study-schedule";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ArrowRight, BookCopy, CalendarDays, Clock, Languages, BrainCircuit, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  topic: z.string().min(5, { message: "Topic must be at least 5 characters." }),
  duration: z.string().min(1, { message: "Please enter a duration." }),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  dailyStudyTime: z.string().min(1, { message: "Please enter daily study time." }),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  language: z.string().min(2, { message: "Please enter a language." }),
});

type FormValues = z.infer<typeof formSchema>;

export function ScheduleGenerator() {
  const [result, setResult] = useState<GeneratePersonalizedStudyScheduleOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      duration: "2 weeks",
      startDate: new Date(),
      dailyStudyTime: "1 hour",
      skillLevel: "Beginner",
      language: "English",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setResult(null);
    try {
      const input = {
        ...values,
        startDate: format(values.startDate, "yyyy-MM-dd"),
      };
      const response = await generatePersonalizedStudySchedule(input);
      setResult(response);
    } catch (error) {
      console.error("Failed to generate schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const scheduleWithStatus = result.schedule.map(item => ({...item, status: 'pending'}));
      
      await addDoc(collection(db, "studyPlans"), {
        topic: form.getValues("topic"),
        schedule: scheduleWithStatus,
        notes: result.notes,
        createdAt: serverTimestamp(),
        // In a real app, you'd get this from auth
        userEmail: "test-user@example.com" 
      });

      toast({
        title: "Success!",
        description: "Your study plan has been saved to Targets.",
      });
    } catch (error) {
      console.error("Error saving document: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save study plan. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const suggestionClicked = (topic: string) => {
    form.setValue("topic", topic);
  };

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

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
        Craft your perfect study plan
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        From topic to timeline in seconds - get a personalized schedule and notes to kickstart your learning.
      </p>
      
      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-lg">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="I want to learn about Quantum Computing..."
                          className="text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-24 resize-none shadow-none p-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />
                <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
                    <FormField
                      control={form.control}
                      name="skillLevel"
                      render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="border-0 shadow-none bg-accent text-accent-foreground hover:bg-accent/80 focus:ring-0">
                                        <BrainCircuit className="size-4 mr-2" />
                                        <SelectValue placeholder="Select skill level" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                      )}
                    />
                    <div className="flex-grow" />
                    <Button type="submit" size="icon" className="rounded-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                        <label className="text-sm font-medium text-muted-foreground flex items-center mb-1"><CalendarDays className="mr-2" /> Duration</label>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyStudyTime"
                  render={({ field }) => (
                    <FormItem>
                        <label className="text-sm font-medium text-muted-foreground flex items-center mb-1"><Clock className="mr-2" /> Daily Study</label>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                        <label className="text-sm font-medium text-muted-foreground flex items-center mb-1"><CalendarIcon className="mr-2" /> Start Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                        <label className="text-sm font-medium text-muted-foreground flex items-center mb-1"><Languages className="mr-2" /> Language</label>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </form>
        </Form>
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => suggestionClicked("Learn Next.js App Router")}>Learn Next.js</Button>
        <Button variant="outline" size="sm" onClick={() => suggestionClicked("Master Python for Data Science")}>Python for Data Science</Button>
        <Button variant="outline" size="sm" onClick={() => suggestionClicked("The History of the Roman Empire")}>Roman Empire History</Button>
        <Button variant="outline" size="sm" onClick={() => suggestionClicked("Introduction to Organic Chemistry")}>Organic Chemistry</Button>
      </div>

      {loading && (
        <div className="mt-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Generating your plan...</p>
        </div>
      )}

      {result && (
        <div className="mt-12 text-left space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center"><CalendarDays className="mr-3" /> Your Study Schedule</h2>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </div>
            <div>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.schedule.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.day}</TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>{item.topic}</TableCell>
                            <TableCell>{item.tasks}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">Pending</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            </div>
            <div>
                <h2 className="text-2xl font-bold flex items-center mb-4"><BookCopy className="mr-3" /> Introductory Notes</h2>
                <div className="prose prose-sm max-w-none bg-muted rounded-lg p-4" dangerouslySetInnerHTML={{ __html: markdownToHtml(result.notes) }} />
            </div>
        </div>
      )}
    </div>
  );
}
