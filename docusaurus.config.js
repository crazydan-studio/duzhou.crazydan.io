const localPlantUML = require('@mstroppel/remark-local-plantuml');
const math = require('remark-math');
const katex = require('rehype-katex');

module.exports = {
  title: '渡舟平台',
  tagline: '致力于构建自运维、自监控、可演化的全功能型应用平台',
  url: 'https://duzhou.crazydan.io',
  baseUrl: '/',
  favicon: 'img/logo.svg',
  organizationName: 'Crazydan Studio',
  projectName: 'duzhou.crazydan.io',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en']
  },
  themeConfig: {
    navbar: {
      title: '渡舟',
      logo: {
        alt: '渡舟平台',
        src: 'img/logo.svg'
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: '文档',
          position: 'left'
        },
        {
          href: 'https://market.duzhou.crazydan.io',
          label: '市场',
          position: 'left'
        },
        {
          to: 'blog/',
          activeBasePath: 'blog',
          label: '博客',
          position: 'left'
        },
        // ==============================
        {
          type: 'docsVersionDropdown',
          position: 'right',
          docsPluginId: 'default'
        },
        {
          type: 'dropdown',
          label: '源代码',
          position: 'right',
          items: [
            {
              href: 'https://github.com/crazydan-studio/duzhou',
              label: 'Github'
            }
          ]
        },
        {
          type: 'localeDropdown',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '我们',
          items: [
            {
              label: 'Crazydan Studio',
              href: 'https://studio.crazydan.org'
            }
          ]
        },
        {
          title: '友情链接',
          items: []
        },
        {
          title: '可逆计算',
          items: [
            {
              label: '理论基础',
              href: 'https://zhuanlan.zhihu.com/p/64004026'
            },
            {
              label: 'NopPlatform',
              href: 'https://github.com/entropy-cloud/nop-entropy'
            }
          ]
        },
        {
          title: '更多',
          items: []
        }
      ],
      copyright: 'footer.copyright'
    },
    // https://github.com/flexanalytics/plugin-image-zoom
    imageZoom: {
      // CSS selector to apply the plugin to, defaults to '.markdown img'
      selector: '.markdown img, .project img',
      // Optional medium-zoom options
      // see: https://www.npmjs.com/package/medium-zoom#options
      options: {
        background: 'rgba(0, 0, 0, 0.5)',
        margin: 32,
        scrollOffset: 1000000
      }
    },
    // https://giscus.app/zh-CN
    // https://www.alanwang.site/posts/blog-guides/docusaurus-comment
    giscus: {
      repo: 'crazydan-studio/duzhou.crazydan.io',
      repoId: 'R_kgDOK5E9Wg',
      category: 'Announcements',
      categoryId: 'DIC_kwDOK5E9Ws4Cbsjr'
    },
    prism: {
      theme: require('./src/theme/prism/prismLight'),
      darkTheme: require('./src/theme/prism/prismDark'),
      // https://docusaurus.io/docs/markdown-features/code-blocks#supported-languages
      // https://github.com/FormidableLabs/prism-react-renderer/blob/master/packages/generate-prism-languages/index.ts#L9-L23
      additionalLanguages: ['elm', 'elixir', 'erlang', 'bash', 'yaml', 'java', 'latex']
    }
  },
  clientModules: [require.resolve('./src/clientModules/routeModules.ts')],
  stylesheets: [
    {
      href: '/katex/katex.min.css',
      type: 'text/css'
    }
  ],
  plugins: [
    'plugin-image-zoom',
    // https://docusaurus.io/docs/2.x/versioning
    // 创建版本: yarn docusaurus docs:version x.y.z
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'default',
        routeBasePath: 'docs',
        path: 'docs',
        sidebarPath: require.resolve('./docs/sidebars.js'),
        editUrl:
          'https://github.com/crazydan-studio/duzhou.crazydan.io/edit/master',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        // https://github.com/mstroppel/remark-local-plantuml/#integration
        remarkPlugins: [localPlantUML, math],
        // https://docusaurus.io/docs/2.x/markdown-features/math-equations#configuration
        rehypePlugins: [katex],
        lastVersion: 'current',
        versions: {
          current: {
            label: 'v0.1.0',
            banner: 'unreleased'
          }
          // '2.1.0': {
          //   label: 'v2.1.0'
          // },
          // '1.1.0': {
          //   label: 'v1.1.0'
          // },
        }
      }
    ]
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        },
        blog: {
          id: 'blog',
          path: 'blog',
          routeBasePath: 'blog',
          include: ['*.md', '*.mdx'],
          postsPerPage: 10,
          showReadingTime: true,
          // https://github.com/mstroppel/remark-local-plantuml/#integration
          remarkPlugins: [localPlantUML, math],
          // https://docusaurus.io/docs/2.x/markdown-features/math-equations#configuration
          rehypePlugins: [katex],
          truncateMarker: /<!--\s*(more)\s*-->/,
          feedOptions: {
            type: 'all',
            copyright: `Copyright © 2023-${new Date().getFullYear()} Crazydan Studio (https://studio.crazydan.org).`
          }
        },
        docs: false
      }
    ]
  ]
};
