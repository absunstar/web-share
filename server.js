const site = require('../isite')({
  version: '1.0.15',
  port: 8080,
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
  },
  security: {
    keys: [],
  },
  defaults: {
    features: ['browser.social'],
  },
});

site.get({
  name: '/',
  path: site.dir,
});

site.loadLocalApp('client-side');
site.loadLocalApp('security');
site.loadLocalApp('ui-print');

setTimeout(() => {
  site.get('*', (req, res) => {
    res.render(
      'posts/index.html',
      {},
      {
        parser: 'html css js',
      },
    );
  });
}, 1000 * 3);

// site.addFeature('register')
site.run([80]);
