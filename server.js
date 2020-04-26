const site = require('../isite')({
  port: 8080,
  apps_dir: process.cwd() + '/apps',
  name: "Web Share",
  lang: 'ar',
  theme: 'default_theme',
  https : {
    enabled : false,
    port : 18080
  },
  cache:{
    json : 0
  },
  mongodb:{
    limit : 100,
    db : 'web_share'
  },
  security :{
    admin : {
      email : 'amr',
      password : '3273'
    }
  }
})

site.get({
  name: '/',
  path: site.dir
})

site.loadLocalApp('client-side')
site.loadLocalApp('security')
site.loadLocalApp('ui-print')

// site.addFeature('register')
site.run()