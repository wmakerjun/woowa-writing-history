import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const gitDir = '/tmp/woowa-writing.git'
const splitCommit = '26d3088bceed6e8a800e13d7048715904b5bb0b1'

const generationConfigs = [
  {
    generation: 6,
    isBranchIncluded(branchName) {
      if (branchName === 'main') return false
      return !branchContainsCommit(branchName, splitCommit)
    },
    listCommitLines(branchName) {
      return run(`git --git-dir=${gitDir} log ${JSON.stringify(branchName)} --format='%H%x09%ct%x09%ad%x09%s' --date=short`)
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((line) => /\(#\d+\)$/.test(line.split('\t').slice(3).join('\t')))
        .filter((line) => line.split('\t')[2].startsWith('2024-'))
    },
    finalizeLevels(records) {
      const next = records.map((record) => ({ ...record }))
      const ordered = [...next].sort((left, right) => left.timestamp - right.timestamp)

      for (const record of ordered) {
        if (record.level === 'level4') {
          record.level = 'technical-writing'
          continue
        }

        if (record.level !== 'unclassified') continue

        const hasTechnicalSignal = hasTechnicalWritingSignal(record.subject) || record.filePaths.some((filePath) => hasTechnicalWritingSignal(filePath))
        if (hasTechnicalSignal) {
          record.level = 'technical-writing'
        }
      }

      const knownLevels = new Set(ordered.map((record) => record.level).filter((value) => value !== 'unclassified'))

      for (const record of ordered) {
        if (record.level !== 'unclassified') continue

        if (!knownLevels.has('level1')) {
          record.level = 'level1'
          knownLevels.add('level1')
          continue
        }

        if (!knownLevels.has('level2')) {
          record.level = 'level2'
          knownLevels.add('level2')
          continue
        }

        if (!knownLevels.has('level3')) {
          record.level = 'level3'
          knownLevels.add('level3')
          continue
        }

        if (!knownLevels.has('technical-writing')) {
          record.level = 'technical-writing'
          knownLevels.add('technical-writing')
        }
      }

      return next
    }
  },
  {
    generation: 7,
    isBranchIncluded(branchName) {
      if (branchName === 'main') return false
      return branchContainsCommit(branchName, splitCommit)
    },
    listCommitLines(branchName) {
      return run(`git --git-dir=${gitDir} log ${JSON.stringify(branchName)} --not ${splitCommit} --format='%H%x09%ct%x09%ad%x09%s' --date=short`)
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean)
        .filter((line) => /\(#\d+\)$/.test(line.split('\t').slice(3).join('\t')))
    },
    finalizeLevels(records) {
      const next = records.map((record) => ({ ...record }))
      const unknown = next.filter((record) => record.level === 'unclassified')
      if (unknown.length === 0) return next

      const knownLevels = new Set(next.map((record) => record.level).filter((value) => value !== 'unclassified'))
      const ordered = [...next].sort((left, right) => left.timestamp - right.timestamp)

      for (const record of ordered) {
        if (record.level !== 'unclassified') continue

        if (!knownLevels.has('level1')) {
          record.level = 'level1'
          knownLevels.add('level1')
          continue
        }

        if (!knownLevels.has('level2')) {
          record.level = 'level2'
          knownLevels.add('level2')
          continue
        }
      }

      return next
    }
  }
]

const imageExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.bmp',
  '.ico',
  '.avif'
])

const ignoredExtensions = new Set([
  '.xml',
  '.yml',
  '.yaml',
  '.json',
  '.iml'
])

const ignoredDirectories = new Set([
  '.idea',
  '.sonarlint',
  '.vscode'
])

const commitTreeCache = new Map()

function run(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  })
}

function branchContainsCommit(branchName, commit) {
  try {
    run(`git --git-dir=${gitDir} merge-base --is-ancestor ${commit} ${JSON.stringify(branchName)}`)
    return true
  } catch {
    return false
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function loadCommitTree(commitSha) {
  if (commitTreeCache.has(commitSha)) {
    return commitTreeCache.get(commitSha)
  }

  const output = execSync(`git --git-dir=${gitDir} -c core.quotePath=false ls-tree -r -z ${commitSha}`, {
    stdio: ['pipe', 'pipe', 'pipe']
  })

  const entries = output
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((entry) => {
      const tabIndex = entry.indexOf('\t')
      if (tabIndex < 0) return null

      const header = entry.slice(0, tabIndex).trim().split(/\s+/)
      const pathValue = entry.slice(tabIndex + 1)
      if (header.length < 3 || !pathValue) return null

      return {
        blobSha: header[2],
        path: pathValue
      }
    })
    .filter(Boolean)

  commitTreeCache.set(commitSha, entries)
  return entries
}

function resolveSourceFile(commitSha, sourcePath) {
  const exactTreeEntry = loadCommitTree(commitSha).find((entry) => entry.path === sourcePath)
  if (exactTreeEntry) return exactTreeEntry

  const normalizedNfc = sourcePath.normalize('NFC')
  const normalizedNfd = sourcePath.normalize('NFD')

  return loadCommitTree(commitSha).find((entry) => {
    const entryNfc = entry.path.normalize('NFC')
    const entryNfd = entry.path.normalize('NFD')
    return entryNfc === normalizedNfc || entryNfd === normalizedNfd
  }) ?? null
}

function safeSlug(value) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/g, '')
    .replace(/[^a-z0-9가-힣._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'writing'
}

function stripBom(value) {
  if (value.charCodeAt(0) === 0xfeff) {
    return value.slice(1)
  }
  return value
}

function detectLevel(value) {
  const lower = value.toLowerCase()
  const segments = lower.split('/')
  const base = segments[segments.length - 1]

  const directPatterns = [
    /(?:^|[^a-z0-9])level\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])lv\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])step\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])ch\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])레벨\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i
  ]

  for (const pattern of directPatterns) {
    const segmentHit = segments.find((segment) => pattern.test(segment))
    if (segmentHit) {
      const match = segmentHit.match(pattern)
      if (match) return `level${Number(match[1])}`
    }

    const baseMatch = base.match(pattern)
    if (baseMatch) {
      return `level${Number(baseMatch[1])}`
    }
  }

  if (/(^|[^a-z])levelone([^a-z]|$)/i.test(lower)) return 'level1'
  if (
    /(?:^|[^a-z])(tecknical|technical|tech)(?:[-_ ]?(writing|write))?(?:[^a-z]|$)/i.test(lower) ||
    /테크니컬|라이팅/.test(value)
  ) {
    return 'unclassified'
  }

  if (/^retrospection(?:\.[^.]+)?$/i.test(base) || /^retrospective(?:\.[^.]+)?$/i.test(base)) {
    return 'level1'
  }

  if (/^writing(?:\.[^.]+)?$/i.test(base)) return 'level1'

  const leadingDigit = base.match(/^\s*([1-9])(?:[^0-9]|$)/)
  if (leadingDigit) return `level${Number(leadingDigit[1])}`

  return 'unclassified'
}

function hasTechnicalWritingSignal(value) {
  return /(?:^|[^a-z])(tecknical|technical|tech)(?:[-_ ]?(writing|write|complete))?(?:[^a-z]|$)/i.test(value)
    || /테크니컬|라이팅/.test(value)
}

function encodeRepoPath(filePath) {
  return filePath.split('/').map((segment) => encodeURIComponent(segment)).join('/')
}

function buildBlobUrl(ref, filePath) {
  return `https://github.com/woowacourse/woowa-writing/blob/${encodeURIComponent(ref)}/${encodeRepoPath(filePath)}`
}

function buildRawUrl(ref, filePath) {
  return `https://raw.githubusercontent.com/woowacourse/woowa-writing/${encodeURIComponent(ref)}/${encodeRepoPath(filePath)}`
}

function isExternalTarget(target) {
  return /^(?:[a-z]+:|\/\/|#)/i.test(target)
}

function isImageTargetPath(targetPath) {
  return /\.(png|jpe?g|gif|svg|webp|bmp|ico|avif)$/i.test(targetPath)
}

function rewriteTarget(target, { ref, sourcePath, treatAsImage = false }) {
  if (!target || target.startsWith('{')) return target

  const wrappedInAngle = target.startsWith('<') && target.endsWith('>')
  const plainTarget = wrappedInAngle ? target.slice(1, -1) : target
  if (isExternalTarget(plainTarget)) return target

  const qIndex = plainTarget.indexOf('?')
  const hIndex = plainTarget.indexOf('#')
  const splitCandidates = [qIndex, hIndex].filter((value) => value >= 0)
  const splitAt = splitCandidates.length === 0 ? -1 : Math.min(...splitCandidates)

  const pathname = splitAt >= 0 ? plainTarget.slice(0, splitAt) : plainTarget
  const suffix = splitAt >= 0 ? plainTarget.slice(splitAt) : ''
  if (!pathname || isExternalTarget(pathname)) return target

  const sourceDir = path.posix.dirname(sourcePath)
  let resolvedPath

  if (pathname.startsWith('/')) {
    const isImageRootPath = pathname.startsWith('/assets/') || pathname.startsWith('/asset/') || pathname.startsWith('/images/')
    const shouldRewriteRootPath = isImageRootPath || treatAsImage || isImageTargetPath(pathname)
    if (!shouldRewriteRootPath) return target
    resolvedPath = pathname.replace(/^\/+/, '')
  } else {
    const joined = path.posix.normalize(path.posix.join(sourceDir, pathname))
    resolvedPath = joined.replace(/^(\.\.\/)+/g, '')
  }

  if (!resolvedPath || resolvedPath.startsWith('.')) return target

  const absoluteUrl = treatAsImage || isImageTargetPath(resolvedPath)
    ? buildRawUrl(ref, resolvedPath)
    : buildBlobUrl(ref, resolvedPath)

  const rewritten = `${absoluteUrl}${suffix}`
  return wrappedInAngle ? `<${rewritten}>` : rewritten
}

function rewriteRelativeReferences(body, { ref, sourcePath }) {
  let rewritten = body

  rewritten = rewritten.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (match, bang, label, target, suffix) => {
    const nextTarget = rewriteTarget(target, {
      ref,
      sourcePath,
      treatAsImage: bang === '!'
    })
    if (nextTarget === target) return match
    return `${bang}[${label}](${nextTarget}${suffix})`
  })

  rewritten = rewritten.replace(/^(\s*\[[^\]]+\]:\s*)(\S+)(.*)$/gm, (match, prefix, target, suffix) => {
    const nextTarget = rewriteTarget(target, {
      ref,
      sourcePath,
      treatAsImage: isImageTargetPath(target)
    })
    if (nextTarget === target) return match
    return `${prefix}${nextTarget}${suffix}`
  })

  rewritten = rewritten.replace(/<img\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi, (match, before, quote, target, after) => {
    const nextTarget = rewriteTarget(target, {
      ref,
      sourcePath,
      treatAsImage: true
    })
    if (nextTarget === target) return match
    return `<img${before}src=${quote}${nextTarget}${quote}${after}>`
  })

  rewritten = rewritten.replace(/<a\b([^>]*?)\bhref=(["'])([^"']+)\2([^>]*)>/gi, (match, before, quote, target, after) => {
    const nextTarget = rewriteTarget(target, {
      ref,
      sourcePath,
      treatAsImage: false
    })
    if (nextTarget === target) return match
    return `<a${before}href=${quote}${nextTarget}${quote}${after}>`
  })

  return rewritten
}

function buildFrontmatter({ author, generation, level, originalFilename, source, sourcePath }) {
  return [
    '---',
    `author: "${author.replace(/"/g, '\\"')}"`,
    `generation: ${generation}`,
    `level: "${level}"`,
    `original_filename: "${originalFilename.replace(/"/g, '\\"')}"`,
    `source: "${source}"`,
    `source_path: "${sourcePath.replace(/"/g, '\\"')}"`,
    '---',
    ''
  ].join('\n')
}

function listCurrentBranches() {
  return run(`git --git-dir=${gitDir} for-each-ref --format='%(refname:short)' refs/heads`)
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
}

function parseChangedFiles(sha) {
  return run(`git --git-dir=${gitDir} -c core.quotePath=false diff --name-status ${sha}^1 ${sha}`)
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const parts = line.split('\t')
      const status = parts[0]
      if (status.startsWith('D')) return []
      const filePath = status.startsWith('R') || status.startsWith('C') ? parts[2] : parts[1]
      if (!filePath) return []
      if (filePath.split('/').some((segment) => ignoredDirectories.has(segment))) {
        return []
      }

      const ext = path.posix.extname(filePath).toLowerCase()
      if (imageExtensions.has(ext) || ignoredExtensions.has(ext)) return []
      if (/\.gitignore$/i.test(filePath)) return []
      if (ext && !/\.mdx?$/i.test(ext)) return []

      return [filePath]
    })
}

function selectBestFile(level, filePaths) {
  if (filePaths.length === 0) return null

  const scored = filePaths.map((filePath) => {
    const basename = path.posix.basename(filePath)
    const detectedLevel = detectLevel(filePath)
    const ext = path.posix.extname(filePath).toLowerCase()

    let score = 0
    if (level !== 'unclassified' && detectedLevel === level) score += 100
    if (level === 'unclassified' && /technical|tecknical|tech/i.test(filePath)) score += 80
    if (/readme/i.test(basename)) score += 50
    if (ext === '.md' || ext === '.mdx') score += 30
    if (ext === '') score += 20
    if (level !== 'unclassified' && detectedLevel === 'unclassified') score -= 10

    return { filePath, score }
  })

  return [...scored]
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      if (left.filePath.length !== right.filePath.length) return left.filePath.length - right.filePath.length
      return left.filePath.localeCompare(right.filePath, 'en')
    })[0]?.filePath ?? null
}

function buildTargetPath({ generation, level, author, sourcePath }) {
  const baseDir = path.join('content', 'tech-blog-book', `generation-${generation}`, 'writings', level)
  const defaultFilename = level === 'unclassified'
    ? `${level}-${author}-${safeSlug(path.basename(sourcePath))}.md`
    : `${level}-${author}.md`

  return path.join(baseDir, defaultFilename)
}

function collectExpectedRecords(config) {
  const latestByPair = new Map()

  for (const branchName of listCurrentBranches().filter(config.isBranchIncluded)) {
    const commits = config.listCommitLines(branchName)
      .map((line) => {
        const [sha, timestamp, date, ...subjectParts] = line.split('\t')
        const subject = subjectParts.join('\t').trim()
        const number = Number((subject.match(/\(#(\d+)\)$/) || [])[1])
        const filePaths = parseChangedFiles(sha)

        let level = detectLevel(subject)
        if (level === 'unclassified') {
          const fileLevels = [...new Set(
            filePaths
              .map((filePath) => detectLevel(filePath))
              .filter((value) => value !== 'unclassified')
          )]
          if (fileLevels.length === 1) {
            level = fileLevels[0]
          }
        }

        return {
          author: branchName,
          sha,
          number,
          timestamp: Number(timestamp),
          date,
          subject,
          filePaths,
          level
        }
      })
      .filter((record) => record.filePaths.length > 0)
      .sort((left, right) => left.timestamp - right.timestamp)

    const finalizedCommits = config.finalizeLevels(commits)

    for (const record of finalizedCommits) {
      const sourcePath = selectBestFile(record.level, record.filePaths)
      if (!sourcePath) continue
      const sourceFile = resolveSourceFile(record.sha, sourcePath)
      if (!sourceFile) continue

      const pairKey = `${record.author}::${record.level}`
      const existing = latestByPair.get(pairKey)

      if (!existing || record.number > existing.number) {
        latestByPair.set(pairKey, {
          ...record,
          sourcePath: sourceFile.path,
          blobSha: sourceFile.blobSha
        })
      }
    }
  }

  return [...latestByPair.values()]
}

function walk(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(dirPath, entry.name)
    return entry.isDirectory() ? walk(nextPath) : nextPath
  })
}

function readArchiveRecords(generation) {
  const root = path.join('content', 'tech-blog-book', `generation-${generation}`, 'writings')
  const files = walk(root).filter((value) => value.endsWith('.md'))

  return files.map((filePath) => {
    const text = fs.readFileSync(filePath, 'utf8')
    const author = (text.match(/^author:\s*"([^"]+)"/m) || [])[1]
    const level = (text.match(/^level:\s*"([^"]+)"/m) || [])[1]
    const sourcePath = (text.match(/^source_path:\s*"([^"]+)"/m) || [])[1]

    return {
      filePath,
      author,
      level,
      sourcePath,
      key: author && level && sourcePath ? `${author}::${level}::${sourcePath}` : null
    }
  })
}

function writeRecord(record) {
  const targetPath = buildTargetPath({
    generation: record.generation,
    level: record.level,
    author: record.author,
    sourcePath: record.sourcePath
  })

  const rawBody = run(`git --git-dir=${gitDir} cat-file -p ${record.blobSha}`)
  const normalizedBody = stripBom(rawBody).replace(/\r\n/g, '\n').trimEnd() + '\n'
  const body = rewriteRelativeReferences(normalizedBody, {
    ref: record.sha,
    sourcePath: record.sourcePath
  })

  const frontmatter = buildFrontmatter({
    author: record.author,
    generation: record.generation,
    level: record.level,
    originalFilename: path.basename(record.sourcePath),
    source: buildBlobUrl(record.sha, record.sourcePath),
    sourcePath: record.sourcePath
  })

  ensureDir(path.dirname(targetPath))
  fs.writeFileSync(targetPath, `${frontmatter}\n${body}`, 'utf8')

  return targetPath
}

const results = []

for (const config of generationConfigs) {
  const expectedRecords = collectExpectedRecords(config).map((record) => ({
    ...record,
    generation: config.generation,
    key: `${record.author}::${record.level}::${record.sourcePath}`
  }))

  const expectedKeySet = new Set(expectedRecords.map((record) => record.key))
  const archiveRecords = readArchiveRecords(config.generation)

  const deletedPaths = []
  for (const archiveRecord of archiveRecords) {
    if (!archiveRecord.key || expectedKeySet.has(archiveRecord.key)) continue
    fs.unlinkSync(archiveRecord.filePath)
    deletedPaths.push(archiveRecord.filePath)
  }

  const existingKeys = new Set(
    readArchiveRecords(config.generation)
      .map((record) => record.key)
      .filter(Boolean)
  )

  const createdPaths = []
  for (const record of expectedRecords) {
    if (existingKeys.has(record.key)) continue
    createdPaths.push(writeRecord(record))
  }

  results.push({
    generation: config.generation,
    expectedRecords: expectedRecords.length,
    deletedFiles: deletedPaths.length,
    createdFiles: createdPaths.length,
    deletedSample: deletedPaths.slice(0, 20),
    createdSample: createdPaths.slice(0, 20)
  })
}

console.log(JSON.stringify(results, null, 2))
