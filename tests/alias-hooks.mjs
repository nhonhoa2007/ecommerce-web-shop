import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const aliases = [
  ['@server/', 'src/server'],
  ['@shared/', 'src/shared'],
  ['@client/', 'src/client'],
  ['@/', 'src'],
];
const extensions = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

function findFile(basePath) {
  return extensions
    .map((extension) => basePath + extension)
    .find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

export function resolve(specifier, context, nextResolve) {
  const mapping = aliases.find(([prefix]) => specifier.startsWith(prefix));
  if (mapping) {
    const [prefix, target] = mapping;
    const hit = findFile(path.join(projectRoot, target, specifier.slice(prefix.length)));
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }

  if (context.parentURL && specifier.startsWith('.')) {
    const parentPath = fileURLToPath(context.parentURL);
    const hit = findFile(path.resolve(path.dirname(parentPath), specifier));
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
