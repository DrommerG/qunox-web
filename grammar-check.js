#!/usr/bin/env node
/**
 * grammar-check.js — Spanish punctuation checker for QUNOX website
 * Usage: node grammar-check.js
 *
 * Scans all HTML files for common Spanish punctuation issues.
 * Does NOT modify files — reports only.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

// Collect all HTML files
function getHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'images', 'js', 'css'].includes(entry.name)) {
      getHtmlFiles(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// Extract visible text from HTML (strip tags)
function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&[a-z]+;/gi, ' ');
}

// Punctuation rules
const RULES = [
  {
    name: 'Double space',
    test: /  +/g,
    message: 'Double (or more) consecutive spaces'
  },
  {
    name: 'Space before punctuation',
    test: / [,;:.!?]/g,
    message: 'Space before punctuation mark'
  },
  {
    name: 'Missing space after comma',
    test: /,[^ \n"'<]/g,
    message: 'Missing space after comma'
  },
  {
    name: 'Missing space after period (mid-sentence)',
    test: /\.[a-záéíóúñA-ZÁÉÍÓÚÑ]/g,
    message: 'Missing space after period (or false positive if URL/decimal)'
  },
  {
    name: 'Sentence starting with lowercase (after period)',
    test: /\. [a-záéíóúñ]/g,
    message: 'Possible sentence starting with lowercase after period'
  },
  {
    name: 'Repeated punctuation',
    test: /[,;:]{2,}/g,
    message: 'Repeated punctuation marks'
  }
];

let totalIssues = 0;

for (const file of getHtmlFiles(ROOT)) {
  const rel     = path.relative(ROOT, file);
  const raw     = fs.readFileSync(file, 'utf8');
  const text    = extractText(raw);
  const lines   = text.split('\n');
  const issues  = [];

  for (const rule of RULES) {
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li].trim();
      if (!line) continue;
      const matches = [...line.matchAll(rule.test)];
      for (const m of matches) {
        issues.push({
          line: li + 1,
          col:  m.index,
          rule: rule.name,
          msg:  rule.message,
          ctx:  line.slice(Math.max(0, m.index - 20), m.index + 30).replace(/\s+/g, ' ')
        });
      }
    }
  }

  if (issues.length) {
    console.log(`\n── ${rel} (${issues.length} issue${issues.length > 1 ? 's' : ''}) ──`);
    for (const iss of issues) {
      console.log(`  [${iss.rule}] Line ${iss.line}: ${iss.msg}`);
      console.log(`    → "...${iss.ctx}..."`);
    }
    totalIssues += issues.length;
  }
}

if (totalIssues === 0) {
  console.log('✓ No punctuation issues found.');
} else {
  console.log(`\n── Total: ${totalIssues} potential issue(s) found ──`);
  console.log('Review each in context — some may be false positives (URLs, numbers, etc.).');
}
