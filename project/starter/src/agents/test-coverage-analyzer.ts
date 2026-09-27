import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { testCoveragePrompt } from '../prompts/test-coverage-analyzer.prompt.js';

export const testCoverageAgent: AgentDefinition = {
  description: 'Identifies untested code paths, evaluates test gaps, and suggests actionable unit test cases.',
  prompt: testCoveragePrompt,
  tools: ['github', 'Skill'],
};