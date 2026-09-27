import { z } from 'zod';

export const CodeQualityIssueSchema = z.object({
  filePath: z.string(),
  lineNumber: z.number().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['security', 'performance', 'maintainability', 'style']),
  description: z.string(),
  suggestion: z.string(),
});

export const CodeQualityResultSchema = z.object({
  issues: z.array(CodeQualityIssueSchema),
  qualityScore: z.number().min(0).max(100),
});

export const CoverageSuggestionSchema = z.object({
  filePath: z.string(),
  functionName: z.string(),
  missingScenario: z.string(),
  suggestedCode: z.string(),
});

export const TestCoverageResultSchema = z.object({
  suggestions: z.array(CoverageSuggestionSchema),
  coverageEstimate: z.number().min(0).max(100),
});

export const RefactoringSuggestionSchema = z.object({
  filePath: z.string(),
  title: z.string(),
  description: z.string(),
  originalSnippet: z.string(),
  refactoredSnippet: z.string(),
});

export const RefactoringResultSchema = z.object({
  suggestions: z.array(RefactoringSuggestionSchema),
  maintainabilityScore: z.number().min(0).max(100),
});

export const ReviewReportSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  prNumber: z.number(),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  codeQuality: CodeQualityResultSchema,
  testCoverage: TestCoverageResultSchema,
  refactoring: RefactoringResultSchema,
});

export type ReviewReport = z.infer<typeof ReviewReportSchema>;