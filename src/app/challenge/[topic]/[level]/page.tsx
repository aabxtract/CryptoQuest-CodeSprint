import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { ChallengeClient } from '@/components/challenge-client';
import { TOPICS, LEVELS } from '@/lib/types';
import type { Topic, Level } from '@/lib/types';

type ChallengePageProps = {
  params: {
    topic: string;
    level: string;
  };
};

export default function ChallengePage({ params }: ChallengePageProps) {
  const topic = decodeURIComponent(params.topic) as Topic;
  const level = decodeURIComponent(params.level) as Level;

  // Validate topic and level
  if (!TOPICS.includes(topic) || !LEVELS.includes(level)) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Logo className="h-6 w-6 ml-2" />
          <span className="sr-only">Back to Home</span>
        </Link>
        <div className="flex items-center gap-4">
            <div className="text-sm font-medium hidden sm:block">{topic}</div>
            <div className="text-sm bg-muted px-2 py-1 rounded-md font-semibold">{level}</div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <ChallengeClient topic={topic} level={level} />
      </main>
    </div>
  );
}
