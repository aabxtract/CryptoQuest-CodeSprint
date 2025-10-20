'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Braces,
  FunctionSquare,
  Network,
  List,
  Zap,
  ChevronRight,
  Loader2,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/hooks/use-progress-store';
import type { Topic, Level } from '@/lib/types';
import { TOPICS, LEVELS } from '@/lib/types';

const topicIcons: Record<Topic, React.ElementType> = {
  'Variables & Data Types': Braces,
  'Functions & Visibility': FunctionSquare,
  'Mappings & Structs': Network,
  'Arrays & Loops': List,
  'Events & Modifiers': Zap,
};

function LevelSelectDialog({
  open,
  onOpenChange,
  topic,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic;
}) {
  const router = useRouter();

  const handleStartChallenge = (level: Level) => {
    router.push(`/challenge/${encodeURIComponent(topic)}/${encodeURIComponent(level)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Choose your level</DialogTitle>
          <DialogDescription>
            Select a difficulty for the '{topic}' topic.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {LEVELS.map((level) => (
            <Button
              key={level}
              variant="outline"
              size="lg"
              className="justify-between"
              onClick={() => handleStartChallenge(level)}
            >
              <span className="font-semibold">{level}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


function TopicCard({ topic }: { topic: Topic }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { getTopicProgress, isLoaded } = useProgressStore();
  
  const progress = getTopicProgress(topic);
  const Icon = topicIcons[topic];

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-headline font-semibold">{topic}</CardTitle>
          <Icon className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            {isLoaded ? `${progress}% complete` : 'Loading progress...'}
          </div>
          <div className="mb-4">
            {isLoaded ? (
              <Progress value={progress} className="h-2" />
            ) : (
              <div className="h-2 w-full bg-muted rounded-full" />
            )}
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full rounded-full">
            {progress > 0 && progress < 100 ? 'Continue' : 'Start'}
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
      <LevelSelectDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        topic={topic}
      />
    </>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo className="h-6 w-6" />
          <span className="sr-only">Solidity Sprint</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Solidity Sprint
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Master Solidity by completing interactive code gaps. Learn, attempt, correct, and progress.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full pb-12 md:pb-24 lg:pb-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TOPICS.map((topic) => (
                <TopicCard key={topic} topic={topic} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Solidity Sprint. All rights reserved.</p>
      </footer>
    </div>
  );
}
