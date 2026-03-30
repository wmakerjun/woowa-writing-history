import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const generationConfigs = [
  { generation: 2, repoName: 'woowa-writing-2', gitDir: '/tmp/woowa-writing-2.git' },
  { generation: 3, repoName: 'woowa-writing-3', gitDir: '/tmp/woowa-writing-3.git' },
  { generation: 4, repoName: 'woowa-writing-4', gitDir: '/tmp/woowa-writing-4.git' },
  { generation: 5, repoName: 'woowa-writing-5', gitDir: '/tmp/woowa-writing-5.git' }
]

const excludedAuthorNames = new Set([
  'main',
  'master',
  'develop',
  'gh-pages',
  'record'
])

const excludedAuthorPatterns = [
  /^level[-_ ]*\d+$/i,
  /^level[-_ ]*\d+writing$/i,
  /^lv[-_ ]*\d+$/i,
  /^step[-_ ]*\d+$/i,
  /^writing\d*$/i,
  /^readme\d*$/i,
  /^mission[-_ ]*\d+$/i,
  /^week[-_ ]*\d+$/i
]

function run(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  })
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
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

  const levelRegexes = [
    /(?:^|[^a-z0-9])level\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])lv\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])step\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])ch\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i,
    /(?:^|[^a-z0-9])레벨\s*[-_ ]*([1-9])(?:[^a-z0-9]|$)/i
  ]

  for (const regex of levelRegexes) {
    const segmentHit = segments.find((segment) => regex.test(segment))
    if (segmentHit) {
      const match = segmentHit.match(regex)
      if (match) {
        return `level${Number(match[1])}`
      }
    }

    const baseMatch = base.match(regex)
    if (baseMatch) {
      return `level${Number(baseMatch[1])}`
    }
  }

  const leadingDigit = base.match(/^\s*([1-9])(?:[^0-9]|$)/)
  if (leadingDigit) {
    return `level${Number(leadingDigit[1])}`
  }

  return 'unclassified'
}

function encodeRepoPath(filePath) {
  return filePath.split('/').map((segment) => encodeURIComponent(segment)).join('/')
}

function buildBlobUrl(repoName, ref, filePath) {
  return `https://github.com/woowacourse/${repoName}/blob/${encodeURIComponent(ref)}/${encodeRepoPath(filePath)}`
}

function buildRawUrl(repoName, ref, filePath) {
  return `https://raw.githubusercontent.com/woowacourse/${repoName}/${encodeURIComponent(ref)}/${encodeRepoPath(filePath)}`
}

function isExternalTarget(target) {
  return /^(?:[a-z]+:|\/\/|#)/i.test(target)
}

function isImageTargetPath(targetPath) {
  return /\.(png|jpe?g|gif|svg|webp|bmp|ico|avif)$/i.test(targetPath)
}

function rewriteTarget(target, { repoName, ref, sourcePath, treatAsImage = false }) {
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
    ? buildRawUrl(repoName, ref, resolvedPath)
    : buildBlobUrl(repoName, ref, resolvedPath)

  const rewritten = `${absoluteUrl}${suffix}`
  return wrappedInAngle ? `<${rewritten}>` : rewritten
}

function rewriteRelativeReferences(body, { repoName, ref, sourcePath }) {
  let rewritten = body

  rewritten = rewritten.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)([^)]*)\)/g, (match, bang, label, target, suffix) => {
    const nextTarget = rewriteTarget(target, {
      repoName,
      ref,
      sourcePath,
      treatAsImage: bang === '!'
    })
    if (nextTarget === target) return match
    return `${bang}[${label}](${nextTarget}${suffix})`
  })

  rewritten = rewritten.replace(/^(\s*\[[^\]]+\]:\s*)(\S+)(.*)$/gm, (match, prefix, target, suffix) => {
    const nextTarget = rewriteTarget(target, {
      repoName,
      ref,
      sourcePath,
      treatAsImage: isImageTargetPath(target)
    })
    if (nextTarget === target) return match
    return `${prefix}${nextTarget}${suffix}`
  })

  rewritten = rewritten.replace(/<img\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi, (match, before, quote, target, after) => {
    const nextTarget = rewriteTarget(target, {
      repoName,
      ref,
      sourcePath,
      treatAsImage: true
    })
    if (nextTarget === target) return match
    return `<img${before}src=${quote}${nextTarget}${quote}${after}>`
  })

  rewritten = rewritten.replace(/<a\b([^>]*?)\bhref=(["'])([^"']+)\2([^>]*)>/gi, (match, before, quote, target, after) => {
    const nextTarget = rewriteTarget(target, {
      repoName,
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

function walk(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(dirPath, entry.name)
    return entry.isDirectory() ? walk(nextPath) : nextPath
  })
}

function listArchiveIndex(generation) {
  const root = path.join('content', 'tech-blog-book', `generation-${generation}`, 'writings')
  const files = walk(root).filter((value) => value.endsWith('.md'))

  const authors = new Set()
  const authorPairs = new Set()
  const sourceRecords = new Set()

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, 'utf8')
    const author = (text.match(/^author:\s*"([^"]+)"/m) || [])[1]
    const level = (text.match(/^level:\s*"([^"]+)"/m) || [])[1]
    const sourcePath = (text.match(/^source_path:\s*"([^"]+)"/m) || [])[1]

    if (author) authors.add(author)
    if (author && level) authorPairs.add(`${author}::${level}`)
    if (author && level && sourcePath) sourceRecords.add(`${author}::${level}::${sourcePath}`)
  }

  return {
    authors,
    authorPairs,
    sourceRecords
  }
}

function listCurrentBranches(gitDir) {
  return run(`git --git-dir=${gitDir} for-each-ref --format='%(refname:short)' refs/heads`)
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
}

function isGenericAuthorCandidate(value) {
  if (!value) return true

  const normalized = value.trim()
  if (!normalized) return true

  if (excludedAuthorNames.has(normalized.toLowerCase())) {
    return true
  }

  return excludedAuthorPatterns.some((pattern) => pattern.test(normalized))
}

function addCanonicalAuthorEntry(map, value, priority) {
  if (!value || isGenericAuthorCandidate(value)) return

  const normalized = value.trim()
  const key = normalized.toLowerCase()
  const existing = map.get(key)

  if (!existing || priority < existing.priority) {
    map.set(key, { value: normalized, priority })
  }
}

function canonicalizeAuthor(value, canonicalAuthors) {
  if (!value) return null

  const normalized = value.trim()
  if (!normalized) return null

  const hit = canonicalAuthors.get(normalized.toLowerCase())
  return hit?.value ?? normalized
}

function authorFromFileEntries(fileEntries, canonicalAuthors) {
  const weightedCandidates = new Map()

  for (const entry of fileEntries) {
    const dirnameSegments = path.posix.dirname(entry.filename)
      .split('/')
      .filter(Boolean)
    const basename = path.posix.basename(entry.filename, path.posix.extname(entry.filename))
    const basenameParts = basename.split(/[-_]/).filter(Boolean)
    const candidates = [...dirnameSegments, basename, ...basenameParts]

    for (const candidate of candidates) {
      if (isGenericAuthorCandidate(candidate)) continue

      const canonical = canonicalizeAuthor(candidate, canonicalAuthors)
      const key = canonical.toLowerCase()
      const weight = entry.isReadme ? 1 : 3
      weightedCandidates.set(key, {
        value: canonical,
        score: (weightedCandidates.get(key)?.score ?? 0) + weight
      })
    }
  }

  return [...weightedCandidates.values()]
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      if (right.value.length !== left.value.length) return right.value.length - left.value.length
      return left.value.localeCompare(right.value, 'en')
    })[0]?.value ?? null
}

function inferAuthor(pr, fileEntries, canonicalAuthors) {
  const candidates = [
    pr.base?.ref,
    pr.user?.login,
    pr.head?.ref,
    authorFromFileEntries(fileEntries, canonicalAuthors)
  ]

  for (const candidate of candidates) {
    if (!candidate || isGenericAuthorCandidate(candidate)) continue
    return canonicalizeAuthor(candidate, canonicalAuthors)
  }

  const fallback = candidates.find(Boolean)
  if (!fallback || isGenericAuthorCandidate(fallback)) return null
  return canonicalizeAuthor(fallback, canonicalAuthors)
}

function listChangedMarkdownFileEntries(gitDir, mergeSha) {
  const files = run(`git --git-dir=${gitDir} diff --name-only ${mergeSha}^1 ${mergeSha}`)
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => /\.(md|mdx)$/i.test(value))

  return files.flatMap((filePath) => {
    try {
      run(`git --git-dir=${gitDir} cat-file -e ${mergeSha}:${JSON.stringify(filePath)}`)
    } catch {
      return []
    }

    let additions = 0
    let deletions = 0
    const numstat = run(`git --git-dir=${gitDir} diff --numstat ${mergeSha}^1 ${mergeSha} -- ${JSON.stringify(filePath)}`)
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean)[0]

    if (numstat) {
      const [add, del] = numstat.split('\t')
      additions = add === '-' ? 0 : Number(add)
      deletions = del === '-' ? 0 : Number(del)
    }

    const blobSha = run(`git --git-dir=${gitDir} rev-parse ${mergeSha}:${JSON.stringify(filePath)}`).trim()

    return [{
      filename: filePath,
      blobSha,
      additions,
      deletions,
      detectedLevel: detectLevel(filePath),
      isReadme: /^readme(?:[-_.0-9].*)?$/i.test(path.posix.basename(filePath, path.posix.extname(filePath)))
    }]
  })
}

function inferEffectiveLevel(pr, fileEntries) {
  const titleLevel = detectLevel(pr.title ?? '')
  if (titleLevel !== 'unclassified') {
    return titleLevel
  }

  const distinctFileLevels = [...new Set(
    fileEntries
      .map((entry) => entry.detectedLevel)
      .filter((level) => level !== 'unclassified')
  )]

  if (distinctFileLevels.length === 1) {
    return distinctFileLevels[0]
  }

  const distinctNonReadmeLevels = [...new Set(
    fileEntries
      .filter((entry) => !entry.isReadme)
      .map((entry) => entry.detectedLevel)
      .filter((level) => level !== 'unclassified')
  )]

  if (distinctNonReadmeLevels.length === 1) {
    return distinctNonReadmeLevels[0]
  }

  return 'unclassified'
}

function selectBestFile(level, fileEntries) {
  let candidates = fileEntries

  if (level !== 'unclassified') {
    const exactLevelMatches = candidates.filter((entry) => entry.detectedLevel === level)
    if (exactLevelMatches.length > 0) {
      candidates = exactLevelMatches
    } else {
      const unclassifiedMatches = candidates.filter((entry) => entry.detectedLevel === 'unclassified')
      if (unclassifiedMatches.length > 0) {
        candidates = unclassifiedMatches
      }
    }
  } else {
    const nonReadmeFiles = candidates.filter((entry) => !entry.isReadme)
    if (nonReadmeFiles.length > 0) {
      candidates = nonReadmeFiles
    }
  }

  const withAdditions = candidates.filter((entry) => entry.additions > 0)
  if (withAdditions.length > 0) {
    candidates = withAdditions
  }

  return [...candidates]
    .sort((left, right) => {
      if (left.isReadme !== right.isReadme) return left.isReadme ? 1 : -1
      if (right.additions !== left.additions) return right.additions - left.additions
      if (left.deletions !== right.deletions) return left.deletions - right.deletions
      return left.filename.localeCompare(right.filename, 'en')
    })[0] ?? null
}

function buildTargetPath({ generation, level, author, sourcePath }) {
  const baseDir = path.join('content', 'tech-blog-book', `generation-${generation}`, 'writings', level)
  const baseFilename = level === 'unclassified'
    ? `${level}-${author}-${safeSlug(path.basename(sourcePath))}`
    : `${level}-${author}`
  const defaultPath = path.join(baseDir, `${baseFilename}.md`)

  if (!fs.existsSync(defaultPath)) {
    return defaultPath
  }

  const fallbackPath = path.join(baseDir, `${level}-${author}-${safeSlug(path.basename(sourcePath))}.md`)
  if (!fs.existsSync(fallbackPath)) {
    return fallbackPath
  }

  let suffix = 2
  while (true) {
    const candidatePath = path.join(baseDir, `${level}-${author}-${safeSlug(path.basename(sourcePath))}-${suffix}.md`)
    if (!fs.existsSync(candidatePath)) {
      return candidatePath
    }
    suffix += 1
  }
}

function restoreFile({ repoName, gitDir, generation, author, level, mergeSha, sourcePath }) {
  const targetPath = buildTargetPath({ generation, level, author, sourcePath })
  const rawBody = run(`git --git-dir=${gitDir} show ${mergeSha}:${JSON.stringify(sourcePath)}`)
  const normalizedBody = stripBom(rawBody).replace(/\r\n/g, '\n').trimEnd() + '\n'
  const body = rewriteRelativeReferences(normalizedBody, {
    repoName,
    ref: mergeSha,
    sourcePath
  })

  const frontmatter = buildFrontmatter({
    author,
    generation,
    level,
    originalFilename: path.basename(sourcePath),
    source: buildBlobUrl(repoName, mergeSha, sourcePath),
    sourcePath
  })

  ensureDir(path.dirname(targetPath))
  fs.writeFileSync(targetPath, `${frontmatter}\n${body}`, 'utf8')
  return targetPath
}

function listBranchPullCommits(gitDir, branchNames) {
  const records = []

  for (const branchName of branchNames) {
    if (isGenericAuthorCandidate(branchName)) continue

    const lines = run(`git --git-dir=${gitDir} log ${JSON.stringify(branchName)} --format='%H%x09%s'`)
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean)

    for (const line of lines) {
      const [sha, ...subjectParts] = line.split('\t')
      const subject = subjectParts.join('\t').trim()
      const match = subject.match(/^(.*)\s+\(#(\d+)\)$/)
      if (!match) continue

      records.push({
        author: branchName,
        mergeSha: sha,
        number: Number(match[2]),
        title: match[1].trim()
      })
    }
  }

  return records
}

const results = []

for (const config of generationConfigs) {
  const archiveIndex = listArchiveIndex(config.generation)
  const currentBranches = listCurrentBranches(config.gitDir)
  const branchPullCommits = listBranchPullCommits(config.gitDir, currentBranches)

  const canonicalAuthors = new Map()
  for (const author of archiveIndex.authors) {
    addCanonicalAuthorEntry(canonicalAuthors, author, 0)
  }
  for (const branchName of currentBranches) {
    addCanonicalAuthorEntry(canonicalAuthors, branchName, 1)
  }

  const expectedPairs = new Map()
  const unresolvedPulls = []

  for (const pull of branchPullCommits) {
    const fileEntries = listChangedMarkdownFileEntries(config.gitDir, pull.mergeSha)
    if (fileEntries.length === 0) continue

    const author = canonicalizeAuthor(pull.author, canonicalAuthors)
    if (!author) {
      unresolvedPulls.push({
        number: pull.number,
        title: pull.title,
        user: null,
        files: fileEntries.map((entry) => entry.filename)
      })
      continue
    }

    const selectedLevel = inferEffectiveLevel({ title: pull.title }, fileEntries)
    const selectedFile = selectBestFile(selectedLevel, fileEntries)
    if (!selectedFile) continue

    const pairKey = `${author}::${selectedLevel}`
    const existing = expectedPairs.get(pairKey)
    if (!existing || pull.number > existing.pull.number) {
      expectedPairs.set(pairKey, {
        author,
        level: selectedLevel,
        pull,
        sourcePath: selectedFile.filename
      })
    }
  }

  const missingPairKeys = [...expectedPairs.keys()]
    .filter((pairKey) => !archiveIndex.authorPairs.has(pairKey))
    .sort()

  const createdPaths = []
  for (const pairKey of missingPairKeys) {
    const record = expectedPairs.get(pairKey)
    const sourceRecordKey = `${record.author}::${record.level}::${record.sourcePath}`
    if (archiveIndex.sourceRecords.has(sourceRecordKey)) {
      archiveIndex.authorPairs.add(pairKey)
      continue
    }

    const targetPath = restoreFile({
      repoName: config.repoName,
      gitDir: config.gitDir,
      generation: config.generation,
      author: record.author,
      level: record.level,
      mergeSha: record.pull.mergeSha,
      sourcePath: record.sourcePath
    })

    createdPaths.push(targetPath)
    archiveIndex.authors.add(record.author)
    archiveIndex.authorPairs.add(pairKey)
    archiveIndex.sourceRecords.add(sourceRecordKey)
  }

  results.push({
    generation: config.generation,
    expectedPairs: expectedPairs.size,
    missingPairsBeforeRestore: missingPairKeys.length,
    restoredFiles: createdPaths.length,
    unresolvedPulls: unresolvedPulls.length,
    restoredSample: createdPaths.slice(0, 20),
    unresolvedSample: unresolvedPulls.slice(0, 10)
  })
}

console.log(JSON.stringify(results, null, 2))
