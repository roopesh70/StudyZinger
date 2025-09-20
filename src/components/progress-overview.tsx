
import { Award, Book, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface ProgressOverviewProps {
  stats: {
    subjects: number;
    completed: number;
    total: number;
  };
  loading: boolean;
}

export function ProgressOverview({ stats, loading }: ProgressOverviewProps) {
    const heroImage = PlaceHolderImages.find(img => img.id === 'studying-progress') || {
        imageUrl: "https://picsum.photos/seed/studying/600/400",
        imageHint: "person studying"
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative aspect-[16/10] w-full">
                    <Image
                        src={heroImage.imageUrl}
                        alt="A person studying"
                        data-ai-hint={heroImage.imageHint}
                        fill
                        className="rounded-md object-cover"
                    />
                </div>
                {loading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="flex justify-center items-center h-10 w-10 rounded-full bg-accent mx-auto mb-1">
                            <Book className="h-5 w-5 text-accent-foreground" />
                            </div>
                            <p className="text-xl font-bold">{stats.subjects}</p>
                            <p className="text-xs text-muted-foreground">Subjects</p>
                        </div>
                        <div>
                            <div className="flex justify-center items-center h-10 w-10 rounded-full bg-accent mx-auto mb-1">
                            <CheckCircle className="h-5 w-5 text-accent-foreground" />
                            </div>
                            <p className="text-xl font-bold">{stats.completed}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                        <div>
                            <div className="flex justify-center items-center h-10 w-10 rounded-full bg-accent mx-auto mb-1">
                            <Award className="h-5 w-5 text-accent-foreground" />
                            </div>
                            <p className="text-xl font-bold">{stats.total}%</p>
                            <p className="text-xs text-muted-foreground">Done</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
