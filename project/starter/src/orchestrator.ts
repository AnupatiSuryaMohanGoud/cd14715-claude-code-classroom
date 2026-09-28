import * as AgentSDK from '@anthropic-ai/claude-agent-sdk';
import { codeQualityAgent, testCoverageAgent, refactoringSuggester as refactoringAgent } from './agents/index.js';
import { orchestratorPrompt } from './prompts/orchestrator.prompt.js';
import { ReviewReportSchema } from './utils/schemas.js';
import { ReviewReport } from './types/report-types.js';
import { mcpServersConfig } from './config/mcp.config.js';

export interface OrchestratorOptions {
  rateLimit?: number;
  [key: string]: any;
}

export class CodeReviewOrchestrator {
  private options: OrchestratorOptions;

  constructor(options: OrchestratorOptions = {}) {
    this.options = options;
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const prompt = `Review Pull Request #${prNumber} for repository ${owner}/${repo}. Generate a complete review report containing summary, owner, repo, prNumber, codeQuality, testCoverage, and refactoring strictly following the output schema.`;

    const queryFn = AgentSDK.query;
    if (typeof queryFn !== 'function') {
      throw new Error('Could not resolve query function from @anthropic-ai/claude-agent-sdk');
    }

    const queryStream = queryFn({
      prompt,
      options: {
        systemPrompt: orchestratorPrompt,
        agents: {
          'code-quality-analyzer': codeQualityAgent,
          'test-coverage-analyzer': testCoverageAgent,
          'refactoring-suggester': refactoringAgent,
        },
        mcpServers: mcpServersConfig,
        allowedTools: [
          'Task',
          'mcp__github__get_pull_request',
          'mcp__github__get_pull_request_files',
          'mcp__eslint__lint_code'
        ],
        outputFormat: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              owner: { type: 'string' },
              repo: { type: 'string' },
              prNumber: { type: 'number' },
              overallScore: { type: 'number' },
              summary: { type: 'string' },
              codeQuality: { type: 'object' },
              testCoverage: { type: 'object' },
              refactoring: { type: 'object' }
            },
            required: ['owner', 'repo', 'prNumber', 'overallScore', 'summary', 'codeQuality', 'testCoverage', 'refactoring'],
          },
        },
      } as any,
    });

    let structuredOutput: any = null;

    for await (const message of queryStream) {
      if (message?.type === 'result' && (message as any).structured_output) {
        structuredOutput = (message as any).structured_output;
      }
    }

    if (!structuredOutput) {
      throw new Error('Orchestrator failed to produce structured output from the agent query.');
    }

    const parsed = ReviewReportSchema.safeParse(structuredOutput);

    if (!parsed.success) {
      throw new Error(`Review report failed schema validation: ${parsed.error.message}`);
    }

    return parsed.data as unknown as ReviewReport;
  }
}