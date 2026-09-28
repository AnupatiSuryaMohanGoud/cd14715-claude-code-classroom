import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: npm run dev -- <owner> <repo> <prNumber>');
    process.exit(1);
  }

  const [owner, repo, prArg] = args;
  if (!owner || !repo || !prArg) {
    console.error('Error: Owner, repo, and PR number are all required.');
    process.exit(1);
  }

  // Strict regular expression validation for positive integers (> 0)
  const prRegex = /^[1-9]\d*$/;
  if (!prRegex.test(prArg)) {
    console.error('Error: PR number must be a valid positive integer greater than 0.');
    process.exit(1);
  }

  const prNumber = parseInt(prArg, 10);

  try {
    console.log(`Starting code review for ${owner}/${repo} PR #${prNumber}...`);
    const orchestrator = new CodeReviewOrchestrator();
    const report = await orchestrator.reviewPullRequest(owner, repo, prNumber);

    const generator = new ReportGenerator();
    await generator.generateReports(report);

    console.log('Review reports generated successfully under reports/');
  } catch (error: any) {
    console.error(`Error generating review report: ${error.message || error}`);
    process.exit(1);
  }
}

main();