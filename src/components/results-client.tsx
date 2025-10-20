'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProgressStore } from '@/hooks/use-progress-store';
import { calculateTimeSpent } from '@/lib/utils';
import { LEVELS } from '@/lib/types';
import type { Topic, Level } from '@/lib/types';
import { Trophy, Clock, Repeat, ArrowRight, Home } from 'lucide-react';
import Confetti from 'react-confetti';

export function ResultsClient({ topic, level }: { topic: Topic, level: Level }) {
  const router = useRouter();
  const { lastResult, isLoaded } = useProgressStore();
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  React.useEffect(() => {
    if (lastResult && lastResult.score === lastResult.total) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [lastResult]);

  if (!isLoaded) {
    return <div>Loading results...</div>;
  }

  if (!lastResult) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Results Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We couldn't find the results for your last challenge.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/')}>Back to Topics</Button>
        </CardFooter>
      </Card>
    );
  }

  const { score, total, time } = lastResult;
  const timeSpent = calculateTimeSpent(0, time);
  const isPerfectScore = score === total;

  const currentLevelIndex = LEVELS.indexOf(level);
  const hasNextLevel = currentLevelIndex < LEVELS.length - 1;
  const nextLevel = hasNextLevel ? LEVELS[currentLevelIndex + 1] : null;

  const handleNextLevel = () => {
    if (nextLevel) {
      router.push(`/challenge/${encodeURIComponent(topic)}/${encodeURIComponent(nextLevel)}`);
    }
  };

  const handleRetry = () => {
    router.push(`/challenge/${encodeURIComponent(topic)}/${encodeURIComponent(level)}`);
  };

  return (
    <>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />}
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline mt-4">
            {isPerfectScore ? 'Challenge Complete!' : 'Good Effort!'}
          </CardTitle>
          <CardDescription>
            You've completed the {level} challenge for '{topic}'.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{score}/{total}</span>
              <span className="text-sm text-muted-foreground">Correct Answers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">{timeSpent}</span>
              <span className="text-sm text-muted-foreground">Time Spent</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
                <Home className="h-4 w-4 mr-2" />
                Back to Topics
            </Button>
          {!isPerfectScore && (
            <Button variant="outline" onClick={handleRetry}>
              <Repeat className="h-4 w-4 mr-2" />
              Retry Missed
            </Button>
          )}
          {hasNextLevel && (
            <Button onClick={handleNextLevel}>
              Next Level <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
