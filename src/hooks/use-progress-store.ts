'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProgressData, Topic, Level, ChallengeResult } from '@/lib/types';
import { TOPICS, LEVELS } from '@/lib/types';

const PROGRESS_KEY = 'soliditySprintProgress';

export const useProgressStore = () => {
  const [progress, setProgress] = useState<ProgressData>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastResult, setLastResult] = useState<ChallengeResult | null>(null);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
      const savedLastResult = sessionStorage.getItem('lastChallengeResult');
      if(savedLastResult) {
        setLastResult(JSON.parse(savedLastResult));
      }
    } catch (error) {
      console.error('Failed to load progress from storage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProgress = useCallback((newProgress: ProgressData) => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save progress to localStorage', error);
    }
  }, []);

  const getTopicProgress = useCallback(
    (topic: Topic) => {
      if (!isLoaded || !progress[topic]) {
        return 0;
      }
      const topicProgress = progress[topic];
      let totalScore = 0;
      let totalPossible = 0;

      LEVELS.forEach(level => {
        if(topicProgress?.[level]?.completed){
            totalScore += topicProgress[level]?.score || 0;
            totalPossible += topicProgress[level]?.total || 0;
        }
      });
      
      // Assume each level has 5 questions for total
      const totalLevels = LEVELS.length;
      const totalQuestionsInTopic = totalLevels * 5;

      return totalPossible > 0 ? Math.round((totalScore / totalQuestionsInTopic) * 100) : 0;

    },
    [progress, isLoaded]
  );
  
  const saveChallengeResult = useCallback((topic: Topic, level: Level, result: ChallengeResult) => {
    const newProgress = { ...progress };
    if (!newProgress[topic]) {
      newProgress[topic] = {};
    }
    
    const currentLevelProgress = newProgress[topic]?.[level];

    // Only update if the new score is better
    if(!currentLevelProgress || result.score > (currentLevelProgress.score || 0)) {
        newProgress[topic]![level] = {
            completed: result.score === result.total,
            score: result.score,
            total: result.total,
        };
    }
    
    saveProgress(newProgress);
    try {
        sessionStorage.setItem('lastChallengeResult', JSON.stringify(result));
        setLastResult(result);
    } catch (error) {
        console.error('Failed to save last result to sessionStorage', error);
    }

  }, [progress, saveProgress]);


  return { isLoaded, progress, getTopicProgress, saveChallengeResult, lastResult };
};
