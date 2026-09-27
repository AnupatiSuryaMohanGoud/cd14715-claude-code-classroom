import { ReviewReport } from '../types/report-types.js';

export class ReportGenerator {
  /**
   * Alias methods for generateMarkdownReport
   */
  generateMarkdown(report: ReviewReport): string {
    return this.generateMarkdownReport(report);
  }

  /**
   * Alias methods for generateHTMLReport
   */
  generateHtml(report: ReviewReport): string {
    return this.generateHTMLReport(report);
  }

  generateHTML(report: ReviewReport): string {
    return this.generateHTMLReport(report);
  }

  /**
   * Alias methods for generateJSONReport
   */
  generateJson(report: ReviewReport): string {
    return this.generateJSONReport(report);
  }

  generateJSON(report: ReviewReport): string {
    return this.generateJSONReport(report);
  }

  /**
   * Generate a Markdown report for PR comments
   */
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

      return `${idx + 1}. ${priorityEmoji} **${rec.category || 'Recommendation'}**: ${rec.description}${
        rec.files && rec.files.length > 0 ? `\n   - Files: ${rec.files.join(', ')}` : ''
      }`;
    }).join('\n\n');

    const formattedFiles = (fileReviews || []).map(review => {
      const { file, codeQuality, testCoverage, refactoring } = review as any;

      const issueList = (codeQuality?.issues || []).slice(0, 3)
        .map((i: any) => `   - Line ${i.line}: \`${i.severity}\` ${i.description}`)
        .join('\n');

      const testList = (testCoverage?.untestedPaths || []).slice(0, 2)
        .map((p: any) => `   - \`${p.location}\` (${p.priority} priority)`)
        .join('\n');

      const refactorList = (refactoring?.suggestions || []).slice(0, 2)
        .map((s: any) => `   - **${s.type}**: ${s.description}`)
        .join('\n');

      return `### 📄 \`${file}\`

**Quality Score:** ${codeQuality?.overallScore || 0}/100 | **Coverage:** ~${testCoverage?.coveragePercent || 0}%

#### Issues (${codeQuality?.issues?.length || 0})
${issueList || '   None found'}
${codeQuality?.issues?.length > 3 ? `\n   *...and ${codeQuality.issues.length - 3} more*` : ''}

#### Test Gaps (${testCoverage?.untestedPaths?.length || 0})
${testList || '   None found'}
${testCoverage?.untestedPaths?.length > 2 ? `\n   *...and ${testCoverage.untestedPaths.length - 2} more*` : ''}

#### Refactoring Opportunities (${refactoring?.suggestions?.length || 0})
${refactorList || '   None found'}
${refactoring?.suggestions?.length > 2 ? `\n   *...and ${refactoring.suggestions.length - 2} more*` : ''}`;
    }).join('\n\n---\n\n');

    const metadataTime = (report?.metadata as any)?.analyzedAt || (report?.metadata as any)?.timestamp || new Date().toISOString();
    const metadataDuration = (report?.metadata as any)?.duration ?? (report?.metadata as any)?.durationMs ?? 0;

    return `# 🔍 Code Review Report

## Summary

| Metric | Value |
|--------|-------|
| **Overall Score** | ${summary?.overallScore ?? 0}/100 |
| **Files Reviewed** | ${summary?.totalFiles ?? 0} |
| **Critical Issues** | ${summary?.criticalIssues ?? 0} |
| **High Priority Tests** | ${summary?.highPriorityTests ?? 0} |
| **Refactoring Opportunities** | ${summary?.refactoringOpportunities ?? 0} |

## 🎯 Top Recommendations

${formattedRecs || 'No recommendations at this time.'}

## 📁 File Details

${formattedFiles}

---

*Generated at ${metadataTime} • Duration: ${metadataDuration}ms*`;
  }

  /**
   * Generate an HTML report for web display
   */
  generateHTMLReport(report: ReviewReport): string {
    const { summary, recommendations = [], metadata } = report || {};

    const recList = (recommendations || []).slice(0, 5).map(r => `
      <li class="rec-${r.priority}">
        <span class="priority">[${r.priority.toUpperCase()}]</span>
        <strong>${r.category || 'Recommendation'}</strong>: ${r.description}
        ${r.files && r.files.length > 0 ? `<br><small>Files: ${r.files.join(', ')}</small>` : ''}
      </li>
    `).join('');

    const metadataTime = (metadata as any)?.analyzedAt || (metadata as any)?.timestamp || new Date().toISOString();
    const metadataDuration = (metadata as any)?.duration ?? (metadata as any)?.durationMs ?? 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Review Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
      background: #f8f9fa;
      color: #212529;
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 12px; }
    .summary {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin: 24px 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    .metric { text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: #3498db; }
    .metric-label { color: #6c757d; font-size: 0.9em; }
    ul { list-style: none; padding: 0; }
    li { padding: 12px; margin: 8px 0; border-radius: 4px; background: white; }
    .rec-critical { border-left: 4px solid #e74c3c; }
    .rec-high { border-left: 4px solid #f39c12; }
    .rec-medium { border-left: 4px solid #3498db; }
    .rec-low { border-left: 4px solid #27ae60; }
    .priority { font-weight: bold; margin-right: 8px; }
    .rec-critical .priority { color: #e74c3c; }
    .rec-high .priority { color: #f39c12; }
    .rec-medium .priority { color: #3498db; }
    .rec-low .priority { color: #27ae60; }
    footer { text-align: center; color: #6c757d; margin-top: 32px; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>🔍 Code Review Report</h1>

  <div class="summary">
    <div class="metric">
      <div class="metric-value">${summary?.overallScore ?? 0}</div>
      <div class="metric-label">Overall Score</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary?.totalFiles ?? 0}</div>
      <div class="metric-label">Files Reviewed</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary?.criticalIssues ?? 0}</div>
      <div class="metric-label">Critical Issues</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary?.highPriorityTests ?? 0}</div>
      <div class="metric-label">Tests Needed</div>
    </div>
    <div class="metric">
      <div class="metric-value">${summary?.refactoringOpportunities ?? 0}</div>
      <div class="metric-label">Refactorings</div>
    </div>
  </div>

  <h2>🎯 Top Recommendations</h2>
  <ul>${recList || '<li>No recommendations at this time.</li>'}</ul>

  <footer>
    Generated at ${metadataTime} • Duration: ${metadataDuration}ms
  </footer>
</body>
</html>`;
  }

  /**
   * Generate formatted JSON report
   */
  generateJSONReport(report: ReviewReport): string {
    return JSON.stringify(report, null, 2);
  }
}