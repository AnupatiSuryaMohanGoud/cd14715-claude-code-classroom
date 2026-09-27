import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';

// Load environment variables
dotenv.config();

async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  // 1. Validate command-line arguments
  if (!owner || !repo || !prStr) {
    console.error('Error: Missing required arguments.');
    console.error('Usage: npm run dev <owner> <repo> <pr-number>');
    process.exit(1);
  }

  const prNumber = parseInt(prStr, 10);
  if (isNaN(prNumber)) {
    console.error('Error: <pr-number> must be a valid integer.');
    process.exit(1);
  }

  // 2. Validate authentication
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasBedrock = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

  if (!hasAnthropic && !hasBedrock) {
    console.error('Error: No authentication method configured.');
    console.error('Provide either ANTHROPIC_API_KEY or AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).');
    process.exit(1);
  }

  if (hasBedrock) {
    if (!process.env.AWS_REGION) {
      console.error('Error: AWS_REGION is required when using AWS Bedrock.');
      process.exit(1);
    }
    console.log('Using AWS Bedrock authentication');
  } else {
    console.log('Using Anthropic API authentication');
  }

  // 3. Validate ANTHROPIC_MODEL environment variable
  if (!process.env.ANTHROPIC_MODEL) {
    console.error('Error: ANTHROPIC_MODEL environment variable is required.');
    process.exit(1);
  }

  try {
    // 4. Instantiate orchestrator
    const orchestrator = new CodeReviewOrchestrator();

    console.log(`Starting code review for ${owner}/${repo} PR #${prNumber}...`);
    const report = await orchestrator.reviewPullRequest(owner, repo, prNumber);

    // 5. Generate formatted reports
    const reportGenerator = new ReportGenerator();
const markdownReport = (reportGenerator as any).generateMarkdown(report);
const htmlReport = (reportGenerator as any).generateHtml(report);
    const jsonReport = JSON.stringify(report, null, 2);

    // Ensure output directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save report deliverables
    const baseFilename = `pr-${prNumber}-review`;
    fs.writeFileSync(path.join(reportsDir, `${baseFilename}.json`), jsonReport);
    fs.writeFileSync(path.join(reportsDir, `${baseFilename}.md`), markdownReport);
    fs.writeFileSync(path.join(reportsDir, `${baseFilename}.html`), htmlReport);

    console.log(`Successfully generated review reports for PR #${prNumber} in 'reports/' directory:`);
    console.log(`  - reports/${baseFilename}.json`);
    console.log(`  - reports/${baseFilename}.md`);
    console.log(`  - reports/${baseFilename}.html`);
  } catch (error) {
    console.error('Error generating review report:', error);
    process.exit(1);
  }
}

main();