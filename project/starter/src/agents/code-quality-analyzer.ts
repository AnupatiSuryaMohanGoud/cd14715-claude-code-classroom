import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { codeQualityPrompt } from '../prompts/code-quality-analyzer.prompt.js';

export const codeQualityAgent: AgentDefinition = {
  description: 'Analyzes PR code for security vulnerabilities, performance bottlenecks, and style issues.',
  prompt: codeQualityPrompt,
  tools: ['github', 'eslint', 'Skill'],
};