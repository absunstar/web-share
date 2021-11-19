const site = require('../isite')({
    version: '2021.11.20',
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
    path: site.dir + '/images/',
    public: true,
});

site.loadLocalApp('client-side');
site.loadLocalApp('security');
site.loadLocalApp('ui-print');

setTimeout(() => {
    site.onGET('*', (req, res) => {
        res.render(
            'posts/index.html',
            {},
            {
                parser: 'html css js',
                public: true,
            },
        );
    });
}, 1000 * 3);

site.run([80]);
