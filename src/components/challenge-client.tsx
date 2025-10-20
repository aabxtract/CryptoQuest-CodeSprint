'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getChallengeQuestions } from '@/lib/questions';
import type { Question, Topic, Level } from '@/lib/types';
import { validateSolidityAnswer } from '@/ai/flows/validate-solidity-answer';
import { useProgressStore } from '@/hooks/use-progress-store';
import { Loader2, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

type ChallengeStatus = 'playing' | 'checking' | 'correct' | 'incorrect';

export function ChallengeClient({ topic, level, isEmbedded }: { topic: Topic; level: Level, isEmbedded: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const { saveChallengeResult } = useProgressStore();

  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState('');
  const [status, setStatus] = React.useState<ChallengeStatus>('playing');
  const [feedback, setFeedback] = React.useState('');
  const [wrongAttempts, setWrongAttempts] = React.useState(0);
  const [showHint, setShowHint] = React.useState(false);
  const [startTime, setStartTime] = React.useState(0);
  const [correctAnswers, setCorrectAnswers] = React.useState(0);

  React.useEffect(() => {
    const newQuestions = getChallengeQuestions(topic, level);
    if (newQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `No questions found for ${topic} - ${level}.`,
      });
      router.push('/');
    } else {
      setQuestions(newQuestions);
      setStartTime(Date.now());
    }
  }, [topic, level, router, toast]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleCheckAnswer = async () => {
    if (!userAnswer.trim()) return;

    setStatus('checking');
    
    const isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setFeedback(currentQuestion.explanation);
      setStatus('correct');
      setCorrectAnswers(prev => prev + 1);
    } else {
      setWrongAttempts(prev => prev + 1);
      try {
        const result = await validateSolidityAnswer({
          codeSnippet: currentQuestion.template,
          userAnswer: userAnswer,
          correctAnswer: currentQuestion.correctAnswer,
        });
        setFeedback(result.feedback);
      } catch (error) {
        console.error("AI feedback error:", error);
        setFeedback("Remember: syntax and keywords are important in Solidity.");
      }
      setStatus('incorrect');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      // Challenge finished
      const endTime = Date.now();
      saveChallengeResult(topic, level, {
        score: correctAnswers,
        total: questions.length,
        time: endTime - startTime,
      });
      const embedQuery = isEmbedded ? '?embed=true' : '';
      router.push(`/results/${encodeURIComponent(topic)}/${encodeURIComponent(level)}${embedQuery}`);
    }
  };

  const resetQuestionState = () => {
    setStatus('playing');
    setUserAnswer('');
    setFeedback('');
    setWrongAttempts(0);
    setShowHint(false);
  };

  const CodeSnippet = React.useMemo(() => {
    if (!currentQuestion) return null;
    const parts = currentQuestion.template.split('____');
    return (
      <pre className="bg-muted p-4 rounded-md text-sm font-code whitespace-pre-wrap">
        <code>
          {parts[0]}
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={status !== 'playing'}
            className="inline-block bg-background border-b-2 border-primary/50 focus:border-primary h-6 w-32 mx-1 px-1 font-code text-sm !ring-0 !ring-offset-0"
            placeholder="your_code"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCheckAnswer();
            }}
            autoFocus
          />
          {parts[1]}
        </code>
      </pre>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, status]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading challenge...</p>
      </div>
    );
  }

  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <Card className="w-full max-w-2xl shadow-lg">
      <CardHeader>
        <Progress value={progress} className="mb-4"/>
        <CardTitle className="font-headline text-xl">{currentQuestion.question}</CardTitle>
        <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
      </CardHeader>
      <CardContent>
        {CodeSnippet}
        <AnimatePresence>
        {status !== 'playing' && feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <Alert variant={status === 'correct' ? 'default' : 'destructive'} className={status === 'correct' ? 'bg-green-50 border-green-200' : ''}>
                {status === 'correct' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{status === 'correct' ? 'Correct!' : 'Incorrect'}</AlertTitle>
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            </motion.div>
        )}
        </AnimatePresence>
        {wrongAttempts >= 2 && status === 'playing' && (
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setShowHint(true)}>
              <Lightbulb className="h-4 w-4 mr-2" />
              Stuck? Get a hint
            </Button>
          </div>
        )}
        {showHint && (
            <Alert className="mt-4 bg-blue-50 border-blue-200">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Hint</AlertTitle>
                <AlertDescription>{currentQuestion.hint}</AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {status === 'playing' && (
          <Button onClick={handleCheckAnswer} disabled={!userAnswer.trim()}>Check Answer</Button>
        )}
        {status === 'checking' && (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking...
          </Button>
        )}
        {status === 'correct' && (
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
          </Button>
        )}
        {status === 'incorrect' && (
          <>
            <Button variant="outline" onClick={resetQuestionState}>Try Again</Button>
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Skip'}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
