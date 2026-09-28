import { ReviewReport } from '../types/report-types.js';
import * as fs from 'fs';
import * as path from 'path';

export class ReportGenerator {
  generateMarkdown(report: ReviewReport): string {
    return this.generateMarkdownReport(report);
  }

  generateHtml(report: ReviewReport): string {
    return this.generateHTMLReport(report);
  }

  generateHTML(report: ReviewReport): string {
    return this.generateHTMLReport(report);
  }

  generateJson(report: ReviewReport): string {
    return this.generateJSONReport(report);
  }

  generateJSON(report: ReviewReport): string {
    return this.generateJSONReport(report);
  }

  generateMarkdownReport(report: ReviewReport): string {
    const { summary, recommendations = [], fileReviews = [] } = report || {};

    const formattedRecs = (recommendations || []).slice(0, 5).map((rec, idx) => {
      const emoji: Record<string, string> = {
        critical: '🚨',
        high: '⚠️',
        medium: '📌',
        low: '💡',
      };
      const priorityEmoji = emoji[rec.priority] || '📌';

      return `${idx + 1}. ${priorityEmoji} **${rec.category || 'Recommendation'}**: ${rec.description}`;
    }).join('\n\n');

    return `# 🔍 Code Review Report

## Summary

| Metric | Value |
|--------|-------|
| **Overall Score** | ${summary?.overallScore ?? 0}/100 |
| **Files Reviewed** | ${summary?.totalFiles ?? 0} |
| **Critical Issues** | ${summary?.criticalIssues ?? 0} |

## 🎯 Top Recommendations

${formattedRecs || 'No recommendations at this time.'}`;
  }

  generateHTMLReport(report: ReviewReport): string {
    const { summary, recommendations = [] } = report || {};
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Code Review Report</title></head>
<body>
  <h1>Code Review Report</h1>
  <p>Overall Score: ${summary?.overallScore ?? 0}/100</p>
</body>
</html>`;
  }

  generateJSONReport(report: ReviewReport): string {
    return JSON.stringify(report, null, 2);
  }

  async saveReports(prNumber: number, outputs: { json: string; markdown: string; html: string }): Promise<void> {
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    fs.writeFileSync(path.join(reportsDir, `pr-${prNumber}-review.json`), outputs.json);
    fs.writeFileSync(path.join(reportsDir, `pr-${prNumber}-review.md`), outputs.markdown);
    fs.writeFileSync(path.join(reportsDir, `pr-${prNumber}-review.html`), outputs.html);
  }

  async generateReports(report: ReviewReport): Promise<void> {
    const jsonOutput = this.generateJSONReport(report);
    const mdOutput = this.generateMarkdownReport(report);
    const htmlOutput = this.generateHTMLReport(report);

    const prNum = (report as any).prNumber || report.pullRequest?.number || 1;
    await this.saveReports(prNum, {
      json: jsonOutput,
      markdown: mdOutput,
      html: htmlOutput,
    });
  }
}