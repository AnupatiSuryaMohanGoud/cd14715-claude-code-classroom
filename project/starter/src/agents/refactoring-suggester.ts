export const refactoringSuggester = {
  description: 'Evaluates architectural patterns, code organization, and provides refactoring suggestions for maintainability.',
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  prompt: `You are a software architecture and refactoring expert. Review the code changes for structural improvements, design patterns, modularity, and maintainability.`,
};