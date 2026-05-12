#!/usr/bin/env bun
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';

interface ModuleExpectation {
  slug: string;
  upstreamUrl: string;
  requiredPaths: string[];
}

interface SourceManifest {
  kind: string;
  schemaVersion: number;
  slug: string;
  upstream: {
    url: string;
    branch: string;
    commit: string;
  };
  copiedPaths: string[];
  refreshCommand: string;
  advisoryBoundary: string;
}

interface ValidationResult {
  ok: boolean;
  errors: string[];
  checkedFiles: number;
}

const MODULES: ModuleExpectation[] = [
  {
    slug: 'bmad-method',
    upstreamUrl: 'https://github.com/bmad-code-org/BMAD-METHOD',
    requiredPaths: ['source.json', 'src/core-skills/bmad-help/SKILL.md', 'src/core-skills/module-help.csv', 'src/bmm-skills/module-help.csv'],
  },
  {
    slug: 'bmad-builder',
    upstreamUrl: 'https://github.com/bmad-code-org/bmad-builder',
    requiredPaths: ['source.json', '.claude-plugin/marketplace.json', 'skills/bmad-agent-builder/SKILL.md', 'skills/bmad-module-builder/SKILL.md', 'skills/bmad-workflow-builder/SKILL.md'],
  },
  {
    slug: 'bmad-method-test-architecture-enterprise',
    upstreamUrl: 'https://github.com/bmad-code-org/bmad-method-test-architecture-enterprise',
    requiredPaths: ['source.json', 'src/module.yaml', 'src/agents', 'src/workflows'],
  },
  {
    slug: 'bmad-method-wds-expansion',
    upstreamUrl: 'https://github.com/bmad-code-org/bmad-method-wds-expansion',
    requiredPaths: ['source.json', 'src/module.yaml', 'src/agents', 'src/workflows'],
  },
];

const BANNED_SEGMENTS = new Set(['.git', 'node_modules', 'dist', 'coverage', '.cache']);
const ROUTE_FIXTURES = [
  { prompt: 'build a BMAD module agent workflow', expected: ['BMad Builder', 'moduleAwareness'] },
  { prompt: 'create ATDD test architecture traceability NFR plan', expected: ['Test Architect Enterprise', 'ATDD', 'NFR'] },
  { prompt: 'WDS trigger map design system UX scenarios', expected: ['WDS', 'trigger map', 'design system'] },
  {
    prompt: 'Google Apps Script and OfficeJS MCP',
    expected: ['host.mcp.context7.google-apps-script.docs', 'host.mcp.context7.office-js-live.docs', 'mcpAwareness'],
  },
];

function assertManifest(value: unknown): SourceManifest {
  if (typeof value !== 'object' || value === null) {
    throw new Error('source.json is not an object');
  }
  const manifest = value as SourceManifest;
  if (manifest.kind !== 'archon-bmad-upstream-vendor-source') {
    throw new Error('source.json kind mismatch');
  }
  if (manifest.schemaVersion !== 1) {
    throw new Error('source.json schemaVersion mismatch');
  }
  if (!manifest.upstream || typeof manifest.upstream.url !== 'string' || typeof manifest.upstream.commit !== 'string') {
    throw new Error('source.json upstream fields missing');
  }
  if (!Array.isArray(manifest.copiedPaths)) {
    throw new Error('source.json copiedPaths missing');
  }
  if (typeof manifest.refreshCommand !== 'string' || !manifest.refreshCommand.includes('refresh-bmad-vendor.ts')) {
    throw new Error('source.json refresh command missing');
  }
  if (typeof manifest.advisoryBoundary !== 'string' || !manifest.advisoryBoundary.includes('route evidence only')) {
    throw new Error('source.json advisory boundary missing');
  }
  return manifest;
}

function walkFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const fullPath = resolve(root, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function fileContains(path: string, text: string): boolean {
  return readFileSync(path, 'utf8').includes(text);
}

export function validateBmadVendor(repoRoot: string = resolve(import.meta.dir, '../..')): ValidationResult {
  const errors: string[] = [];
  const vendorRoot = resolve(repoRoot, '.archon/bmad/vendor');
  const routeCommand = resolve(repoRoot, '.archon/commands/bmad-route-first.md');
  const intakeCommand = resolve(repoRoot, '.archon/commands/bmad-intake.md');
  const workflowFile = resolve(repoRoot, '.archon/workflows/bmad-route-first.yaml');
  const pluginJson = resolve(repoRoot, '.archon/codex/plugins/archon-bmad/.codex-plugin/plugin.json');
  const pluginSkill = resolve(repoRoot, '.archon/codex/plugins/archon-bmad/skills/archon-bmad/SKILL.md');

  for (const module of MODULES) {
    const moduleRoot = resolve(vendorRoot, module.slug);
    if (!existsSync(moduleRoot)) {
      errors.push(`Missing vendor module: ${module.slug}`);
      continue;
    }

    for (const requiredPath of module.requiredPaths) {
      if (!existsSync(resolve(moduleRoot, requiredPath))) {
        errors.push(`Missing ${module.slug}/${requiredPath}`);
      }
    }

    const manifestPath = resolve(moduleRoot, 'source.json');
    if (existsSync(manifestPath)) {
      try {
        const manifest = assertManifest(JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown);
        if (manifest.slug !== module.slug) {
          errors.push(`source.json slug mismatch for ${module.slug}`);
        }
        if (manifest.upstream.url !== module.upstreamUrl) {
          errors.push(`source.json upstream URL mismatch for ${module.slug}`);
        }
        if (!/^[0-9a-f]{40}$/i.test(manifest.upstream.commit)) {
          errors.push(`source.json commit is not a full SHA for ${module.slug}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${module.slug}/source.json invalid: ${message}`);
      }
    }
  }

  const checkedFiles = walkFiles(vendorRoot);
  for (const file of checkedFiles) {
    const parts = relative(vendorRoot, file).split('/');
    if (parts.some((part) => BANNED_SEGMENTS.has(part))) {
      errors.push(`Banned copied path: ${relative(vendorRoot, file)}`);
    }
    if (file.includes('MissionCTL')) {
      errors.push(`MissionCTL path leaked into vendor tree: ${file}`);
    }
    if (file.endsWith('.json') || file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.csv') || file.endsWith('.ts')) {
      if (fileContains(file, 'MissionCTL')) {
        errors.push(`MissionCTL content leaked into ${relative(vendorRoot, file)}`);
      }
    }
  }

  const capabilityLabCommand = resolve(repoRoot, '.archon/commands/archon-capability-lab.md');
  const capabilityLabScript = resolve(repoRoot, '.archon/scripts/capability-lab.ts');
  const capabilityLabSkill = resolve(repoRoot, '.archon/codex/plugins/archon-bmad/skills/archon-capability-lab/SKILL.md');

  for (const file of [routeCommand, intakeCommand, workflowFile, pluginJson, pluginSkill]) {
    if (!existsSync(file)) {
      errors.push(`Missing route surface: ${relative(repoRoot, file)}`);
      continue;
    }
    const content = readFileSync(file, 'utf8');
    if (!content.includes('moduleAwareness')) {
      errors.push(`moduleAwareness missing in ${relative(repoRoot, file)}`);
    }
  }

  for (const file of [capabilityLabCommand, capabilityLabScript, capabilityLabSkill]) {
    if (!existsSync(file)) {
      errors.push(`Missing capability lab surface: ${relative(repoRoot, file)}`);
      continue;
    }
    const content = readFileSync(file, 'utf8');
    if (!content.includes('forge-draft') || !content.includes('probe')) {
      errors.push(`Capability lab surface lacks generic operations: ${relative(repoRoot, file)}`);
    }
  }

  const routeContent = existsSync(routeCommand) ? readFileSync(routeCommand, 'utf8') : '';
  for (const fixture of ROUTE_FIXTURES) {
    for (const expected of fixture.expected) {
      if (!routeContent.includes(expected)) {
        errors.push(`Route fixture "${fixture.prompt}" missing expected text: ${expected}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    checkedFiles: checkedFiles.length,
  };
}

if (import.meta.main) {
  const result = validateBmadVendor();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}
