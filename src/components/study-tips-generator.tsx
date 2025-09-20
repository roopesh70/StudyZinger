"use client";

import { useState } from "react";
import { providePersonalizedStudyTips } from "@/ai/flows/provide-personalized-study-tips";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockProgressSummary = "User is excelling in Algebra, with a 95% completion rate on assignments. However, they are struggling with Chemistry, especially with stoichiometry, where their completion rate is only 40%. They also seem to study inconsistently, with long sessions on weekends but very few during the week.";

export function StudyTipsGenerator() {
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(mockProgressSummary);
  const { toast } = useToast();

  async function getTips() {
    setLoading(true);
    setTips(null);
    try {
      const result = await providePersonalizedStudyTips({ progressSummary: summary });
      setTips(result.studyTips);
    } catch (error) {
      console.error("Failed to generate study tips:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate study tips. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Study Tips</CardTitle>
        <CardDescription>Based on your progress, here are some AI-generated tips to help you improve.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="progress-summary" className="text-sm font-medium mb-2 block">
            Your Progress Summary
          </label>
          <Textarea
            id="progress-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
            placeholder="A summary of your study progress..."
          />
          <p className="text-xs text-muted-foreground mt-1">This is pre-filled with a sample summary. You can edit it to reflect your own progress.</p>
        </div>
        <Button onClick={getTips} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Get My Tips
        </Button>

        {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}
        {tips && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Tips</h3>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                {tips}
              </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
