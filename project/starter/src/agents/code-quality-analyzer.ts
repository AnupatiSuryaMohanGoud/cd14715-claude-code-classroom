export const codeQualityAgent = {
  description: 'Analyzes code quality, security, and performance best practices in the provided pull request files.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  prompt: `You are a code quality analysis expert. Analyze the provided pull request files for code smells, security vulnerabilities, performance bottlenecks, and adherence to best practices.`,
};