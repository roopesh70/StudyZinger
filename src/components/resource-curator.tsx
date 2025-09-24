
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { curateExternalStudyResources, CurateExternalStudyResourcesOutput } from "@/ai/flows/curate-external-study-resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
  subtopic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
});

export function ResourceCurator() {
  const [resources, setResources] = useState<CurateExternalStudyResourcesOutput['resources'] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subtopic: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setResources(null);
    try {
      const result = await curateExternalStudyResources(values);
      setResources(result.resources);
    } catch (error) {
      console.error("Failed to curate resources:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to find resources. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Resource Curator</CardTitle>
        <CardDescription>Enter a topic or subtopic, and we'll find helpful videos and articles for you.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="subtopic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Photosynthesis, The Pythagorean Theorem" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Find Resources
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(loading || resources) && (
        <CardContent>
          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                    </div>
                </div>
              ))}
            </div>
          )}
          {resources && resources.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recommended Resources</h3>
              <ul className="space-y-3">
                {resources.map((resource, index) => (
                  <li key={index} className="border rounded-lg p-4 hover:bg-accent hover:text-accent-foreground transition-colors group">
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold group-hover:underline">{resource.title}</p>
                        <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">{resource.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-accent-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
           {resources && resources.length === 0 && !loading && (
            <p className="text-center text-muted-foreground p-4">No resources found for this topic.</p>
           )}
        </CardContent>
      )}
    </Card>
  );
}
