const site = require('../isite')({
  www : false,
  version: 'version_' + new Date().getTime().toString() + '___',
  port: 8080,
  savingTime: 0.5,
  apps_dir: process.cwd() + '/apps',
  name: 'Web Share',
  lang: 'ar',
  theme: 'default_theme',
  _0x14xo: !0,
  https: {
    enabled: !1,
    port: 18080,
  },
  cache: {
    json: 0,
  },
  mongodb: {
    limit: 100,
    db: 'web_share',
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99', 'a2797cd0076d385e86663865dc4d855b'],
  },
  public: true,
});

site.onGET({
  name: '/',
  path: site.dir,
  public: true,
});

site.onGET({
  name: 'favicon.ico',
  path: site.dir + '/images/favicon.ico',
  public: true,
});

site.loadLocalApp('client-side');
site.loadLocalApp('security');
site.loadLocalApp('ui-print');

site.onGET('glx_ecfdd4d6a3041a9e7eeea5a9947936bd.txt', (req, res) => {
  res.end('Galaksion check: 86531e4391aecbe5e70d086020f703f2');
});

setTimeout(() => {
  site.onGET('*', (req, res) => {
    req.data.page_title = site.word('page_title').ar;
    req.data.page_title2 = site.word('page_title2').ar;
    req.data.page_description = site.word('page_description').ar;
    req.data.page_keywords = site.word('page_keywords').ar;
    req.data.image_url = '/images/logo.png';
    req.data.h1 = req.data.page_description;
    res.render(
      'posts/index.html',
      {
        ...req.data,
        siteNews: site.pageData.siteNews,
        PostTypes: site.pageData.PostTypes,
        ytsList: site.pageData.ytsList,
        newsList: site.pageData.newsList,
        childrenList: site.pageData.childrenList,
      },
      {
        parser: 'html css js',
        public: true,
        code: 404,
      }
    );
  });
}, 1000 * 3);

site.run([80]);
