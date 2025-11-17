#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const componentPath = path.join(ROOT, 'components', 'rangeband', 'RangeBand.tsx');

function fail(msg) {
  console.error(`[verify:rangeband] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(componentPath)) fail('RangeBand component missing at components/rangeband/RangeBand.tsx');

const forbiddenStrings = ['bandColor =', 'positionRatio ='];
const scanRoots = [path.join(ROOT, 'components'), path.join(ROOT, 'src', 'components')];

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  for (const needle of forbiddenStrings) {
    if (content.includes(needle) && path.resolve(file) !== path.resolve(componentPath)) {
      fail(`found computed ${needle.replace(' =', '')} in ${path.relative(ROOT, file)}`);
    }
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) scanFile(full);
  }
}

scanFile(componentPath);
scanRoots.forEach(walk);
console.log('[verify:rangeband] OK');
