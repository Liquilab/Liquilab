#!/usr/bin/env node
/**
 * No Remote Icons Verifier
 * 
 * Scans built assets for remote icon references (static.dexscreener.com)
 * and legacy icon paths (/icons/). Exits 1 if any found.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const REMOTE_BLOCK_PATTERN = /static\.dexscreener\.com/i;
const REMOTE_ICON_URL = /(https?:\/\/[^\s"'`<>()]*?(token-icons|coins\/images)[^\s"'`<>()]*)/gi;
const ALLOWED_REMOTE_HOSTS = new Set(['assets.coingecko.com']);
// Legacy path: /icons/ (not /media/icons/ which is our fallback)
const LEGACY_PATTERN = /\/icons\//;

function isLegacyPath(content, match) {
  const index = content.indexOf(match);
  if (index === -1) return false;
  // Check if it's preceded by /media
  const before = content.substring(Math.max(0, index - 6), index);
  return before !== '/media';
}

function shouldSkipFile(relPath) {
  // Skip documentation files
  if (relPath.includes('/docs/') || relPath.includes('.md')) return true;
  // Skip build manifests (they contain route patterns, not actual paths)
  if (relPath.includes('_buildManifest.js')) return true;
  return false;
}

async function scanDirectory(dirPath, relativePath = '') {
  const results = { remoteRefs: [], legacyPaths: [] };
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        const subResults = await scanDirectory(fullPath, relPath);
        results.remoteRefs.push(...subResults.remoteRefs);
        results.legacyPaths.push(...subResults.legacyPaths);
      } else if (entry.isFile()) {
        if (shouldSkipFile(relPath)) continue;
        
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          
          if (REMOTE_BLOCK_PATTERN.test(content)) {
            results.remoteRefs.push(relPath);
          }

          const remoteMatches = content.matchAll(REMOTE_ICON_URL);
          for (const match of remoteMatches) {
            try {
              const url = new URL(match[0]);
              if (!ALLOWED_REMOTE_HOSTS.has(url.hostname)) {
                results.remoteRefs.push(relPath);
                break;
              }
            } catch {
              results.remoteRefs.push(relPath);
              break;
            }
          }
          
          const legacyMatches = content.match(LEGACY_PATTERN);
          if (legacyMatches) {
            for (const match of legacyMatches) {
              if (isLegacyPath(content, match)) {
                results.legacyPaths.push(relPath);
                break;
              }
            }
          }
        } catch (e) {
          // Skip binary files or read errors
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist or permission error
  }
  
  return results;
}

async function main() {
  const results = { remoteRefs: [], legacyPaths: [] };
  
  // Scan .next/static
  const nextStaticPath = path.join(ROOT, '.next', 'static');
  const nextResults = await scanDirectory(nextStaticPath, '.next/static');
  results.remoteRefs.push(...nextResults.remoteRefs);
  results.legacyPaths.push(...nextResults.legacyPaths);
  
  // Scan public/
  const publicPath = path.join(ROOT, 'public');
  const publicResults = await scanDirectory(publicPath, 'public');
  results.remoteRefs.push(...publicResults.remoteRefs);
  results.legacyPaths.push(...publicResults.legacyPaths);
  
  console.log(JSON.stringify(results, null, 2));
  
  if (results.remoteRefs.length > 0 || results.legacyPaths.length > 0) {
    process.exit(1);
  }
  
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});
