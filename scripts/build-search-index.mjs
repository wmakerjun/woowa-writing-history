import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const sitePath = path.join(rootDir, 'out')
const publicIndexPath = path.join(rootDir, 'public', '_pagefind')
const exportIndexPath = path.join(rootDir, 'out', '_pagefind')
const pagefindBin = path.join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'pagefind.cmd' : 'pagefind'
)

if (!fs.existsSync(sitePath)) {
  throw new Error(`Pagefind source directory not found: ${sitePath}`)
}

if (!fs.existsSync(pagefindBin)) {
  throw new Error(`Pagefind binary not found: ${pagefindBin}`)
}

fs.rmSync(publicIndexPath, { recursive: true, force: true })
fs.rmSync(exportIndexPath, { recursive: true, force: true })

execFileSync(pagefindBin, ['--site', sitePath, '--output-path', publicIndexPath], {
  stdio: 'inherit'
})

fs.mkdirSync(path.dirname(exportIndexPath), { recursive: true })
fs.cpSync(publicIndexPath, exportIndexPath, { recursive: true })

console.log(`Pagefind index generated in ${publicIndexPath} and ${exportIndexPath}`)
