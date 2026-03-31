import fs from 'node:fs'
import path from 'node:path'

const generations = [1, 2, 3, 4, 5, 6, 7]
const years = {
  1: 2019,
  2: 2020,
  3: 2021,
  4: 2022,
  5: 2023,
  6: 2024,
  7: 2025
}

const validationStats = {
  1: {
    attendanceCount: 45,
    prSubmitters: 46,
    prSubmissionPairs: 181,
    verificationBasis: 'GitHub merged PR 기준',
    prLevelCounts: { level1: 46, level2: 45, level3: 45, level4: 45 },
    missingPairs: 0,
    extraPairs: 0
  },
  2: {
    attendanceCount: 51,
    prSubmitters: 50,
    prSubmissionPairs: 195,
    verificationBasis: 'GitHub merged PR 기준',
    prLevelCounts: { level1: 50, level2: 49, level3: 48, level4: 48 },
    missingPairs: 57,
    extraPairs: 39
  },
  3: {
    attendanceCount: 78,
    prSubmitters: 77,
    prSubmissionPairs: 257,
    verificationBasis: 'GitHub merged PR 기준',
    prLevelCounts: { level1: 75, level2: 76, level3: 75, level4: 31 },
    missingPairs: 55,
    extraPairs: 22
  },
  4: {
    attendanceCount: 116,
    prSubmitters: 116,
    prSubmissionPairs: 354,
    verificationBasis: 'GitHub merged PR 기준',
    prLevelCounts: { level1: 116, level2: 115, level3: 115, level4: 8 },
    missingPairs: 26,
    extraPairs: 20
  },
  5: {
    attendanceCount: 170,
    prSubmitters: 170,
    prSubmissionPairs: 524,
    verificationBasis: 'GitHub merged PR 기준',
    prLevelCounts: { level1: 169, level2: 167, level3: 25, level4: 163 },
    missingPairs: 65,
    extraPairs: 51
  },
  6: {
    attendanceCount: 140,
    prSubmitters: 140,
    prSubmissionPairs: 552,
    verificationBasis: 'GitHub merged PR 기준 (공유 저장소 연도 분리)',
    prLevelCounts: { level1: 139, level2: 139, level3: 137, 'technical-writing': 137 },
    missingPairs: 25,
    extraPairs: 18
  },
  7: {
    prSubmitters: 144,
    prSubmissionPairs: 285,
    verificationBasis: 'GitHub merged PR 기준 (공유 저장소 연도 분리)',
    prLevelCounts: { level1: 143, level2: 142 },
    missingPairs: 8,
    extraPairs: 9
  }
}

const levelOrder = ['level1', 'level2', 'level3', 'level4', 'technical-writing', 'level5', 'unclassified']
const levelLabels = {
  level1: '레벨 1',
  level2: '레벨 2',
  level3: '레벨 3',
  level4: '레벨 4',
  'technical-writing': '테크니컬 라이팅',
  level5: '레벨 5',
  unclassified: '기타 분류'
}

// Curated overview pages are maintained manually.
// This script only regenerates shared summary data and per-generation navigation pages.

function walk(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(dirPath, entry.name)
    return entry.isDirectory() ? walk(nextPath) : nextPath
  })
}

function collectGenerationSummary(generation) {
  const writingsDir = path.join('content', 'tech-blog-book', `generation-${generation}`, 'writings')
  const files = walk(writingsDir).filter((file) => file.endsWith('.md'))
  const archiveLevelCounts = {}
  const archivePairs = new Set()
  const archiveSubmitters = new Set()

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, 'utf8')
    const level = (text.match(/^level:\s*"([^"]+)"/m) || [])[1]
    const author = (text.match(/^author:\s*"([^"]+)"/m) || [])[1]
    if (level) {
      archiveLevelCounts[level] = (archiveLevelCounts[level] ?? 0) + 1
    }
    if (level && author) {
      archivePairs.add(`${author.toLowerCase()}::${level}`)
      archiveSubmitters.add(author.toLowerCase())
    }
  }

  const stats = validationStats[generation]
  const collectedFiles = files.length

  return {
    generation,
    year: years[generation],
    attendanceCount: stats.attendanceCount ?? null,
    prSubmitters: stats.prSubmitters,
    prSubmissionPairs: stats.prSubmissionPairs,
    archiveSubmitters: archiveSubmitters.size,
    archivePairs: archivePairs.size,
    collectedFiles,
    supplementalFiles: collectedFiles - archivePairs.size,
    verificationBasis: stats.verificationBasis,
    prLevelCounts: stats.prLevelCounts,
    archiveLevelCounts,
    missingPairs: stats.missingPairs,
    extraPairs: stats.extraPairs
  }
}

function getLevelLabel(generation, level) {
  return levelLabels[level]
}

function formatMetaKey(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`
}

function formatOverviewLine(summary) {
  return `PR 기준 제출자 ${summary.prSubmitters}명 · PR 제출 ${summary.prSubmissionPairs}건 · 현재 아카이브 ${summary.collectedFiles}편`
}

function buildNote(summary) {
  const attendanceText = summary.attendanceCount
    ? `출석부 ${summary.attendanceCount}명 대비 PR 제출자는 ${summary.prSubmitters}명입니다.`
    : `현재 기수는 PR 제출자 ${summary.prSubmitters}명으로 확인됩니다.`

  const archiveText =
    summary.missingPairs > 0 || summary.extraPairs > 0
      ? `현재 아카이브는 PR 기준 author-level 쌍보다 ${summary.missingPairs}건 부족하고, ${summary.extraPairs}건은 다른 계정명 또는 분류로 저장돼 있습니다.`
      : '현재 아카이브는 PR 기준과 일치합니다.'

  return `${summary.verificationBasis}으로 검토했습니다. ${attendanceText} ${archiveText}`
}

function writeGeneratedArchiveSummaries(summaries) {
  const filePath = path.join('data', 'archive-summaries.generated.ts')
  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  const payload = Object.fromEntries(summaries.map((summary) => [summary.generation, summary]))
  const lines = [
    'export type ArchiveSummary = {',
    '  generation: number',
    '  year: number',
    '  attendanceCount: number | null',
    '  prSubmitters: number',
    '  prSubmissionPairs: number',
    '  archiveSubmitters: number',
    '  archivePairs: number',
    '  collectedFiles: number',
    '  supplementalFiles: number',
    '  verificationBasis: string',
    '  prLevelCounts: Record<string, number>',
    '  archiveLevelCounts: Record<string, number>',
    '  missingPairs: number',
    '  extraPairs: number',
    '}',
    '',
    `export const archiveSummaries: Record<number, ArchiveSummary> = ${JSON.stringify(payload, null, 2)}`
  ]

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

function writeGenerationMeta(summary) {
  const filePath = path.join('content', 'tech-blog-book', `generation-${summary.generation}`, '_meta.ts')
  const lines = ["export default {"]
  lines.push("  index: '개요',")
  if (summary.generation === 1) {
    lines.push("  'analysis-retrospective': '분석 전략 회고',")
  }
  lines.push(`  writings: '글 모음 (${summary.collectedFiles}편)'`)
  lines.push('}')
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

function writeWritingsMeta(summary) {
  const filePath = path.join('content', 'tech-blog-book', `generation-${summary.generation}`, 'writings', '_meta.ts')
  const lines = ['export default {']
  for (const level of levelOrder) {
    const count = summary.archiveLevelCounts[level] ?? 0
    if (count === 0) continue
    lines.push(`  ${formatMetaKey(level)}: '${getLevelLabel(summary.generation, level)} (${count}편)',`)
  }
  lines.push('}')
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

function writeWritingsIndex(summary) {
  const filePath = path.join('content', 'tech-blog-book', `generation-${summary.generation}`, 'writings', 'index.mdx')
  const levelEntries = levelOrder
    .map((level) => [level, summary.archiveLevelCounts[level] ?? 0])
    .filter(([, count]) => count > 0)
  const leadingLevels = levelEntries
    .filter(([level]) => level !== 'unclassified')
    .slice(0, 4)
    .map(([level, count]) => `${getLevelLabel(summary.generation, level)} ${count}편`)
    .join(', ')
  const noteLines = [
    `- 확인된 작성자 규모: ${summary.prSubmitters}명`,
    `- 현재 열람 가능한 글: ${summary.collectedFiles}편`
  ]

  if (summary.archiveLevelCounts['technical-writing']) {
    noteLines.push(`- 특징: \`테크니컬 라이팅\` ${summary.archiveLevelCounts['technical-writing']}편이 별도 축으로 분리되어 있습니다.`)
  } else if (summary.archiveLevelCounts.unclassified) {
    noteLines.push(`- 특징: 파일명 규칙으로 바로 분류되지 않은 글이 ${summary.archiveLevelCounts.unclassified}편 있습니다.`)
  } else {
    noteLines.push('- 특징: 현재 분류된 레벨 기준으로 바로 탐색할 수 있습니다.')
  }

  if (summary.missingPairs > 0 || summary.extraPairs > 0) {
    noteLines.push(`- 참고: 현재 아카이브와 PR 기준 사이에는 아직 차이가 있습니다. 자세한 맥락은 개요 페이지에서 확인할 수 있습니다.`)
  }

  const lines = [
    `# ${summary.generation}기 글 모음`,
    '',
    '<Callout type="info">',
    `이 페이지는 원문 탐색용 모음입니다. 기수의 분위기와 역사적 맥락은 [${summary.generation}기 개요](/tech-blog-book/generation-${summary.generation})를 먼저 읽는 편이 좋습니다.`,
    '</Callout>',
    '',
    `현재 아카이브는 **${summary.collectedFiles}편**이며, 주된 축은 ${leadingLevels || '분류 대기 문서'}입니다.`,
    '',
    '## 레벨별 입구',
    '',
    `<GenerationArchiveCards generation={${summary.generation}} />`,
    '',
    '## 짧은 메모',
    '',
    ...noteLines,
    ''
  ]
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

const summaries = generations.map(collectGenerationSummary)

writeGeneratedArchiveSummaries(summaries)

for (const summary of summaries) {
  writeGenerationMeta(summary)
  writeWritingsMeta(summary)
  writeWritingsIndex(summary)
}

console.log(JSON.stringify(summaries, null, 2))
