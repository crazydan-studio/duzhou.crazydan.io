import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import i18n from './i18n';
import styles from './styles.module.css';

const features = [
  {
    title: '先进的理论支撑',
    imageUrl: '/img/home/advance.jpg',
    description: (
      <>
        以最为前沿和先进的软件构造理论「<a href="https://zhuanlan.zhihu.com/p/64004026">可逆计算</a>」为核心指导思想，
        进行平台的功能设计与技术实现，
        打造出<b>可持续演化</b>的业务应用平台，积极主动地适应新时代、新环境的业务开发需求。
      </>
    ),
  },
  {
    title: '丰富的部件生态',
    imageUrl: '/img/home/ecology.jpg',
    description: (
      <>
        得益于可逆计算的<a href="https://zhuanlan.zhihu.com/p/632876361">差量机制</a>，
        本平台将提供各类业务需求所需要的<b>前后端一体</b>的功能部件，
        并推动和发展部件市场，以形成良好且繁荣的部件生态圈，从而实现开发者和业务需求方的互利共赢。
      </>
    ),
  },
  {
    title: '不变的开发初心',
    imageUrl: '/img/home/solution.jpg',
    description: (
      <>
        帮助各类企业搭建起先进的数字基础平台，为开发者提供便捷、稳定、高效的开发环境，
        让数字基础更好、更快、更稳地为社会生产力和生产效率服务，同时让开发者的潜力能够得到完全释放。
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} />
        </div>
      )}
      <h3>{i18n(title)}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={i18n('首页')}
      description={`${i18n(siteConfig.title)}: ${i18n(siteConfig.tagline)}`}>
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className={clsx('hero__title', styles.heroTitle)}>{i18n(siteConfig.title)}</h1>
          <p className={clsx('hero__subtitle', styles.heroSubtitle)}>{i18n(siteConfig.tagline)}</p>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container text--center">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
