import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { refactoringPrompt } from '../prompts/refactoring-suggester.prompt.js';

export const refactoringAgent: AgentDefinition = {
  description: 'Recommends design patterns, modern code standards, dead code elimination, and refactoring opportunities.',
  prompt: refactoringPrompt,
  tools: ['github', 'Skill'],
};