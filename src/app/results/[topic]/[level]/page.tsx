import Link from 'next/link';
import { notFound } from 'next/navigation';
import Logo from '@/components/logo';
import { ResultsClient } from '@/components/results-client';
import { TOPICS, LEVELS } from '@/lib/types';
import type { Topic, Level } from '@/lib/types';

type ResultsPageProps = {
  params: {
    topic: string;
    level: string;
  };
};

export default function ResultsPage({ params }: ResultsPageProps) {
  const topic = decodeURIComponent(params.topic) as Topic;
  const level = decodeURIComponent(params.level) as Level;

  if (!TOPICS.includes(topic) || !LEVELS.includes(level)) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Logo className="h-6 w-6" />
          <span className="ml-2 font-semibold font-headline">Solidity Sprint</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <ResultsClient topic={topic} level={level} />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Solidity Sprint. All rights reserved.</p>
      </footer>
    </div>
  );
}
