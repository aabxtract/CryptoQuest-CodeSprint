import allQuestions from '@/data/questions.json';
import type { Question, Topic, Level } from './types';
import { shuffleArray } from './utils';

const questions: Question[] = allQuestions as Question[];

export function getChallengeQuestions(topic: Topic, level: Level, count: number = 5): Question[] {
  const filteredQuestions = questions.filter(
    (q) => q.topic === topic && q.level === level
  );
  
  const shuffled = shuffleArray(filteredQuestions);
  return shuffled.slice(0, count);
}
