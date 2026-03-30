import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/',
  search: {
    codeblocks: false
  }
})

export default withNextra({
  output: 'export',
  images: {
    unoptimized: true
  }
})
