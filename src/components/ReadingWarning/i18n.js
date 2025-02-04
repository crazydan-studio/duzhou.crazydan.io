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
  .done();
