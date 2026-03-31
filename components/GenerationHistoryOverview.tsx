import { Fragment } from 'react'
import { archiveSummaries } from '@/data/archive-summaries.generated'
import { Card } from './Card'
import { CardGrid } from './CardGrid'
import styles from './GenerationHistoryOverview.module.css'

const generationStories = [
  {
    generation: 1,
    year: 2019,
    label: '시작과 적응',
    question: '낯선 교육 환경에서 어떻게 버틸 것인가?',
    summary: '페어 프로그래밍의 충격, 비교의 압박, 생활 리듬의 재구성이 첫 서사를 만든다.'
  },
  {
    generation: 2,
    year: 2020,
    label: '학습법의 전환',
    question: '나는 어떤 방식으로 배워야 하는가?',
    summary: '공식 문서, 질문, 토론, 팀 프로젝트가 학습 방법을 더 구체적인 기술로 바꾼다.'
  },
  {
    generation: 3,
    year: 2021,
    label: '관계와 자신감',
    question: '좋은 동료 속에서 나를 어떻게 지킬 것인가?',
    summary: '좋은 사람과 함께 배우는 경험, 번아웃 경계, 자신감 회복이 중심에 놓인다.'
  },
  {
    generation: 4,
    year: 2022,
    label: '함께 자라기의 정착',
    question: '개인의 성장을 팀 문화로 어떻게 확장할 것인가?',
    summary: '기록, 설명, 설득, 공유가 공동체의 성장 기술로 자리 잡는다.'
  },
  {
    generation: 5,
    year: 2023,
    label: '서비스와 독자의 등장',
    question: '이 글은 누구에게 무엇을 설명하는가?',
    summary: '회고를 넘어 서비스 소개, 학습 철학, 진로 확장으로 글의 시야가 넓어진다.'
  },
  {
    generation: 6,
    year: 2024,
    label: '자기 운영과 실무 기록',
    question: '감정과 협업, 기술 문제를 어떻게 같이 다룰 것인가?',
    summary: '자기 관리와 협업 신뢰, 테크니컬 라이팅이 한 기수 안에서 병행된다.'
  },
  {
    generation: 7,
    year: 2025,
    label: '자기 인식과 학습 실험',
    question: '어떤 사람으로 성장하고 싶은가?',
    summary: '메타인지, AI 활용, 성장 기록이 초기 글의 핵심 질문으로 부상한다.'
  }
] as const

const phaseStories = [
  {
    title: '적응의 시대',
    range: '1기~2기',
    focus: '페어 프로그래밍, 비교, 생활 습관, 학습 환경 적응',
    shift: '첫 질문은 늘 “여기서 버틸 수 있을까?”였다.'
  },
  {
    title: '학습법의 정교화',
    range: '2기~5기',
    focus: '공식 문서, 기록, 설명 가능한 학습, 회고와 검증',
    shift: '질문은 “나는 어떻게 배워야 하는가?”로 이동한다.'
  },
  {
    title: '협업과 서비스의 확장',
    range: '3기~6기',
    focus: '팀 프로젝트, 팀 문화, 서비스 소개, 신뢰 형성',
    shift: '개인 성장을 팀과 사용자 맥락으로 넓혀 보는 시기가 온다.'
  },
  {
    title: '정체성의 재해석',
    range: '1기~7기',
    focus: '내가 꿈꾸는 프로그래머, 자기 인식, 테크니컬 라이팅, AI 학습',
    shift: '마지막에는 “어떤 개발자가 되고 싶은가?”가 남는다.'
  }
] as const

const themeMatrix = [
  {
    theme: '적응과 생활 변화',
    explanation: '낯선 교육 환경, 페어 프로그래밍, 비교와 생활 리듬 재구성',
    values: [3, 3, 2, 2, 2, 1, 1]
  },
  {
    theme: '학습법과 기록',
    explanation: '공식 문서, 기록, 설명 가능한 학습, 회고와 검증',
    values: [1, 3, 3, 3, 3, 3, 2]
  },
  {
    theme: '협업과 팀 문화',
    explanation: '팀 프로젝트, 신뢰 형성, 함께 자라기, 역할 조율',
    values: [1, 2, 3, 3, 3, 3, 1]
  },
  {
    theme: '서비스와 사용자',
    explanation: '서비스 소개, 독자 의식, 사용자 맥락, 실서비스 문제',
    values: [0, 1, 1, 1, 3, 2, 1]
  },
  {
    theme: '자기 인식과 감정',
    explanation: '불안, 메타인지, 자기 운영, 심리적 안정감',
    values: [1, 1, 2, 2, 2, 3, 3]
  },
  {
    theme: '개발자 정체성',
    explanation: '내가 꿈꾸는 프로그래머, 앞으로의 삶, 성장의 방향',
    values: [3, 2, 2, 2, 3, 2, 2]
  }
] as const

const generationDescriptions: Record<number, string> = {
  1: '우아한테크코스의 시작과 첫 크루들의 기록',
  2: '환경 변화 속에서도 이어진 학습과 성장의 기록',
  3: '팀 학습 문화가 자리 잡던 시기의 글 모음',
  4: '더 단단해진 협업과 개발 경험을 담은 기록',
  5: '기수별 경험이 깊어진 시기의 글쓰기 아카이브',
  6: '변화하는 개발 환경 속에서 축적된 성장 이야기',
  7: '최신 기수의 학습과 협업 경험을 모은 기록'
}

const summaries = generationStories.map((story) => ({
  ...story,
  summaryData: archiveSummaries[story.generation]
}))

const totalFiles = summaries.reduce((sum, item) => sum + item.summaryData.collectedFiles, 0)
const totalSubmitters = summaries.reduce((sum, item) => sum + item.summaryData.prSubmitters, 0)
const maxFiles = Math.max(...summaries.map((item) => item.summaryData.collectedFiles))

function formatBarWidth(value: number) {
  return `${Math.max((value / maxFiles) * 100, 8)}%`
}

export function GenerationHistoryOverview() {
  return (
    <div className={styles.shell}>
      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>아카이브 범위</span>
          <strong className={styles.summaryValue}>1기~7기</strong>
          <p className={styles.summaryText}>2019년부터 2025년까지, 우테코 글쓰기가 어떤 질문을 남겼는지 한 화면에 요약했습니다.</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>누적 글 규모</span>
          <strong className={styles.summaryValue}>{totalFiles.toLocaleString()}편</strong>
          <p className={styles.summaryText}>지금까지 수집된 전체 글 수입니다. 기수별로 확인된 작성자 규모 {totalSubmitters.toLocaleString()}명과 함께 읽으면 변화의 폭이 더 잘 보입니다.</p>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>질문의 큰 흐름</span>
          <strong className={styles.summaryValue}>적응 → 학습 → 협업 → 정체성</strong>
          <p className={styles.summaryText}>기수가 바뀔수록 글의 중심이 적응기에서 자기 운영과 개발자 정체성으로 이동합니다.</p>
        </article>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>기수별 글 규모</h2>
          <p className={styles.panelDescription}>막대 길이는 수집된 글 수를, 오른쪽 수치는 기수별로 확인된 작성자 규모를 보여줍니다.</p>
        </div>
        <div className={styles.scaleList}>
          {summaries.map((item) => (
            <div key={item.generation} className={styles.scaleRow}>
              <div className={styles.scaleMeta}>
                <strong>{item.generation}기</strong>
                <span>{item.label}</span>
              </div>
              <div className={styles.scaleTrack}>
                <div className={styles.scaleFill} style={{ width: formatBarWidth(item.summaryData.collectedFiles) }} />
              </div>
              <div className={styles.scaleNumbers}>
                <strong>{item.summaryData.collectedFiles}편</strong>
                <span>{item.summaryData.prSubmitters}명</span>
              </div>
            </div>
          ))}
        </div>
        <p className={styles.scaleFootnote}>기수별로 확인된 작성자 규모를 합치면 {totalSubmitters.toLocaleString()}명입니다.</p>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>주제 변화 맵</h2>
          <p className={styles.panelDescription}>행은 핵심 주제, 열은 기수입니다. 색이 진할수록 그 기수의 글에서 해당 주제가 더 전면에 드러납니다.</p>
        </div>
        <div className={styles.matrixWrap}>
          <div className={styles.matrix}>
            <div className={styles.matrixCorner}>주제</div>
            {summaries.map((item) => (
              <div key={`${item.generation}-header`} className={styles.matrixHeaderCell}>
                {item.generation}기
              </div>
            ))}
            {themeMatrix.map((row) => (
              <Fragment key={row.theme}>
                <div className={styles.matrixLabel}>
                  <strong>{row.theme}</strong>
                  <span>{row.explanation}</span>
                </div>
                {row.values.map((value, index) => (
                  <div
                    key={`${row.theme}-${index}`}
                    className={`${styles.matrixCell} ${styles[`tone${value}` as keyof typeof styles]}`}
                    aria-label={`${row.theme} ${index + 1}기 강도 ${value}`}
                    title={`${row.theme} · ${index + 1}기`}
                  >
                    {value === 0 ? '·' : value === 1 ? '약' : value === 2 ? '중' : '강'}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>질문의 이동</h2>
          <p className={styles.panelDescription}>각 기수의 글을 묶어 보면, 우테코 글쓰기는 비슷한 주제를 반복하기보다 점점 다른 층위의 질문으로 이동합니다.</p>
        </div>
        <div className={styles.phaseGrid}>
          {phaseStories.map((phase) => (
            <article key={phase.title} className={styles.phaseCard}>
              <div className={styles.phaseRange}>{phase.range}</div>
              <h3 className={styles.phaseTitle}>{phase.title}</h3>
              <p className={styles.phaseShift}>{phase.shift}</p>
              <p className={styles.phaseFocus}>{phase.focus}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>기수별 한 줄 역사</h2>
          <p className={styles.panelDescription}>각 기수는 이전 기수의 질문을 이어받으면서도, 그 시대의 새로운 고민을 추가했습니다.</p>
        </div>
        <div className={styles.timeline}>
          {summaries.map((item) => (
            <article key={item.generation} className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <span className={styles.timelineYear}>{item.year}</span>
                <span className={styles.timelineGeneration}>{item.generation}기</span>
              </div>
              <h3 className={styles.timelineTitle}>{item.label}</h3>
              <p className={styles.timelineQuestion}>{item.question}</p>
              <p className={styles.timelineSummary}>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export function ArchiveGenerationGrid() {
  return (
    <CardGrid>
      {summaries.map((item) => (
        <Card
          key={item.generation}
          title={`${item.generation}기 (${item.year})`}
          href={`/tech-blog-book/generation-${item.generation}`}
          meta={`작성자 ${item.summaryData.prSubmitters}명 · 글 ${item.summaryData.collectedFiles}편`}
        >
          {generationDescriptions[item.generation]}
        </Card>
      ))}
      <Card title="8기 (2026)" meta="진행 중" disabled>
        현재 진행 중인 8기 크루들의 기록은 순차적으로 공개됩니다.
      </Card>
    </CardGrid>
  )
}
