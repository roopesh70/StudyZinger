import { Award, Book, Clock } from "lucide-react";
import Image from "next/image";

export function ProgressOverview() {
    return (
        <div className="space-y-4">
            <div className="relative aspect-[16/10] w-full">
                <Image
                    src="https://picsum.photos/seed/studying/600/400"
                    alt="A person studying"
                    data-ai-hint="person studying"
                    fill
                    className="rounded-md object-cover"
                />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="flex justify-center items-center h-10 w-10 rounded-full bg-accent mx-auto mb-1">
                       <Book className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <p className="text-xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
                 <div>
                    <div className="flex justify-center items-center h-10 w-10 rounded-full bg-accent mx-auto mb-1">
                       <Clock className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <p className="text-xl font-bold">12h</p>
                    <p className="text-xs text-muted-foreground">Logged</p>
                </div>
                 <div>
                    <div className="flex justify-center items-center h-10 w-10 rounded-full bg-accent mx-auto mb-1">
                       <Award className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <p className="text-xl font-bold">85%</p>
                    <p className="text-xs text-muted-foreground">Done</p>
                </div>
            </div>
        </div>
    )
}
