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
  return `PR 기준 제출자 ${summary.prSubmitters}명 · PR 제출 ${summary.prSubmissionPairs}건 · 현재 아카이브 ${summary.collectedFiles}편`
}

function renderNote(summary: ArchiveSummary) {
  return (
    <>
      {summary.verificationBasis}으로 검토했습니다.{' '}
      {summary.attendanceCount ? <>출석부 {summary.attendanceCount}명 대비 PR 제출자는 {summary.prSubmitters}명입니다. </> : null}
      {summary.missingPairs > 0 || summary.extraPairs > 0 ? (
        <>
          현재 아카이브는 PR 기준 author-level 쌍보다 {summary.missingPairs}건 부족하고, {summary.extraPairs}건은 다른 계정명 또는 분류로 저장돼 있습니다.
        </>
      ) : (
        <>현재 아카이브는 PR 기준과 일치합니다.</>
      )}
    </>
  )
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
  const rows: Array<[string, string]> = []

  if (summary.attendanceCount) {
    rows.push(['출석부 인원', `${summary.attendanceCount}명`])
  }

  rows.push(['PR 기준 제출자', `${summary.prSubmitters}명`])
  rows.push(['PR 기준 제출', `${summary.prSubmissionPairs}건`])
  rows.push(['현재 아카이브 작성자', `${summary.archiveSubmitters}명`])
  rows.push(['현재 아카이브 author-level 쌍', `${summary.archivePairs}건`])
  rows.push(['현재 아카이브 파일', `${summary.collectedFiles}편`])

  if (summary.supplementalFiles > 0) {
    rows.push(['보조/중복 파일', `${summary.supplementalFiles}편`])
  }

  if (summary.missingPairs > 0 || summary.extraPairs > 0) {
    rows.push(['PR 기준 미반영', `${summary.missingPairs}건`])
    rows.push(['계정명/분류 불일치', `${summary.extraPairs}건`])
  }

  const technicalWritingCount = summary.archiveLevelCounts['technical-writing'] ?? 0
  if (technicalWritingCount > 0) {
    rows.push(['테크니컬 라이팅', `${technicalWritingCount}편`])
  }

  const unclassifiedCount = summary.archiveLevelCounts.unclassified ?? 0
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
        const count = summary.archiveLevelCounts[level] ?? 0
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
