import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Callout } from './components/Callout'
import { Card } from './components/Card'
import { CardGrid } from './components/CardGrid'
import { GenerationArchiveCards, GenerationArchiveIntro, GenerationArchiveStatus } from './components/GenerationArchive'
import { Placeholder } from './components/Placeholder'
import { Toggle } from './components/Toggle'
import { Hero } from './components/Hero'
import { WritingMeta } from './components/WritingMeta'

const docsComponents = getDocsMDXComponents()
const docsWrapper = docsComponents.wrapper

type DocsWrapperProps = Parameters<typeof docsWrapper>[0]

function WrapperWithWritingMeta(props: DocsWrapperProps) {
  const metadata = props.metadata as Record<string, unknown>
  const author = typeof metadata.author === 'string' ? metadata.author : undefined
  const source = typeof metadata.source === 'string' ? metadata.source : undefined

  return docsWrapper({
    ...props,
    children: (
      <>
        <WritingMeta author={author} source={source} />
        {props.children}
      </>
    )
  })
}

export function useMDXComponents(components?: Record<string, unknown>) {
  return {
    ...docsComponents,
    wrapper: WrapperWithWritingMeta,
    Callout,
    Card,
    CardGrid,
    GenerationArchiveCards,
    GenerationArchiveIntro,
    GenerationArchiveStatus,
    Placeholder,
    Toggle,
    Hero,
    ...components
  }
}
