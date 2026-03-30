import { Layout, Navbar, ThemeSwitch } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import './globals.css'

export const metadata = {
  title: '우아한테크코스 크루 글쓰기 아카이브',
  description: '우아한테크코스 크루들의 글을 기수별로 모아 보는 이야기 저장소'
}

const logo = (
  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <span style={{ fontSize: '1.25rem' }}>W</span>
    <span style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>
      우아한테크코스
    </span>
  </span>
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" dir="ltr" suppressHydrationWarning>
      <Head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </Head>
      <body>
        <Layout
          navbar={
            <Navbar logo={logo}>
              <ThemeSwitch lite className="theme-switch-navbar" />
            </Navbar>
          }
          search={
            <Search
              placeholder="글 검색..."
              emptyResult="검색 결과가 없습니다."
              errorText="검색 인덱스를 불러오지 못했습니다. 빌드를 다시 실행해 주세요."
              loading="검색 중..."
            />
          }
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/woowacourse-projects/woowa-writing-history/tree/main"
          copyPageButton={false}
          sidebar={{
            defaultMenuCollapseLevel: 1,
            toggleButton: true
          }}
          footer={
            <footer className="site-footer">
              <span style={{ fontSize: '0.8125rem', color: 'rgb(155, 155, 155)' }}>
                © {new Date().getFullYear()} 우아한테크코스 · 우아한형제들 테크교육개발팀
              </span>
            </footer>
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
