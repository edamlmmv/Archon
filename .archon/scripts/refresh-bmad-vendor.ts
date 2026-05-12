#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { execFileAsync } from '../../packages/git/src/exec.ts';

interface VendorModule {
  slug: string;
  displayName: string;
  repoUrl: string;
  webUrl: string;
  branch: string;
  copyPaths: string[];
  routeFamilies: string[];
}

interface SourceManifest {
  kind: 'archon-bmad-upstream-vendor-source';
  schemaVersion: 1;
  slug: string;
  displayName: string;
  upstream: {
    repository: string;
    url: string;
    branch: string;
    commit: string;
  };
  copiedPaths: string[];
  missingPaths: string[];
  refreshCommand: string;
  advisoryBoundary: string;
  routeFamilies: string[];
}

interface RefreshResult {
  slug: string;
  commit: string;
  copiedPaths: string[];
  missingPaths: string[];
}

const ARCHON_ROOT = resolve(import.meta.dir, '../..');
const VENDOR_ROOT = resolve(ARCHON_ROOT, '.archon/bmad/vendor');
const REFRESH_COMMAND = 'bun .archon/scripts/refresh-bmad-vendor.ts';
const ADVISORY_BOUNDARY =
  'Vendored BMAD source is Archon route evidence only; it is not a skill install, runtime grant, MCP configuration, hook, agent, or tool-restriction authority.';

const VENDOR_MODULES: VendorModule[] = [
  {
    slug: 'bmad-method',
    displayName: 'BMAD Method',
    repoUrl: 'https://github.com/bmad-code-org/BMAD-METHOD.git',
    webUrl: 'https://github.com/bmad-code-org/BMAD-METHOD',
    branch: 'main',
    copyPaths: [
      'README.md',
      'package.json',
      'src/core-skills',
      'src/bmm-skills',
    ],
    routeFamilies: ['core-bmad', 'planning', 'implementation', 'review'],
  },
  {
    slug: 'bmad-builder',
    displayName: 'BMad Builder',
    repoUrl: 'https://github.com/bmad-code-org/bmad-builder.git',
    webUrl: 'https://github.com/bmad-code-org/bmad-builder',
    branch: 'main',
    copyPaths: ['README.md', 'package.json', '.claude-plugin/marketplace.json', 'skills'],
    routeFamilies: ['agent-builder', 'workflow-builder', 'module-builder'],
  },
  {
    slug: 'bmad-method-test-architecture-enterprise',
    displayName: 'Test Architect Enterprise',
    repoUrl: 'https://github.com/bmad-code-org/bmad-method-test-architecture-enterprise.git',
    webUrl: 'https://github.com/bmad-code-org/bmad-method-test-architecture-enterprise',
    branch: 'main',
    copyPaths: [
      'README.md',
      'package.json',
      '.claude-plugin/marketplace.json',
      'src/module.yaml',
      'src/module-help.csv',
      'src/agents',
      'src/workflows',
    ],
    routeFamilies: ['test-architecture', 'atdd', 'nfr', 'traceability', 'ci', 'playwright'],
  },
  {
    slug: 'bmad-method-wds-expansion',
    displayName: 'WDS UX',
    repoUrl: 'https://github.com/bmad-code-org/bmad-method-wds-expansion.git',
    webUrl: 'https://github.com/bmad-code-org/bmad-method-wds-expansion',
    branch: 'main',
    copyPaths: [
      'README.md',
      'package.json',
      '.claude-plugin/marketplace.json',
      'src/module.yaml',
      'src/module-help.csv',
      'src/agents',
      'src/workflows',
    ],
    routeFamilies: ['wds', 'ux-strategy', 'trigger-map', 'scenarios', 'design-system', 'design-first'],
  },
];

function assertSafeRelativePath(path: string): void {
  if (path.startsWith('/') || path.includes('..') || path.includes('\\')) {
    throw new Error(`Unsafe vendor copy path: ${path}`);
  }
}

async function runGit(args: string[], cwd?: string): Promise<string> {
  const result = await execFileAsync('git', args, {
    cwd,
    timeout: 120_000,
    maxBuffer: 20 * 1024 * 1024,
  });
  return result.stdout.trim();
}

async function cloneSparse(module: VendorModule, cloneDir: string): Promise<string> {
  const sparsePatterns = module.copyPaths.map((copyPath) => {
    const lastSegment = copyPath.split('/').at(-1) ?? copyPath;
    return lastSegment.includes('.') ? copyPath : `${copyPath}/**`;
  });
  await runGit([
    'clone',
    '--depth=1',
    '--filter=blob:none',
    '--sparse',
    '--branch',
    module.branch,
    module.repoUrl,
    cloneDir,
  ]);
  await runGit(['sparse-checkout', 'set', '--no-cone', ...sparsePatterns], cloneDir);
  return await runGit(['rev-parse', 'HEAD'], cloneDir);
}

async function copyModule(module: VendorModule, cloneDir: string, stagingDir: string): Promise<Pick<RefreshResult, 'copiedPaths' | 'missingPaths'>> {
  const copiedPaths: string[] = [];
  const missingPaths: string[] = [];

  for (const copyPath of module.copyPaths) {
    assertSafeRelativePath(copyPath);
    const source = resolve(cloneDir, copyPath);
    if (!existsSync(source)) {
      missingPaths.push(copyPath);
      continue;
    }
    await cp(source, resolve(stagingDir, copyPath), {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
    copiedPaths.push(copyPath);
  }

  return { copiedPaths, missingPaths };
}

async function installStaging(slug: string, stagingDir: string): Promise<void> {
  const targetDir = resolve(VENDOR_ROOT, slug);
  const backupDir = resolve(VENDOR_ROOT, `.${slug}.backup-${process.pid}-${Date.now()}`);

  if (existsSync(targetDir)) {
    await rename(targetDir, backupDir);
  }

  try {
    await rename(stagingDir, targetDir);
    await rm(backupDir, { recursive: true, force: true });
  } catch (error) {
    if (existsSync(targetDir)) {
      await rm(targetDir, { recursive: true, force: true });
    }
    if (existsSync(backupDir)) {
      await rename(backupDir, targetDir);
    }
    throw error;
  }
}

async function refreshModule(module: VendorModule): Promise<RefreshResult> {
  const tempRoot = await mkdtemp(resolve(tmpdir(), `${module.slug}-vendor-`));
  const cloneDir = resolve(tempRoot, 'source');
  const stagingDir = resolve(VENDOR_ROOT, `.${module.slug}.staging-${process.pid}-${Date.now()}`);

  try {
    await rm(stagingDir, { recursive: true, force: true });
    await mkdir(stagingDir, { recursive: true });

    const commit = await cloneSparse(module, cloneDir);
    const { copiedPaths, missingPaths } = await copyModule(module, cloneDir, stagingDir);
    const manifest: SourceManifest = {
      kind: 'archon-bmad-upstream-vendor-source',
      schemaVersion: 1,
      slug: module.slug,
      displayName: module.displayName,
      upstream: {
        repository: module.repoUrl,
        url: module.webUrl,
        branch: module.branch,
        commit,
      },
      copiedPaths,
      missingPaths,
      refreshCommand: REFRESH_COMMAND,
      advisoryBoundary: ADVISORY_BOUNDARY,
      routeFamilies: module.routeFamilies,
    };

    await writeFile(resolve(stagingDir, 'source.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    await installStaging(module.slug, stagingDir);
    return { slug: module.slug, commit, copiedPaths, missingPaths };
  } catch (error) {
    await rm(stagingDir, { recursive: true, force: true });
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to refresh ${module.slug}; existing snapshot left unchanged. ${message}`);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  await mkdir(VENDOR_ROOT, { recursive: true });
  const results: RefreshResult[] = [];

  for (const module of VENDOR_MODULES) {
    results.push(await refreshModule(module));
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        vendorRoot: VENDOR_ROOT,
        results,
      },
      null,
      2,
    ),
  );
}

await main();
