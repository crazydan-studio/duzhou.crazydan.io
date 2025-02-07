import { i18n, arg } from '@site/src/components/I18n';

export default i18n()
  //
  .trans(['warning.title'])
  .zh('阅读提醒')
  .en('Reading Warning')
  //
  .trans(['warning.content'])
  .zh('本文还在编辑整理中，后续可能会发生较大变动，请谨慎阅读！')
  .en(
    'This article is still being edited,' +
      ' and significant changes may occur in the future.' +
      ' Please proceed with caution when reading!'
  )
  //
  .trans(['warning.draft.content'])
  .zh('本文还是草稿，只有本地开发可见，不会出现在发布环境中！')
  .en(
    'This article is a draft,' +
      ' and it can only be read in development environment, ' +
      ' it will not be published in release environment!'
  )
  //
  .done();
