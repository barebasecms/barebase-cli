#!/usr/bin/env node
// BareBase installer + launcher. Zero dependencies, single file.
// Free MIT front door: downloads the engine binary for this platform from barebase.io,
// verifies its sha256, caches it under ~/.barebase/bin, and forwards every engine command
// to it. `init` scaffolds a project without needing the engine at all.

import { writeFileSync, existsSync, mkdirSync, createWriteStream, chmodSync, renameSync, unlinkSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { homedir } from 'node:os'
import { createHash } from 'node:crypto'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const VERSION = '1.0.0'
const ENGINE_VERSION = '1.0.0'
const SITE = 'https://barebase.io'
const DL = `${SITE}/dl`
const BLUE = process.stdout.isTTY ? '\x1b[38;2;91;83;255m' : ''
const DIM = process.stdout.isTTY ? '\x1b[2m' : ''
const OFF = process.stdout.isTTY ? '\x1b[0m' : ''

function say(s = '') { process.stdout.write(s + '\n') }

function banner() {
  say(`${BLUE}barebase${OFF} ${DIM}v${VERSION}${OFF}  -  everything your backend needs, nothing it does not`)
}

function help() {
  banner()
  say()
  say('Usage: barebase <command> [options]')
  say()
  say('Commands:')
  say('  init [dir]     Scaffold a new BareBase project (config + starter)')
  say('  update         Re-download the engine binary for this platform')
  say('  version        Print the CLI version')
  say('  help           Show this help')
  say()
  say('Every other command (start, dev, migrate, import, ops, install, ...) runs the engine;')
  say('the binary is downloaded and sha256-verified on first use.')
  say()
  say(`Docs: ${SITE}`)
}

function platformArtifact() {
  const { platform, arch } = process
  if (platform === 'win32' && arch === 'x64') return `barebase-${ENGINE_VERSION}-windows-x64.exe`
  if (platform === 'darwin') return `barebase-${ENGINE_VERSION}-darwin-${arch === 'arm64' ? 'arm64' : 'x64'}`
  if (platform === 'linux') return `barebase-${ENGINE_VERSION}-linux-${arch === 'arm64' ? 'arm64' : 'x64'}`
  return null
}

async function expectedSha(artifact) {
  const res = await fetch(`${DL}/sha256sums.txt`)
  if (!res.ok) throw new Error(`sha256sums.txt: HTTP ${res.status}`)
  const text = await res.text()
  for (const line of text.split('\n')) {
    const [hash, name] = line.trim().split(/\s+/)
    if (name === artifact) return hash
  }
  throw new Error(`no checksum published for ${artifact}`)
}

async function downloadEngine() {
  const artifact = platformArtifact()
  if (!artifact) {
    say(`No prebuilt engine for ${process.platform}/${process.arch}.`)
    say(`Build from source or run via docker - see ${SITE}`)
    process.exit(1)
  }
  const binDir = join(homedir(), '.barebase', 'bin')
  mkdirSync(binDir, { recursive: true })
  const dest = join(binDir, artifact)
  const tmp = dest + '.part'
  say(`${BLUE}download${OFF} ${DL}/${artifact}`)
  const [sha, res] = await Promise.all([expectedSha(artifact), fetch(`${DL}/${artifact}`)])
  if (!res.ok) throw new Error(`${artifact}: HTTP ${res.status}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(tmp))
  const actual = createHash('sha256').update(readFileSync(tmp)).digest('hex')
  if (actual !== sha) {
    unlinkSync(tmp)
    throw new Error(`checksum mismatch for ${artifact}: expected ${sha}, got ${actual}`)
  }
  renameSync(tmp, dest)
  if (process.platform !== 'win32') chmodSync(dest, 0o755)
  say(`${BLUE}verified${OFF} sha256 ${DIM}${sha.slice(0, 16)}...${OFF}`)
  say(`${BLUE}installed${OFF} ${dest}`)
  return dest
}

async function enginePath({ force = false } = {}) {
  const artifact = platformArtifact()
  if (artifact) {
    const cached = join(homedir(), '.barebase', 'bin', artifact)
    if (!force && existsSync(cached)) return cached
  }
  return downloadEngine()
}

function writeIfAbsent(path, content) {
  if (existsSync(path)) { say(`${DIM}skip${OFF} ${path} (exists)`); return false }
  writeFileSync(path, content)
  say(`${BLUE}create${OFF} ${path}`)
  return true
}

function init(args) {
  const dir = resolve(args[0] || '.')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  banner()
  say()
  const config = {
    $schema: 'https://barebase.io/schema/config.json',
    port: 3320,
    store: { driver: 'sqlite', filename: './barebase.db' },
    admin: { enabled: true, path: '/admin' },
    mcp: { enabled: true },
    // Mount an existing ClickHouse table as a collection - content on SQLite, analytics on ClickHouse.
    mounts: []
  }
  writeIfAbsent(join(dir, 'barebase.config.json'), JSON.stringify(config, null, 2) + '\n')
  writeIfAbsent(join(dir, '.gitignore'), 'node_modules/\nbarebase.db*\n.env\n')
  writeIfAbsent(join(dir, 'README.md'),
    `# BareBase project\n\nRun the engine:\n\n    barebase dev\n\nDocs: ${SITE}\n`)
  say()
  say('Next:')
  say(`  ${DIM}cd ${args[0] || '.'}${OFF}`)
  say(`  ${DIM}barebase dev${OFF}`)
}

async function runEngine(argv) {
  const bin = await enginePath()
  const r = spawnSync(bin, argv, { stdio: 'inherit' })
  process.exit(r.status ?? 1)
}

const [cmd, ...rest] = process.argv.slice(2)
try {
  switch (cmd) {
    case 'init': init(rest); break
    case 'update': await enginePath({ force: true }); break
    case 'version': case '--version': case '-v': say(VERSION); break
    case undefined: case 'help': case '--help': case '-h': help(); break
    default: await runEngine([cmd, ...rest])
  }
} catch (err) {
  say(`error: ${err.message}`)
  say(`If this persists, download manually from ${DL}/ - checksums in ${DL}/sha256sums.txt`)
  process.exit(1)
}
