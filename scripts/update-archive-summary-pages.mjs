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
  1: { submitters: 46, representativeSubmissions: 181, verificationBasis: 'GitHub PR 기준' },
  2: { submitters: 47, representativeSubmissions: 167, verificationBasis: '브랜치 PR 커밋 로그 기준' },
  3: { submitters: 67, representativeSubmissions: 200, verificationBasis: '브랜치 PR 커밋 로그 기준' },
  4: { submitters: 114, representativeSubmissions: 322, verificationBasis: '브랜치 PR 커밋 로그 기준' },
  5: { submitters: 163, representativeSubmissions: 474, verificationBasis: '브랜치 PR 커밋 로그 기준' },
  6: { submitters: 140, representativeSubmissions: 545, verificationBasis: '공유 저장소 브랜치 PR 커밋 로그 기준' },
  7: { submitters: 144, representativeSubmissions: 286, verificationBasis: '공유 저장소 브랜치 PR 커밋 로그 기준' }
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

// Curated generation overview pages are maintained manually.
// This script only regenerates shared summary data and navigation pages.

function walk(dirPath) {
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const nextPath = path.join(dirPath, entry.name)
    return entry.isDirectory() ? walk(nextPath) : nextPath
  })
}

function collectGenerationSummary(generation) {
  const writingsDir = path.join('content', 'tech-blog-book', `generation-${generation}`, 'writings')
  const files = walk(writingsDir).filter((file) => file.endsWith('.md'))
  const levelCounts = {}

  for (const filePath of files) {
    const text = fs.readFileSync(filePath, 'utf8')
    const level = (text.match(/^level:\s*"([^"]+)"/m) || [])[1]
    if (level) {
      levelCounts[level] = (levelCounts[level] ?? 0) + 1
    }
  }

  const stats = validationStats[generation]
  const collectedFiles = files.length

  return {
    generation,
    year: years[generation],
    submitters: stats.submitters,
    representativeSubmissions: stats.representativeSubmissions,
    collectedFiles,
    extras: collectedFiles - stats.representativeSubmissions,
    verificationBasis: stats.verificationBasis,
    levelCounts
  }
}

function getLevelLabel(generation, level) {
  return levelLabels[level]
}

function formatMetaKey(key) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`
}

function formatOverviewMeta(summary) {
  return `${summary.submitters}명 · 대표 ${summary.representativeSubmissions}건 · 수집 ${summary.collectedFiles}편`
}

function formatOverviewLine(summary) {
  return `제출자 ${summary.submitters}명 · 대표 제출 ${summary.representativeSubmissions}/${summary.representativeSubmissions}건 · 전체 수집 ${summary.collectedFiles}편`
}

function buildNote(summary) {
  if (summary.generation === 6) {
    return `${summary.verificationBasis}으로 대표 제출을 검증했고, 현재 누락은 없습니다. 최종 미션 제출은 \`테크니컬 라이팅\`으로 별도 분류했습니다.`
  }

  if (summary.extras > 0) {
    return `${summary.verificationBasis}으로 대표 제출을 검증했습니다. 전체 수집에는 대표 제출 외에 README 기반 초안과 보조 문서 ${summary.extras}편이 함께 포함됩니다.`
  }

  return `${summary.verificationBasis}으로 대표 제출을 검증했고, 현재 누락은 없습니다.`
}

function buildArchiveStatusTable(summary) {
  const rows = [
    ['대표 제출', `${summary.representativeSubmissions}건`],
    ['전체 수집', `${summary.collectedFiles}편`]
  ]

  if (summary.extras > 0) {
    rows.push(['추가 수집 문서', `${summary.extras}편`])
  }

  const technicalWritingCount = summary.levelCounts['technical-writing'] ?? 0
  if (technicalWritingCount > 0) {
    rows.push(['테크니컬 라이팅', `${technicalWritingCount}편`])
  }

  const unclassifiedCount = summary.levelCounts.unclassified ?? 0
  if (unclassifiedCount > 0) {
    rows.push(['기타 분류 문서', `${unclassifiedCount}편`])
  }

  return [
    '## 아카이브 현황',
    '',
    '| 항목 | 수치 |',
    '|---|---:|',
    ...rows.map(([label, value]) => `| ${label} | ${value} |`),
    ''
  ]
}

function writeGeneratedArchiveSummaries(summaries) {
  const filePath = path.join('data', 'archive-summaries.generated.ts')
  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  const payload = Object.fromEntries(summaries.map((summary) => [summary.generation, summary]))
  const lines = [
    'export type ArchiveSummary = {',
    '  generation: number',
    '  year: number',
    '  submitters: number',
    '  representativeSubmissions: number',
    '  collectedFiles: number',
    '  extras: number',
    '  verificationBasis: string',
    '  levelCounts: Record<string, number>',
    '}',
    '',
    `export const archiveSummaries: Record<number, ArchiveSummary> = ${JSON.stringify(payload, null, 2)}`
  ]

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

function writeTopLevelIndex(summaries) {
  const lines = [
    '# 우아한테크코스 크루 글쓰기 아카이브',
    '',
    '우아한테크코스 크루들의 글을 기수별로 모아보는 이야기 저장소입니다.',
    '',
    '<Callout type="info">',
    '카드 메타는 `제출자 / 대표 제출 / 전체 수집` 순서입니다. 대표 제출은 기수별 검증 기준으로 확인한 제출 건수이고, 전체 수집은 README 등 보조 문서를 포함한 실제 문서 수입니다.',
    '</Callout>',
    '',
    '## 기수별 아카이브',
    '',
    '<CardGrid>'
  ]

  for (const summary of summaries) {
    lines.push(`  <Card title="${summary.generation}기 (${summary.year})" href="/tech-blog-book/generation-${summary.generation}" meta="${formatOverviewMeta(summary)}">`)
    lines.push(`    ${summary.generation === 1 ? '우아한테크코스의 시작과 첫 크루들의 기록' : generationDescription(summary.generation)}`)
    lines.push('  </Card>')
  }

  lines.push('  <Card title="8기 (2026)" meta="진행 중" disabled>')
  lines.push('    현재 진행 중인 8기 크루들의 기록은 순차적으로 공개됩니다.')
  lines.push('  </Card>')
  lines.push('</CardGrid>')
  lines.push('')
  lines.push('## 읽는 방법')
  lines.push('')
  lines.push('- 관심 있는 기수를 먼저 선택해 전체 분위기를 파악해 보세요.')
  lines.push('- `대표 제출`과 `전체 수집`을 함께 보면 아카이브 정리 상태를 빠르게 확인할 수 있습니다.')
  lines.push('- 읽은 뒤에는 자신의 경험을 글로 남겨 다음 기록과 연결해 보세요.')

  fs.writeFileSync(path.join('content', 'tech-blog-book', 'index.mdx'), `${lines.join('\n')}\n`, 'utf8')
}

function buildVerificationNote(summary) {
  if (summary.generation === 1) {
    return '출석부 45명 외 PR 기준 제출자 1명이 추가 확인됐습니다.'
  }

  if (summary.generation === 6) {
    return `테크니컬 라이팅 ${summary.levelCounts['technical-writing'] ?? 0}편을 별도 분류했습니다.`
  }

  if (summary.extras > 0) {
    return `추가 수집 문서 ${summary.extras}편이 함께 보관됩니다.`
  }

  return '현재 누락 없이 정리돼 있습니다.'
}

function writeVerificationStatusPage(summaries) {
  const lines = [
    '# 아카이브 검증 현황',
    '',
    '기수별 아카이브의 현재 검증 결과를 한 번에 확인할 수 있는 요약 페이지입니다.',
    '',
    '<Callout type="info">',
    '`대표 제출`은 PR 또는 브랜치 커밋 로그 기준으로 확인한 제출 건수이고, `전체 수집`은 아카이브에 실제 보관 중인 문서 수입니다.',
    '</Callout>',
    '',
    '| 기수 | 제출자 | 대표 제출 | 전체 수집 | 추가 문서 | 검증 기준 | 비고 |',
    '|---|---:|---:|---:|---:|---|---|'
  ]

  for (const summary of summaries) {
    lines.push(`| [${summary.generation}기](/tech-blog-book/generation-${summary.generation}) | ${summary.submitters}명 | ${summary.representativeSubmissions}건 | ${summary.collectedFiles}편 | ${summary.extras}편 | ${summary.verificationBasis} | ${buildVerificationNote(summary)} |`)
  }

  lines.push('')
  const targetDir = path.join('content', 'tech-blog-book', 'verification-status')
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'index.mdx'), `${lines.join('\n')}\n`, 'utf8')
}

function generationDescription(generation) {
  switch (generation) {
    case 2:
      return '환경 변화 속에서도 이어진 학습과 성장의 기록'
    case 3:
      return '팀 학습 문화가 자리 잡던 시기의 글 모음'
    case 4:
      return '더 단단해진 협업과 개발 경험을 담은 기록'
    case 5:
      return '기수별 경험이 깊어진 시기의 글쓰기 아카이브'
    case 6:
      return '변화하는 개발 환경 속에서 축적된 성장 이야기'
    case 7:
      return '최신 기수의 학습과 협업 경험을 모은 기록'
    default:
      return ''
  }
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
    const count = summary.levelCounts[level] ?? 0
    if (count === 0) continue
    lines.push(`  ${formatMetaKey(level)}: '${getLevelLabel(summary.generation, level)} (${count}편)',`)
  }
  lines.push('}')
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

function writeWritingsIndex(summary) {
  const filePath = path.join('content', 'tech-blog-book', `generation-${summary.generation}`, 'writings', 'index.mdx')
  const lines = [
    `# ${summary.generation}기 글 모음`,
    '',
    formatOverviewLine(summary),
    '',
    buildNote(summary),
    '',
    ...buildArchiveStatusTable(summary),
    '| 구분 | 수집 문서 |',
    '|---|---:|'
  ]

  for (const level of levelOrder) {
    const count = summary.levelCounts[level] ?? 0
    if (count === 0) continue
    lines.push(`| [${getLevelLabel(summary.generation, level)}](/tech-blog-book/generation-${summary.generation}/writings/${level}) | ${count}편 |`)
  }

  lines.push('')
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

const summaries = generations.map(collectGenerationSummary)

writeGeneratedArchiveSummaries(summaries)
writeTopLevelIndex(summaries)
writeVerificationStatusPage(summaries)

for (const summary of summaries) {
  writeGenerationMeta(summary)
  writeWritingsMeta(summary)
  writeWritingsIndex(summary)
}

console.log(JSON.stringify(summaries, null, 2))
