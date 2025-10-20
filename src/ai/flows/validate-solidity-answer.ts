'use server';

/**
 * @fileOverview A flow that validates Solidity answers and provides AI-powered feedback.
 *
 * - validateSolidityAnswer - A function that validates the user's Solidity answer and provides feedback.
 * - ValidateSolidityAnswerInput - The input type for the validateSolidityAnswer function.
 * - ValidateSolidityAnswerOutput - The return type for the validateSolidityAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateSolidityAnswerInputSchema = z.object({
  codeSnippet: z.string().describe('The full Solidity code snippet with the missing part.'),
  userAnswer: z.string().describe('The user-submitted answer for the missing part.'),
  correctAnswer: z.string().describe('The correct answer for the missing part.'),
});
export type ValidateSolidityAnswerInput = z.infer<typeof ValidateSolidityAnswerInputSchema>;

const ValidateSolidityAnswerOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user-submitted answer is correct.'),
  feedback: z.string().describe('Feedback for the user, including an explanation if the answer is incorrect.'),
});
export type ValidateSolidityAnswerOutput = z.infer<typeof ValidateSolidityAnswerOutputSchema>;

export async function validateSolidityAnswer(input: ValidateSolidityAnswerInput): Promise<ValidateSolidityAnswerOutput> {
  return validateSolidityAnswerFlow(input);
}

const validateSolidityAnswerPrompt = ai.definePrompt({
  name: 'validateSolidityAnswerPrompt',
  input: {schema: ValidateSolidityAnswerInputSchema},
  output: {schema: ValidateSolidityAnswerOutputSchema},
  prompt: `You are an expert Solidity instructor that helps students learn Solidity.

You will validate the user's answer to a fill-in-the-blank question. Return whether the answer is correct, and provide some feedback to the user explaining why their answer was correct or incorrect.

Code Snippet: {{{codeSnippet}}}
User Answer: {{{userAnswer}}}
Correct Answer: {{{correctAnswer}}}`,
});

const validateSolidityAnswerFlow = ai.defineFlow(
  {
    name: 'validateSolidityAnswerFlow',
    inputSchema: ValidateSolidityAnswerInputSchema,
    outputSchema: ValidateSolidityAnswerOutputSchema,
  },
  async input => {
    const {correctAnswer, userAnswer} = input;
    const isCorrect = correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();

    if (isCorrect) {
      return {
        isCorrect: true,
        feedback: 'Correct! Great job!',
      };
    } else {
      const {output} = await validateSolidityAnswerPrompt(input);
      return {
        isCorrect: false,
        feedback: output!.feedback,
      };
    }
  }
);
