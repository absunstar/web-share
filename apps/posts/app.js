module.exports = function init(site) {
    const post = require(__dirname + '/post.js')(site);
    require(__dirname + '/rss.js')(site, post);
    require(__dirname + '/facebook.js')(site, post);
    require(__dirname + '/google_news.js')(site, post);

    site.onGET({
        name: '/css/posts.css',
        public: true,
        path: [
            __dirname + '/site_files/css/custom.css',
            __dirname + '/site_files/css/post.css',
            __dirname + '/site_files/css/post-type.css',
            __dirname + '/site_files/css/post-category.css',
            __dirname + '/site_files/css/site-news.css',
            __dirname + '/site_files/css/video.css',
            __dirname + '/site_files/css/yts.css',
            __dirname + '/site_files/css/google-news.css',
            __dirname + '/site_files/css/series.css',
            __dirname + '/site_files/css/movies.css',
            __dirname + '/site_files/css/share-buttons.css',
        ],
    });

    post.image_list = [];
    site.onGET('/image/:guid', (req, res) => {
        if (post.image_list[req.params.guid]) {
            site.fetch(post.image_list[req.params.guid], {
                method: 'get',
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363' },
            })
                .then((res) => res.buffer())
                .then((buffer) => {
                    res.set('Content-Type', 'image/png');
                    res.set('Cache-Control', 'public, max-age=' + 60 * site.options.cache.images);
                    res.end(buffer);
                });

            //res.redirect(post.image_list[req.params.guid])
            return;
        } else {
            $posts_content.find(
                {
                    where: {
                        guid: req.params.guid,
                    },
                    select: {
                        details: 1,
                    },
                },
                (err, doc) => {
                    if (!err && doc && doc.details && doc.details.image_url) {
                        let url = doc.details.image_url;
                        post.image_list[req.params.guid] = url;
                        site.fetch(url, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363',
                            },
                            encoding: null,
                        })
                            .then((res) => res.buffer())
                            .then((buffer) => {
                                res.set('Content-Type', 'image/png');
                                res.set('Cache-Control', 'public, max-age=' + 60 * site.options.cache.images);
                                res.end(buffer);
                            });
                        //res.redirect(post.image_list[req.params.guid])
                    } else {
                        res.end(402);
                    }
                },
            );
        }
    });

    site.onGET({
        name: '/',
        path: __dirname + '/site_files',
        public: true,
    });

    site.onGET({ name: '/posts', public: true }, (req, res) => {
        res.render(
            'posts/index.html',
            {},
            {
                parser: 'html css js',
            },
        );
    });

    site.onGET({ name: '/', public: true }, (req, res) => {
        if (req.hasFeature('host.videos')) {
            site.callRoute('/videos', req, res);
        } else if (req.hasFeature('host.news') || req.hasFeature('host.news2')) {
            req.addFeature('hide-right-menu');
            req.data.content_class = 'col9';
            site.callRoute('/posts', req, res);
        } else if (req.hasFeature('host.torrents')) {
            req.addFeature('torrents');
            req.addFeature('hide-right-menu');
            req.addFeature('hide-left-menu');
            req.data.content_class = 'col12';
            site.callRoute('/posts', req, res);
        } else {
            req.addFeature('host.default');
            site.callRoute('/posts', req, res);
        }
    });

    site.onGET({ name: '/youtube-view', public: true }, (req, res) => {
        req.queryRaw.videoid = req.queryRaw.videoid || '_Y8gawCe7mU';
        res.render(
            'posts/youtube_view.html',
            { page_title: 'Show Youtube Video ', page_title2: req.queryRaw.videoid, page_description: 'Dynamic Youtube Video Playing in egytag.com' },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/page-view', public: true }, (req, res) => {
        res.render(
            'posts/page_view.html',
            {},
            {
                parser: 'html css js',
            },
        );
    });

    site.onGET({ name: '/show-video', public: true }, (req, res) => {
        res.render(
            'posts/show-video.html',
            {
                page_title2: 'مشاهدة فيديو',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/akwam', public: true }, (req, res) => {
        res.render(
            'posts/akwam.html',
            {
                page_title2: 'أكوام',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/search', public: true }, (req, res) => {
        res.render(
            'posts/index.html',
            {
                page_title2: '  بحث  | ' + req.query.q,
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/children-videos', public: true }, (req, res) => {
        req.features.push('hide-menu');
        res.render(
            'posts/index.html',
            {
                page_title2: 'فيديوهات للأطفال',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/videos', public: true }, (req, res) => {
        req.addFeature('hide-left-menu');
        req.addFeature('hide-right-menu');
        req.data.content_class = 'col12';
        res.render(
            'posts/index.html',
            {
                page_title2: 'فيديوهات',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/author/:guid/:title', public: true }, (req, res) => {
        res.render(
            'posts/index.html',
            {
                page_title2: decodeURIComponent(req.params.title),
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/torrents', public: true }, (req, res) => {
        req.addFeature('torrents');
        if (req.hasFeature('host.torrents')) {
            req.addFeature('hide-right-menu');
            req.addFeature('hide-left-menu');
            req.data.content_class = 'col12';
        }
        res.render(
            'posts/index.html',
            {
                page_title2: 'torrents movies - أفلام تورينت',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/series', public: true }, (req, res) => {
        req.features.push('hide-menu');
        req.features.push('series');
        res.render(
            'posts/index.html',
            {
                page_title2: 'Series - مسلسلات',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/movies', public: true }, (req, res) => {
        req.features.push('hide-menu');
        req.features.push('movies');
        res.render(
            'posts/index.html',
            {
                page_title2: 'Movies - أفلام',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: '/top-news', public: true }, (req, res) => {
        req.features.push('hide-menu');
        res.render(
            'posts/index.html',
            {
                page_title2: 'Latest News - أهم الأخبار',
            },
            {
                parser: 'html css js',
            },
        );
    });
    site.onGET({ name: ['/post/:guid', '/post2/:guid'], public: true }, (req, res) => {
        let where = {};
        if (req.params.guid == 'random') {
            post.$posts_content.findAll(
                {
                    select: {
                        guid: 1,
                        details: 1,
                    },
                    limit: 100,
                    sort: {
                        date: -1,
                    },
                },
                (err, docs) => {
                    if (!err && docs) {
                        let doc = docs[Math.floor(Math.random() * docs.length)];
                        res.redirect('/post2/' + doc.guid + '/' + encodeURI(doc.details.title));
                    } else {
                        res.redirect('/');
                    }
                },
                true,
            );
        } else {
            if (req.hasFeature('host.torrents')) {
                req.addFeature('hide-right-menu');
                req.data.content_class = 'col9';
            }
            where['guid'] = req.params.guid;
            post.$posts_content.find(
                where,
                (err, doc) => {
                    if (!err && doc) {
                        doc.page_title2 = doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70);
                        doc.image_url = doc.details.image_url;
                        doc.page_description = doc.text.replace(/<[^>]+>/g, '');
                        doc.post_url = req.headers.host + '/post/' + doc.guid + '/' + encodeURI(doc.details.title.split(' ').join('-'));
                        doc.author_url = '/author/' + doc.author.guid + '/' + encodeURI(doc.author.name.split(' ').join('-'));
                        doc.timeago = post.xtime(new Date().getTime() - new Date(doc.date).getTime());
                        doc.page_keywords = doc.details.title.split(' ').join(',');
                        doc.details.description = doc.details.description || '';
                        if (doc.is_video) {
                            doc.post_type = 'full-video';
                            if (doc.details.url.like('https://www.youtube.com/watch*')) {
                                doc.details.url = 'https://www.youtube.com/embed/' + doc.details.url.split('=')[1].split('&')[0];
                            }
                            res.render('posts/video.html', doc, {
                                parser: 'html css js',
                            });
                        } else if (doc.is_yts) {
                            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '');
                            if (req.hasFeature('xbrowser.unknown')) {
                                site.fetch(doc.details.image_url, {
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363',
                                    },
                                    encoding: null,
                                })
                                    .then((res) => res.buffer())
                                    .then((buffer) => {
                                        //doc.details.image_url = "/images/torrent.png" //"/image/" + doc.guid
                                        doc.details.image_url = 'data:' + response.headers['content-type'] + ';base64,' + Buffer.from(buffer).toString('base64');
                                        doc.image_url = doc.details.image_url;
                                        res.render('posts/yts.html', doc, {
                                            parser: 'html css js',
                                        });
                                    });
                            } else if (req.hasFeature('browser.unknown')) {
                                doc.details.image_url = '/images/torrent.png'; //"/image/" + doc.guid
                                doc.image_url = doc.details.image_url;
                                res.render('posts/yts.html', doc, {
                                    parser: 'html css js',
                                });
                            } else {
                                res.render('posts/yts.html', doc, {
                                    parser: 'html css js',
                                });
                            }
                        } else if (doc.is_google_news) {
                            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '');
                            res.render('posts/google_news.html', doc, {
                                parser: 'html css js',
                            });
                        } else if (doc.is_series) {
                            doc.page_title2 = ' مسلسل ' + doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70);
                            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '');
                            doc.episode_count = doc.episode_list.length;
                            res.render('posts/series.html', doc, {
                                parser: 'html css js',
                            });
                        } else if (doc.is_movies) {
                            doc.page_title2 = ' فيلم ' + doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70);
                            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '');
                            res.render('posts/movie.html', doc, {
                                parser: 'html css js',
                            });
                        } else {
                            doc.post_type = 'full-post';
                            res.render('posts/post.html', doc, {
                                parser: 'html css js',
                            });
                        }
                    } else {
                        res.redirect('/');
                    }
                },
                true,
            );
        }
    });

    site.onGET({ name: ['/torrent/new'], public: true }, (req, res) => {
        let where = {};

        post.$posts_content.findAll(
            {
                select: {
                    guid: 1,
                    details: 1,
                },
                limit: 1,
                sort: {
                    id: -1,
                },
                where: {
                    is_yts: true,
                    show_count: { $exists: false },
                },
            },
            (err, docs) => {
                if (!err && docs && docs.length > 0) {
                    let doc = docs[0];
                    doc.show_count = doc.show_count || 0;
                    doc.show_count++;
                    post.$posts_content.update(doc);
                    res.redirect('/post2/' + doc.guid + '/' + encodeURI(doc.details.title));
                } else {
                    res.redirect('/torrent/random');
                }
            },
            true,
        );
    });

    site.onGET({ name: ['/torrent/random'], public: true }, (req, res) => {
        let where = {};

        post.$posts_content.findAll(
            {
                select: {
                    guid: 1,
                    details: 1,
                },
                limit: 20,
                sort: {
                    id: -1,
                },
                where: {
                    is_yts: true,
                },
            },
            (err, docs) => {
                if (!err && docs && docs.length > 0) {
                    let doc = docs[Math.floor(Math.random() * docs.length)];
                    res.redirect('/post2/' + doc.guid + '/' + encodeURI(doc.details.title));
                } else {
                    res.redirect('/');
                }
            },
            true,
        );
    });

    site.onGET({ name: ['/news/random'], public: true }, (req, res) => {
        let where = {};

        post.$posts_content.findAll(
            {
                select: {
                    guid: 1,
                    details: 1,
                },
                limit: 20,
                sort: {
                    id: -1,
                },
                where: {
                    is_google_news: true,
                },
            },
            (err, docs) => {
                if (!err && docs && docs.length > 0) {
                    let doc = docs[Math.floor(Math.random() * docs.length)];
                    res.redirect('/post2/' + doc.guid + '/' + encodeURI(doc.details.title));
                } else {
                    res.redirect('/');
                }
            },
            true,
        );
    });

    site.onPOST({ name: 'api/posts/get', public: true }, (req, res) => {
        let response = {
            done: false,
        };
        let where = {};
        where['id'] = req.data.id;
        post.$posts_content.find(
            where,
            (err, doc) => {
                if (!err && doc) {
                    response.done = true;
                    response.doc = doc;
                    res.json(response);
                } else {
                    response.error = err;
                    res.json(response);
                }
            },
            true,
        );
    });
    site.onPOST({ name: 'api/posts/delete', public: true }, (req, res) => {
        let response = {
            done: false,
        };
        let where = {};
        where['id'] = req.data.id;
        post.$posts_content.delete(where, (err, doc) => {
            if (!err && doc) {
                response.done = true;
                res.json(response);
            } else {
                response.error = err;
                res.json(response);
            }
        });
    });
    site.onPOST({ name: '/api/posts/update', public: true }, (req, res) => {
        let response = {
            done: false,
        };
        let where = {};
        where['id'] = req.data.id;

        post.$posts_content.update(req.data, (err, result) => {
            if (!err) {
                response.done = true;
                response.result = result;
                res.json(response);
            } else {
                response.error = err.message;
                res.json(response);
            }
        });
    });
    site.onPOST({ name: '/api/posts/add', public: true }, (req, res) => {
        let response = {};
        response.done = false;

        if (!req.session.user) {
            response.error = 'you are not login';
            res.json(response);
            return;
        }

        let _post = Object.assign(Object.assign({}, post.post_template), req.data);

        if (req && res) {
            _post.$req = req;
            _post.$res = res;
            _post._created = site.security.getUserFinger({
                $req: req,
                $res: res,
            });
        }

        post.get_post_author(
            {
                guid: site.md5(_post.author.name),
            },
            (err, new_author) => {
                if (!err && new_author) {
                    _post.author = new_author;
                    post.add_post_content(_post, (err, new_post) => {
                        if (!err) {
                            response.done = true;
                            response.doc = new_post;
                        } else {
                            response.error = err.message;
                        }
                        res.json(response);
                    });
                } else {
                    post.add_post_author(_post.author, (err, new_author) => {
                        if (!err && new_author) {
                            _post.author = new_author;
                            post.add_post_content(_post, (err, new_post) => {
                                if (!err) {
                                    response.done = true;
                                    response.doc = new_post;
                                } else {
                                    response.error = err.message;
                                }
                                res.json(response);
                            });
                        } else {
                            res.json(response);
                        }
                    });
                }
            },
        );
    });

    site.onPOST({ name: '/api/posts/all', public: true }, (req, res) => {
        let response = {};
        response.done = false;

        let where = {
            is_approved: true,
            is_porn: false,
            is_hidden: false,
        };
        let sort = {
            time: -1,
        };
        let skip = 0;

        let user_where = req.data.where || {};

        if (user_where.q && user_where.q != 'undefined') {
            where['text'] = new RegExp(user_where['q'], 'i');
        }

        if (user_where.last_time != undefined) {
            where.time = {
                $lt: user_where.last_time,
            };
        }

        if (user_where.is_approved != undefined) {
            where.is_approved = user_where.is_approved;
        }
        if (user_where.is_porn != undefined) {
            where.is_porn = user_where.is_porn;
        }
        if (user_where.is_children != undefined) {
            where.is_children = user_where.is_children;
        }
        if (req.hasFeature('host.videos') || user_where.is_video != undefined) {
            where.is_video = req.hasFeature('host.videos') || user_where.is_video;
        }
        if (user_where.is_hidden != undefined) {
            where.is_hidden = user_where.is_hidden;
        }
        if (req.hasFeature('host.rss') || user_where.is_rss != undefined) {
            where.is_rss = req.hasFeature('host.rss') || user_where.is_rss;
        }
        if (req.hasFeature('host.news') || req.hasFeature('host.news2') || user_where.is_google_news != undefined) {
            where.is_google_news = req.hasFeature('host.news') || req.hasFeature('host.news2') || user_where.is_google_news;
        }
        if (user_where.is_series != undefined) {
            where.is_series = user_where.is_series;
        }
        if (req.hasFeature('host.movies') || user_where.is_movies != undefined) {
            where.is_movies = req.hasFeature('host.movies') || user_where.is_movies;
        }
        if (user_where.author_guid != undefined) {
            where['author.guid'] = user_where.author_guid;
        }
        if (req.hasFeature('host.torrents') || req.hasFeature('host.yts') || user_where.is_yts != undefined) {
            sort = {
                'yts.year': -1,
            };
            where.is_yts = req.hasFeature('host.torrents') || req.hasFeature('host.yts') || user_where.is_yts;
            skip = (req.data.page_number || 0) * (req.data.limit || 20);
            delete where.time;
            if (user_where.sort && user_where.sort != 'undefined') {
                if (user_where.sort == 'rating') {
                    sort = {
                        'yts.rating': -1,
                    };
                } else if (user_where.sort == 'year') {
                    sort = {
                        'yts.year': -1,
                    };
                } else if (user_where.sort == 'time') {
                    sort = {
                        time: -1,
                    };
                }
            }
        }

        post.$posts_content.findMany(
            {
                select: req.body.select || {},
                limit: req.data.limit || 20,
                where: where,
                sort: sort,
                skip: skip,
            },
            (err, docs) => {
                if (!err) {
                    response.done = true;
                    response.list = docs;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
            true,
        );
    });

    site.onPOST({ name: '/api/posts/authors/add', public: true }, (req, res) => {
        // if (!req.session.user) {
        //   response.error = 'you are not login'
        //   res.json(response)
        //   return
        // }

        let response = {};
        response.done = false;

        let _post_author = req.data;

        if (req && res) {
            _post_author.$req = req;
            _post_author.$res = res;
            _post_author._created = site.security.getUserFinger({
                $req: req,
                $res: res,
            });
        }

        post.add_post_author(_post_author, (err, new_post_author) => {
            if (!err) {
                response.done = true;
            } else {
                response.error = err.message;
            }
            if (res) {
                res.json(response);
            }
        });
    });

    site.onPOST({ name: '/api/posts/categories/add', public: true }, (req, res) => {
        let response = {
            done: false,
        };

        if (!req.session.user) {
            response.error = 'you are not login';
            res.json(response);
            return;
        }

        let _post_category = req.data;

        if (req && res) {
            _post_category.$req = req;
            _post_category.$res = res;
            _post_category._created = site.security.getUserFinger({
                $req: req,
                $res: res,
            });
        }

        _post_category.date = _post_category.date || new Date();
        _post_category.time = _post_category.date.getTime();
        _post_category.guid = _post_category.guid || site.md5(_post_category.ar);

        post.$posts_categories.add(_post_category, (err, doc) => {
            if (!err) {
                response.done = true;
                response.doc = doc;
            }
            res.json(response);
        });
    });

    site.onPOST({ name: '/api/posts/categories/all', public: true }, (req, res) => {
        let response = {
            done: false,
        };

        post.$posts_categories.findMany(
            {
                is_show: true,
            },
            (err, docs) => {
                if (!err) {
                    response.done = true;
                    response.list = docs;
                }
                res.json(response);
            },
            true,
        );
    });
};
