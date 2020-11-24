const site = require('../isite')({
  version: '1.0.10',
  port: 8080,
  apps_dir: process.cwd() + '/apps',
  name: 'Web Share',
  lang: 'ar',
  theme: 'default_theme',
  full: true,
  https: {
    enabled: false,
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
    admin: {
      email: 'amr',
      password: '3273',
    },
  },
  require: {
    features: [],
    permissions: [],
  },
  default: {
    features: [],
    permissions: [],
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
  site.get("*", (req, res) => {
    res.render("posts/index.html", {}, {
      parser: 'html css js'
    })
  })
  
}, 1000 * 3);



// site.addFeature('register')
site.run([80]);
