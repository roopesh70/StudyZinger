
"use client";

import { useEffect, useState } from "react";
import { getDailyMotivationalQuote } from "@/ai/flows/display-daily-motivational-quotes";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MotivationalQuote() {
  const [quote, setQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      const today = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
      const storedQuote = localStorage.getItem('dailyQuote');
      const storedDate = localStorage.getItem('dailyQuoteDate');

      if (storedQuote && storedDate === today) {
        setQuote(storedQuote);
        setLoading(false);
        return;
      }

      try {
        const result = await getDailyMotivationalQuote();
        if(result.quote) {
          setQuote(result.quote);
          localStorage.setItem('dailyQuote', result.quote);
          localStorage.setItem('dailyQuoteDate', today);
        } else {
          setQuote("The journey of a thousand miles begins with a single step."); // Fallback quote
        }
      } catch (error) {
        console.error("Failed to fetch motivational quote:", error);
        setQuote("The journey of a thousand miles begins with a single step."); // Fallback quote
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, []);

  return (
    <Card className="bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground">
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-sidebar-foreground/20" />
            <Skeleton className="h-4 w-3/4 bg-sidebar-foreground/20" />
          </div>
        ) : (
          <blockquote className="text-sm italic">
            &ldquo;{quote}&rdquo;
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
