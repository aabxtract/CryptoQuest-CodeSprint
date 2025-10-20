export const TOPICS = ['Variables & Data Types', 'Functions & Visibility', 'Mappings & Structs', 'Arrays & Loops', 'Events & Modifiers', 'Modifiers & Require', 'Constructor & Inheritance', 'Interfaces and Abstract Contracts', 'Libraries and Using For', 'Error Handling and Custom Errors', 'Gas Optimization and Efficiency', 'Security Patterns and Best Practices'] as const;
export const LEVELS = ['Easy', 'Intermediate', 'Advanced'] as const;

export type Topic = typeof TOPICS[number];
export type Level = typeof LEVELS[number];

export type Question = {
  id: string;
  topic: Topic;
  level: Level;
  question: string;
  template: string;
  correctAnswer: string;
  hint: string;
  explanation: string;
};

export type ChallengeResult = {
  score: number;
  total: number;
  time: number;
};

export type LevelProgress = {
  completed: boolean;
  score: number;
  total: number;
};

export type TopicProgress = {
  [key in Level]?: LevelProgress;
};

export type ProgressData = {
  [key in Topic]?: TopicProgress;
};
