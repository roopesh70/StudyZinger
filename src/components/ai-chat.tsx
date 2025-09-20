
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { chat } from "@/ai/flows/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Send, User, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";

const formSchema = z.object({
  question: z.string().min(1, { message: "Please enter a question." }),
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Simple markdown to HTML renderer
const markdownToHtml = (markdown: string) => {
  if (!markdown) return '';
  return markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-card p-2 rounded-md my-2"><code>$1</code></pre>') // Code blocks
    .replace(/`(.*?)`/g, '<code class="bg-card px-1 rounded-md">$1</code>') // Inline code
    .replace(/^- (.*)/gm, '<li>$1</li>') // List items
    .replace(/<\/li><li>/g, '</li><li>')
    .replace(/(<li>.*<\/li>)/g, '<ul class="list-disc pl-5">$1</ul>')
    .replace(/\n/g, '<br />'); // New lines
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const userMessage: Message = { role: 'user', content: values.question };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    try {
      const result = await chat({ question: values.question });
      const assistantMessage: Message = { role: 'assistant', content: result.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get answer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get an answer. Please try again.",
      });
      // remove the user message if the call fails
       setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-8rem)]">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>Ask any question and get help with your studies.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><BrainCircuit className="size-5" /></AvatarFallback>
                  </Avatar>
                )}
                 <div className={`rounded-lg p-3 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {message.role === 'assistant' ? (
                     <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(message.content) }} />
                  ) : (
                     <p>{message.content}</p>
                  )}
                </div>
                 {message.role === 'user' && (
                   <Avatar className="h-8 w-8">
                     <AvatarFallback><User /></AvatarFallback>
                   </Avatar>
                 )}
              </div>
            ))}
             {loading && (
                <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback><BrainCircuit className="size-5" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 pt-4 border-t">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Ask a question..." {...field} disabled={loading} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} size="icon">
                <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
