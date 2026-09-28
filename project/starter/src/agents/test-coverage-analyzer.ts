export const testCoverageAgent = {
  description: 'Analyzes test coverage, identifies untested paths, missing edge cases, and test quality in the pull request.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  prompt: `You are a test coverage expert. Review the pull request files and tests to identify untested paths, missing unit tests, and edge cases that lack proper test coverage.`,
};