'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProgressData, Topic, Level, ChallengeResult } from '@/lib/types';
import { TOPICS, LEVELS } from '@/lib/types';

// TODO: Replace with your actual backend API for fetching user progress
// const API_BASE_URL = 'https://your-backend-api.com/api';

export const useProgressStore = () => {
  const [progress, setProgress] = useState<ProgressData>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastResult, setLastResult] = useState<ChallengeResult | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        // =================================================================
        // TODO: Implement your backend call to fetch user progress.
        // You will likely need to pass user authentication details.
        //
        // const response = await fetch(`${API_BASE_URL}/progress`, {
        //   headers: {
        //     'Authorization': `Bearer YOUR_USER_TOKEN`,
        //   },
        // });
        // if (!response.ok) {
        //   throw new Error('Failed to fetch progress');
        // }
        // const savedProgress = await response.json();
        // setProgress(savedProgress);
        // =================================================================
        
        // For now, we'll start with empty progress.
        setProgress({});

      } catch (error) {
        console.error('Failed to load progress from backend', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    // Load last result from session storage (this can remain as it's temporary per-session)
     try {
        const savedLastResult = sessionStorage.getItem('lastChallengeResult');
        if(savedLastResult) {
          setLastResult(JSON.parse(savedLastResult));
        }
      } catch (error) {
        console.error('Failed to load last result from sessionStorage', error);
      }

    fetchProgress();
  }, []);

  const saveProgress = useCallback(async (newProgress: ProgressData) => {
    try {
      // =================================================================
      // TODO: Implement your backend call to save user progress.
      //
      // await fetch(`${API_BASE_URL}/progress`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer YOUR_USER_TOKEN`,
      //   },
      //   body: JSON.stringify(newProgress),
      // });
      // =================================================================
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save progress to backend', error);
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
  
  const saveChallengeResult = useCallback(async (topic: Topic, level: Level, result: ChallengeResult) => {
    const newProgress = { ...progress };
    if (!newProgress[topic]) {
      newProgress[topic] = {};
    }
    
    const currentLevelProgress = newProgress[topic]?.[level];

    // Only update if the new score is better
    let shouldUpdate = false;
    if(!currentLevelProgress || result.score > (currentLevelProgress.score || 0)) {
        newProgress[topic]![level] = {
            completed: result.score === result.total,
            score: result.score,
            total: result.total,
        };
        shouldUpdate = true;
    }
    
    if (shouldUpdate) {
      await saveProgress(newProgress);
    }

    try {
        sessionStorage.setItem('lastChallengeResult', JSON.stringify(result));
        setLastResult(result);
    } catch (error) {
        console.error('Failed to save last result to sessionStorage', error);
    }

  }, [progress, saveProgress]);


  return { isLoaded, progress, getTopicProgress, saveChallengeResult, lastResult };
};
