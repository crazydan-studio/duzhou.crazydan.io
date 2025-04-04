import { i18n } from '@site/src/components/I18n';

export default i18n()
  //
  .trans(['首页'])
  .en('Home')
  //
  .trans(['文档'])
  .en('Document')
  //
  .trans(['博客'])
  .en('Blog')
  //
  .trans(['市场'])
  .en('Market')
  //
  .trans(['源代码'])
  .en('Open Source')
  //
  .trans(['渡舟平台'])
  .en('Duzhou Platform')
  //
  .trans(['致力于构建自运维、自监控、可演化的应用生产平台'])
  .en('Building a self-operating, self-monitoring, and evolvable application production platform')
  //
  .trans(['footer.copyright'])
  .zh(
    () =>
      `版权所有 © 2023 <a href="https://studio.crazydan.org">Crazydan Studio</a><br>本站通过 <a href="https://v2.docusaurus.io/">Docusaurus 2</a> 构建`
  )
  .en(
    () =>
      `Copyright © 2023 <a href="https://studio.crazydan.org">Crazydan Studio</a><br>Build with <a href="https://v2.docusaurus.io/">Docusaurus 2</a>`
  )
  //
  .trans(['我们'])
  .en('Ours')
  //
  .trans(['友情链接'])
  .en('Links')
  //
  .trans(['更多'])
  .en('More')
  //
  .trans(['可逆计算'])
  .en('Reversible Computation')
  //
  .trans(['理论基础'])
  .en('Theory')
  //
  .done();
