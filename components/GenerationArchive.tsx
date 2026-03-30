import { archiveSummaries, type ArchiveSummary } from '@/data/archive-summaries.generated'
import { Callout } from './Callout'
import { Card } from './Card'
import { CardGrid } from './CardGrid'

const levelOrder = ['level1', 'level2', 'level3', 'level4', 'technical-writing', 'level5', 'unclassified']
const levelLabels: Record<string, string> = {
  level1: '레벨 1',
  level2: '레벨 2',
  level3: '레벨 3',
  level4: '레벨 4',
  'technical-writing': '테크니컬 라이팅',
  level5: '레벨 5',
  unclassified: '기타 분류'
}

type GenerationArchiveProps = {
  generation: number
}

function getSummary(generation: number): ArchiveSummary {
  const summary = archiveSummaries[generation]
  if (!summary) {
    throw new Error(`Missing archive summary for generation ${generation}`)
  }
  return summary
}

function formatOverviewLine(summary: ArchiveSummary) {
  return `제출자 ${summary.submitters}명 · 대표 제출 ${summary.representativeSubmissions}/${summary.representativeSubmissions}건 · 전체 수집 ${summary.collectedFiles}편`
}

function renderNote(summary: ArchiveSummary) {
  if (summary.generation === 6) {
    return (
      <>
        {summary.verificationBasis}으로 대표 제출을 검증했고, 현재 누락은 없습니다. 최종 미션 제출은 <code>테크니컬 라이팅</code>으로 별도 분류했습니다.
      </>
    )
  }

  if (summary.extras > 0) {
    return (
      <>
        {summary.verificationBasis}으로 대표 제출을 검증했습니다. 전체 수집에는 대표 제출 외에 README 기반 초안과 보조 문서 {summary.extras}편이 함께 포함됩니다.
      </>
    )
  }

  return <>{summary.verificationBasis}으로 대표 제출을 검증했고, 현재 누락은 없습니다.</>
}

function getLevelLabel(level: string) {
  return levelLabels[level] ?? level
}

export function GenerationArchiveIntro({ generation }: GenerationArchiveProps) {
  const summary = getSummary(generation)

  return (
    <>
      <Callout type="info">{formatOverviewLine(summary)}</Callout>
      <p>{renderNote(summary)}</p>
    </>
  )
}

export function GenerationArchiveStatus({ generation }: GenerationArchiveProps) {
  const summary = getSummary(generation)
  const rows: Array<[string, string]> = [
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

  return (
    <table>
      <thead>
        <tr>
          <th>항목</th>
          <th style={{ textAlign: 'right' }}>수치</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td>{label}</td>
            <td style={{ textAlign: 'right' }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function GenerationArchiveCards({ generation }: GenerationArchiveProps) {
  const summary = getSummary(generation)

  return (
    <CardGrid>
      {levelOrder.flatMap((level) => {
        const count = summary.levelCounts[level] ?? 0
        if (count === 0) {
          return []
        }

        const label = getLevelLabel(level)
        const description = level === 'unclassified' ? '파일명 규칙으로 분류되지 않은 글 모음' : `${label} 글 모음`

        return (
          <Card
            key={level}
            title={label}
            href={`/tech-blog-book/generation-${summary.generation}/writings/${level}`}
            meta={`${count}편`}
          >
            {description}
          </Card>
        )
      })}
    </CardGrid>
  )
}
