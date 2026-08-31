import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function fail(message) {
  console.error(`[FAIL] ${message}`);
  return false;
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function indentOf(line) {
  const match = line.match(/^\s*/);
  return match ? match[0].length : 0;
}

function findService(lines, name, indent) {
  const header = `${' '.repeat(indent)}${name}:`;
  const index = lines.findIndex(
    (line, i) =>
      lines[i].trim() !== '' &&
      !line.trimStart().startsWith('#') &&
      line.startsWith(header)
  );
  if (index < 0) {
    return { block: [], found: false };
  }

  let end = lines.length;
  for (let i = index + 1; i < lines.length; i += 1) {
    const raw = lines[i];
    if (!raw.trim() || raw.trimStart().startsWith('#')) {
      continue;
    }
    if (indentOf(raw) <= indent) {
      end = i;
      break;
    }
  }

  return { block: lines.slice(index + 1, end), found: true };
}

function readScalar(lines, key, expectedIndent) {
  const pattern = new RegExp(`^ {${expectedIndent}}${key}:\\s*(.+)$`);
  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function readList(lines, key, expectedIndent) {
  const keyPattern = new RegExp(`^ {${expectedIndent}}${key}:\\s*$`);
  const itemPrefix = new RegExp(`^ {${expectedIndent + 2}}-\\s*(.+)$`);
  const mapKeyPattern = new RegExp(`^ {${expectedIndent + 2}}([A-Za-z0-9._-]+)\\s*:\\s*.*$`);
  const start = lines.findIndex((line) => keyPattern.test(line));
  if (start < 0) return null;

  const items = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (indentOf(line) <= expectedIndent) break;

    const itemMatch = line.match(itemPrefix);
    if (itemMatch) {
      items.push(itemMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }

    const mapMatch = line.match(mapKeyPattern);
    if (mapMatch) {
      items.push(mapMatch[1].trim());
    }
  }
  return items;
}

function readMap(lines, key, expectedIndent) {
  const keyPattern = new RegExp(`^ {${expectedIndent}}${key}:\\s*$`);
  const start = lines.findIndex((line) => keyPattern.test(line));
  if (start < 0) return null;

  const map = {};
  const entryPattern = new RegExp(`^ {${expectedIndent + 2}}([^:#\\s]+)\\s*:\\s*(.*?)\\s*$`);
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (indentOf(line) <= expectedIndent) break;

    const itemMatch = line.match(entryPattern);
    if (itemMatch) {
      map[itemMatch[1]] = itemMatch[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return map;
}

function readKeys(lines, expectedIndent) {
  const pattern = new RegExp(`^ {${expectedIndent}}([^:#\\s]+)\\s*:`);
  const keys = [];
  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (indentOf(line) < expectedIndent) break;
    const match = line.match(pattern);
    if (match) keys.push(match[1]);
  }
  return keys;
}

function readEntries(lines, expectedIndent) {
  const pattern = new RegExp(`^ {${expectedIndent}}([^:#\\s]+)\\s*:\\s*(.*?)\\s*$`);
  const entries = {};
  for (const line of lines) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (indentOf(line) < expectedIndent) break;
    const match = line.match(pattern);
    if (match) entries[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return entries;
}

function sameEntries(actual, expected) {
  return (
    JSON.stringify(Object.entries(actual).sort()) ===
    JSON.stringify(Object.entries(expected).sort())
  );
}

function definitionsMatch(lines, expected) {
  return Object.entries(expected).every(([name, values]) => {
    const definition = findService(lines, name, 2);
    return definition.found && sameEntries(readEntries(definition.block, 4), values);
  });
}

function sortedArray(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

let ok = true;
function record(result, message) {
  ok = ok && result;
  if (!result) {
    console.error(message);
  }
}

const basePath = path.dirname(fileURLToPath(import.meta.url));
const betaText = fs.readFileSync(
  `${basePath}/docker-compose.beta.yaml`,
  'utf8'
);
const prodText = fs.readFileSync(
  `${basePath}/docker-compose.prod.yaml`,
  'utf8'
);
const betaLines = betaText.split(/\r?\n/);
const prodLines = prodText.split(/\r?\n/);

const servicesStart = betaLines.findIndex((line) => line.trim() === 'services:');
const betaServices = servicesStart >= 0 ? betaLines.slice(servicesStart) : betaLines;
const prodServices = prodLines.findIndex((line) => line.trim() === 'services:');
const prodServicesLines =
  prodServices >= 0 ? prodLines.slice(prodServices) : prodLines;

const betaService = findService(betaServices, 'crove-post-beta', 2);
if (!betaService.found) {
  ok = false;
  fail('Missing service crove-post-beta in scripts/docker-compose.beta.yaml');
} else {
  const lines = betaService.block;
  const image = readScalar(lines, 'image', 4);
  const command = readScalar(lines, 'command', 4);
  const pullPolicy = readScalar(lines, 'pull_policy', 4);
  const envFile = readList(lines, 'env_file', 4);
  const volumes = readList(lines, 'volumes', 4);
  const dependsOn = readList(lines, 'depends_on', 4);
  const networks = readList(lines, 'networks', 4);
  const restart = readScalar(lines, 'restart', 4);
  const environment = readMap(lines, 'environment', 4);
  const ports = readList(lines, 'ports', 4);

  record(
    image === '${CROVE_POST_BETA_IMAGE:-ghcr.io/dos/crove-post:beta}',
    `Beta image must use CROVE_POST_BETA_IMAGE with safe fallback: ${image}`
  );
  record(
    command ===
      '["sh", "-c", "nginx && pnpm exec pm2 ping && pnpm run --parallel pm2 && pnpm exec pm2 logs"]',
    `Beta startup command must be app-only PM2 flow: ${command}`
  );
  record(
    !/prisma.*push/.test((command || '').toLowerCase()),
    `Beta command must not include prisma db push: ${command}`
  );
  record(
    pullPolicy === 'always',
    `Beta pull policy must be always: ${pullPolicy}`
  );
  record(
    restart === 'always',
    `Beta restart policy must remain always: ${restart}`
  );
  record(
    envFile && envFile.length === 1 && envFile[0] === 'crove-server.beta.env',
    `Beta env_file must remain scripts/crove-server.beta.env: ${envFile}`
  );
  record(
    environment &&
      sameEntries(environment, { MASTRA_DISABLE_STORAGE_INIT: 'true' }),
    `MASTRA_DISABLE_STORAGE_INIT must be true: ${JSON.stringify(environment)}`
  );
  record(
    volumes &&
      sortedArray(volumes).toString() ===
        sortedArray(['postiz-beta-config:/config/', 'postiz-beta-uploads:/uploads/']).toString(),
    `Beta volume mounts must stay unchanged: ${JSON.stringify(volumes)}`
  );
  record(
    dependsOn &&
      sortedArray(dependsOn).toString() ===
        sortedArray(['crove-postgres-beta', 'crove-redis-beta']).toString(),
    `Beta depends_on services must remain Postgres and Redis only: ${JSON.stringify(dependsOn)}`
  );
  record(
    networks &&
      sortedArray(networks).toString() ===
        sortedArray([
          'crove-post-beta-network',
          'postiz-network',
          'temporal-network',
        ]).toString(),
    `Beta network attachment must remain unchanged: ${JSON.stringify(networks)}`
  );
  record(
    ports && ports.length === 1 && ports[0] === '127.0.0.1:5001:5000',
    `Beta published port must remain 127.0.0.1:5001:5000: ${JSON.stringify(ports)}`
  );
}

const betaVolumes = findService(betaLines, 'volumes', 0).block;
const betaNetworks = findService(betaLines, 'networks', 0).block;
const betaVolumeDefinitions = readKeys(betaVolumes, 2);
const betaNetworkDefinitions = readKeys(betaNetworks, 2);
record(
  sortedArray(betaVolumeDefinitions).toString() ===
    sortedArray([
      'postgres-beta-volume',
      'postiz-beta-config',
      'postiz-beta-uploads',
      'postiz-redis-beta-data',
    ]).toString(),
  `Beta volume definitions must remain unchanged: ${JSON.stringify(betaVolumeDefinitions)}`
);
record(
  definitionsMatch(betaVolumes, {
    'postgres-beta-volume': { name: 'crove_postgres-beta-volume' },
    'postiz-beta-config': { name: 'crove_postiz-beta-config' },
    'postiz-beta-uploads': { name: 'crove_postiz-beta-uploads' },
    'postiz-redis-beta-data': { name: 'crove_postiz-redis-beta-data' },
  }),
  'Beta volume definition properties must remain unchanged'
);
record(
  sortedArray(betaNetworkDefinitions).toString() ===
    sortedArray(['crove-post-beta-network', 'postiz-network', 'temporal-network']).toString(),
  `Beta network definitions must remain unchanged: ${JSON.stringify(betaNetworkDefinitions)}`
);
record(
  definitionsMatch(betaNetworks, {
    'crove-post-beta-network': { external: 'false' },
    'postiz-network': { external: 'true', name: 'crove_postiz-network' },
    'temporal-network': { external: 'true', name: 'crove_temporal-network' },
  }),
  'Beta network definition properties must remain unchanged'
);

const prodPost = findService(prodServicesLines, 'crove-post', 2);
if (!prodPost.found) {
  ok = false;
  fail('Missing service crove-post in scripts/docker-compose.prod.yaml');
} else {
  const prodLinesForService = prodPost.block;
  const image = readScalar(prodLinesForService, 'image', 4);
  const command = readScalar(prodLinesForService, 'command', 4);
  const restart = readScalar(prodLinesForService, 'restart', 4);
  const volumes = readList(prodLinesForService, 'volumes', 4);
  const envFile = readList(prodLinesForService, 'env_file', 4);
  const ports = readList(prodLinesForService, 'ports', 4);
  const networks = readList(prodLinesForService, 'networks', 4);
  const dependsOn = readList(prodLinesForService, 'depends_on', 4);
  const environment = readMap(prodLinesForService, 'environment', 4);
  record(
    image === 'ghcr.io/dos/crove-post:latest',
    `Production beta image must remain untouched: ${image}`
  );
  record(
    restart === 'always',
    `Production restart policy must remain always: ${restart}`
  );
  record(
    command === null,
    `Production crove-post must not define app startup command override: ${command}`
  );
  record(
    volumes &&
      sortedArray(volumes).toString() ===
        sortedArray([
          'postiz-config:/config/',
          'postiz-uploads:/uploads/',
        ]).toString(),
    `Production volumes for crove-post must remain unchanged: ${JSON.stringify(volumes)}`
  );
  record(
    envFile && envFile.length === 1 && envFile[0] === 'crove-server.env',
    `Production env_file must remain scripts/crove-server.env: ${envFile}`
  );
  record(
    ports && ports.length === 1 && ports[0] === '127.0.0.1:5000:5000',
    `Production published port must remain 127.0.0.1:5000:5000: ${JSON.stringify(ports)}`
  );
  record(
    networks &&
      sortedArray(networks).toString() ===
        sortedArray(['postiz-network', 'temporal-network']).toString(),
    `Production network attachment must remain unchanged: ${JSON.stringify(networks)}`
  );
  record(
    dependsOn &&
      sortedArray(dependsOn).toString() ===
        sortedArray(['crove-postgres', 'crove-redis']).toString(),
    `Production depends_on services must remain Postgres and Redis only: ${JSON.stringify(dependsOn)}`
  );
  record(
    environment === null,
    `Production crove-post must not define inline environment values: ${JSON.stringify(environment)}`
  );
}

const prodVolumes = findService(prodLines, 'volumes', 0).block;
const prodNetworks = findService(prodLines, 'networks', 0).block;
const prodVolumeDefinitions = readKeys(prodVolumes, 2);
const prodNetworkDefinitions = readKeys(prodNetworks, 2);
record(
  sortedArray(prodVolumeDefinitions).toString() ===
    sortedArray([
      'crove-web-data',
      'postgres-volume',
      'postiz-config',
      'postiz-redis-data',
      'postiz-uploads',
      'temporal-elasticsearch-data',
      'temporal-postgres-data',
    ]).toString(),
  `Production volume definitions must remain unchanged: ${JSON.stringify(prodVolumeDefinitions)}`
);
record(
  definitionsMatch(prodVolumes, {
    'crove-web-data': { name: 'crove_crove-web-data' },
    'postgres-volume': { name: 'crove_postgres-volume' },
    'postiz-config': { name: 'crove_postiz-config' },
    'postiz-redis-data': { name: 'crove_postiz-redis-data' },
    'postiz-uploads': { name: 'crove_postiz-uploads' },
    'temporal-elasticsearch-data': { name: 'crove_temporal-elasticsearch-data' },
    'temporal-postgres-data': { name: 'crove_temporal-postgres-data' },
  }),
  'Production volume definition properties must remain unchanged'
);
record(
  sortedArray(prodNetworkDefinitions).toString() ===
    sortedArray(['postiz-network', 'temporal-network']).toString(),
  `Production network definitions must remain unchanged: ${JSON.stringify(prodNetworkDefinitions)}`
);
record(
  definitionsMatch(prodNetworks, {
    'postiz-network': { name: 'crove_postiz-network' },
    'temporal-network': { name: 'crove_temporal-network' },
  }),
  'Production network definition properties must remain unchanged'
);

const betaImageEnv = process.env.CROVE_POST_BETA_IMAGE;
if (betaImageEnv) {
  const safeImage = /^ghcr\.io\/dos\/crove-post(?::[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}|@sha256:[0-9a-f]{64})$/;
  record(
    safeImage.test(betaImageEnv),
    `CROVE_POST_BETA_IMAGE must be a valid dos/crove-post reference: ${betaImageEnv}`
  );
}

if (ok) {
  console.log('[PASS] validate-beta-compose completed successfully');
  process.exit(0);
}

console.error('[FAIL] validate-beta-compose found one or more violations');
process.exit(1);
