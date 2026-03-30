import fs from 'node:fs'
import path from 'node:path'

const repoName = 'woowa-writing-1'
const generation = 1
const outputRoot = path.join('content', 'tech-blog-book', 'generation-1', 'writings')

const missingPullRequests = [
  { level: 'level1', author: 'Conatuseus', number: 34 },
  { level: 'level1', author: 'Deocksoo', number: 33 },
  { level: 'level1', author: 'JunHoPark93', number: 31 },
  { level: 'level1', author: 'SEOKHYOENCHOI', number: 45 },
  { level: 'level1', author: 'dpudpu', number: 14 },
  { level: 'level1', author: 'ep1stas1s', number: 11 },
  { level: 'level1', author: 'hyperpace', number: 28 },
  { level: 'level1', author: 'hyunssooo', number: 32 },
  { level: 'level1', author: 'ike5923', number: 38 },
  { level: 'level1', author: 'kangmin46', number: 3 },
  { level: 'level1', author: 'starkim06', number: 29 },
  { level: 'level1', author: 'stopsilver13', number: 37 },
  { level: 'level1', author: 'yjll1019', number: 19 },
  { level: 'level1', author: 'yuyu154', number: 20 },
  { level: 'level2', author: 'Laterality', number: 64 },
  { level: 'level2', author: 'yjll1019', number: 87 },
  {
    level: 'level2',
    author: 'yuyu154',
    number: 59,
    files: [
      {
        filename: 'ch2-성장.md',
        additions: 28,
        deletions: 0,
        blob_url: 'https://github.com/woowacourse/woowa-writing-1/blob/5c751580371e71baa6d533abd64ff1d49a924a97/ch2-%EC%84%B1%EC%9E%A5.md',
        raw_url: 'https://raw.githubusercontent.com/woowacourse/woowa-writing-1/5c751580371e71baa6d533abd64ff1d49a924a97/ch2-%EC%84%B1%EC%9E%A5.md'
      }
    ]
  },
  { level: 'level3', author: 'soojinroh', number: 104 },
  {
    level: 'level3',
    author: 'yjll1019',
    number: 111,
    files: [
      {
        filename: '내가_꿈꾸는_프로그래머로서의_삶.md',
        additions: 23,
        deletions: 0,
        blob_url: 'https://github.com/woowacourse/woowa-writing-1/blob/ba31e877ba3d7b519363c634f38bb87be9b8d10e/%EB%82%B4%EA%B0%80_%EA%BF%88%EA%BE%B8%EB%8A%94_%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8%EB%A1%9C%EC%84%9C%EC%9D%98_%EC%82%B6.md',
        raw_url: 'https://raw.githubusercontent.com/woowacourse/woowa-writing-1/ba31e877ba3d7b519363c634f38bb87be9b8d10e/%EB%82%B4%EA%B0%80_%EA%BF%88%EA%BE%B8%EB%8A%94_%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8%EB%A1%9C%EC%84%9C%EC%9D%98_%EC%82%B6.md'
      }
    ]
  },
  {
    level: 'level3',
    author: 'yuyu154',
    number: 136,
    files: [
      {
        filename: 'ch3-성숙.md',
        additions: 43,
        deletions: 0,
        blob_url: 'https://github.com/woowacourse/woowa-writing-1/blob/c3f59cbe419639cb263015253b74c151b3a6adbc/ch3-%EC%84%B1%EC%88%99.md',
        raw_url: 'https://raw.githubusercontent.com/woowacourse/woowa-writing-1/c3f59cbe419639cb263015253b74c151b3a6adbc/ch3-%EC%84%B1%EC%88%99.md'
      }
    ]
  },
  { level: 'level4', author: 'choihz', number: 160 },
  {
    level: 'level4',
    author: 'codeanddonuts',
    number: 192,
    files: [
      {
        filename: 'README.md',
        additions: 3,
        deletions: 19,
        blob_url: 'https://github.com/woowacourse/woowa-writing-1/blob/2d89d9a1e779790e2abd9632945d697207c910ca/README.md',
        raw_url: 'https://raw.githubusercontent.com/woowacourse/woowa-writing-1/2d89d9a1e779790e2abd9632945d697207c910ca/README.md'
      }
    ]
  }
]

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

function detectLevel(filePath) {
  const lower = filePath.toLowerCase()
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

function stripBom(value) {
  if (value.charCodeAt(0) === 0xfeff) {
    return value.slice(1)
  }
  return value
}

function encodeRepoPath(filePath) {
  return filePath.split('/').map((segment) => encodeURIComponent(segment)).join('/')
}

function buildBlobUrl(ref, filePath) {
  return `https://github.com/woowacourse/${repoName}/blob/${encodeURIComponent(ref)}/${encodeRepoPath(filePath)}`
}

function buildRawUrl(ref, filePath) {
  return `https://raw.githubusercontent.com/woowacourse/${repoName}/${encodeURIComponent(ref)}/${encodeRepoPath(filePath)}`
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

function buildFrontmatter({ author, level, originalFilename, source, sourcePath }) {
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

function buildTargetName({ level, author, sourcePath, entryCount }) {
  const base = path.basename(sourcePath)
  if (entryCount === 1 && level !== 'unclassified') {
    return `${level}-${author}.md`
  }
  return `${level}-${author}-${safeSlug(base)}.md`
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'woowa-writing-history-sync'
    }
  })

  if (!response.ok) {
    throw new Error(`failed to fetch json ${url}: ${response.status}`)
  }

  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'woowa-writing-history-sync'
    }
  })

  if (!response.ok) {
    throw new Error(`failed to fetch text ${url}: ${response.status}`)
  }

  return response.text()
}

async function restoreMissingPullRequest(record) {
  const defaultTargetPath = path.join(outputRoot, record.level, `${record.level}-${record.author}.md`)
  if (fs.existsSync(defaultTargetPath)) {
    return
  }

  const files = record.files ?? await fetchJson(
    `https://api.github.com/repos/woowacourse/${repoName}/pulls/${record.number}/files?per_page=100`
  )
  const markdownFiles = files
    .filter((file) => /\.(md|mdx)$/i.test(file.filename))
    .map((file) => ({
      ...file,
      detectedLevel: detectLevel(file.filename)
    }))

  if (markdownFiles.length === 0) {
    throw new Error(`PR #${record.number} does not contain a markdown file`)
  }

  let selectedFiles = markdownFiles.filter((file) => file.detectedLevel === record.level)
  if (selectedFiles.length === 0) {
    selectedFiles = markdownFiles.filter((file) => file.detectedLevel === 'unclassified')
  }
  if (selectedFiles.length === 0) {
    selectedFiles = markdownFiles
  }

  const addedFiles = selectedFiles.filter((file) => file.additions > 0)
  if (addedFiles.length > 0) {
    selectedFiles = addedFiles
  }

  if (selectedFiles.length > 1) {
    selectedFiles = [...selectedFiles]
      .sort((left, right) => {
        if (right.additions !== left.additions) return right.additions - left.additions
        if (left.deletions !== right.deletions) return left.deletions - right.deletions
        return left.filename.localeCompare(right.filename, 'en')
      })
      .slice(0, 1)
  }

  const targetDir = path.join(outputRoot, record.level)
  ensureDir(targetDir)

  for (const file of selectedFiles) {
    const ref = file.blob_url.split('/blob/')[1].split('/')[0]
    const targetName = buildTargetName({
      level: record.level,
      author: record.author,
      sourcePath: file.filename,
      entryCount: selectedFiles.length
    })
    const targetPath = path.join(targetDir, targetName)

    if (fs.existsSync(targetPath)) {
      continue
    }

    const rawBody = await fetchText(file.raw_url)
    const normalizedBody = stripBom(rawBody).replace(/\r\n/g, '\n').trimEnd() + '\n'
    const body = rewriteRelativeReferences(normalizedBody, {
      ref,
      sourcePath: file.filename
    })
    const frontmatter = buildFrontmatter({
      author: record.author,
      level: record.level,
      originalFilename: path.basename(file.filename),
      source: file.blob_url,
      sourcePath: file.filename
    })

    fs.writeFileSync(targetPath, `${frontmatter}\n${body}`, 'utf8')
    console.log(`created ${targetPath}`)
  }
}

for (const record of missingPullRequests) {
  await restoreMissingPullRequest(record)
}
