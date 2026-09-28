import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';
import * as fs from 'fs';
import * as path from 'path';

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

  // Strict regex for positive integer validation (rejects 0, negative numbers, decimals, non-digits)
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
    const jsonOutput = generator.generateJSONReport(report);
    const mdOutput = generator.generateMarkdownReport(report);
    const htmlOutput = generator.generateHTMLReport(report);

    // Ensure reports directory exists and save files in standard pr-<number>-review.* format
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(reportsDir, `pr-${prNumber}-review.json`), jsonOutput);
    fs.writeFileSync(path.join(reportsDir, `pr-${prNumber}-review.md`), mdOutput);
    fs.writeFileSync(path.join(reportsDir, `pr-${prNumber}-review.html`), htmlOutput);

    console.log('Review reports generated successfully under reports/');
  } catch (error: any) {
    console.error(`Error generating review report: ${error.message || error}`);
    process.exit(1);
  }
}

main();