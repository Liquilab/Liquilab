#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TOKEN_DEFAULT_PATH = path.join(ROOT, 'public', 'media', 'tokens', 'token-default.svg');
const LEGACY_ICONS_DIR = path.join(ROOT, 'public', 'icons');

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dirPath) {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

async function main() {
  const hasDefaultIcon = await pathExists(TOKEN_DEFAULT_PATH);
  const legacyFiles = await listFiles(LEGACY_ICONS_DIR);

  const result = {
    ok: hasDefaultIcon,
    hasDefaultIcon,
    legacyIconsPresent: legacyFiles.length > 0,
  };

  console.log(JSON.stringify(result, null, 2));
  process.exit(hasDefaultIcon ? 0 : 1);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error?.message ?? String(error) }));
  process.exit(1);
});
