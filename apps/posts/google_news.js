module.exports = function init(site, post) {
    const google_news = {
        apiKey: '6aed1811909d48a0bb0924328fd41d8c',
    };

    site.onPOST('/api/post/google-news/handle', (req, res) => {
        let guid = req.data.guid;
        let _post = site.activePostList.find((p) => p.guid == guid);
        if (_post) {
            _post.$memory = true;
            google_news.handlePostContent(_post, (err, data) => {
                res.json({
                    error: err ? err.message : null,
                    ...data,
                });
            });
        } else {
            let where = {};
            where['guid'] = guid;
            post.$posts_content.find(
                where,
                (err, doc) => {
                    if (!err && doc) {
                        google_news.handlePostContent(doc, (err, data) => {
                            res.json({
                                error: err ? err.message : null,
                                ...data,
                            });
                        });
                    }
                },
                true,
            );
        }
    });

    google_news.handlePostContent = function (_post, callback) {
        callback =
            callback ||
            function (err, data) {
                console.log(err || data);
            };
        if (_post.hasContent || _post.needBrowser) {
            callback(
                { message: '\nPost Content Exists or Need Browser\n' },
                {
                    url: _post.details.url,
                    guid: _post.guid,
                    needBrowser: _post.needBrowser || false,
                },
            );
            return;
        }

        post.siteList.forEach((site) => {
            if (_post.details.url.like(site.url)) {
                _post.$selector = site.selector;
                _post.needBrowser = site.needBrowser;
                _post.$selectAll = site.selectAll;
                _post.$filter = site.filter;
            }
        });

        if (_post.needBrowser) {
            callback(
                { message: '\nPost Need Browser\n' },
                {
                    url: _post.details.url,
                    guid: _post.guid,
                    needBrowser: _post.needBrowser || false,
                },
            );
            post.$posts_content.update(_post);
            return;
        }

        site.fetch(_post.details.url, {
            mode: 'cors',
            method: 'get',
            headers: {
                'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.${Date.now()} Safari/537.36`,
            },
            redirect: 'follow',
            agent: function (_parsedURL) {
                if (_parsedURL.protocol == 'http:') {
                    return new site.http.Agent({
                        keepAlive: true,
                    });
                } else {
                    return new site.https.Agent({
                        keepAlive: true,
                    });
                }
            },
        })
            .then((res) => {
                _post.details.url = res.url;
                return res.text();
            })
            .then((text) => {
                if (!_post.$selector) {
                    post.siteList.forEach((site) => {
                        if (_post.details.url.like(site.url)) {
                            _post.$selector = site.selector;
                            _post.needBrowser = site.needBrowser;
                            _post.$selectAll = site.selectAll;
                            _post.$filter = site.filter;
                        }
                    });
                }
                if (!_post.$selector) {
                    callback(
                        { message: '\nPost Selector Not Exists\n' },
                        {
                            needBrowser: true,
                            url: _post.details.url,
                            guid: _post.guid,
                        },
                    );
                    return;
                }
                let $ = site.$.load(text);
                if (_post.$filter) {
                    _post.fullText = $.html(); // Buffer.from(text, 'utf-8').toString()
                    _post.content = _post.fullText.split(_post.$filter.start)[1].split(_post.$filter.end)[0];
                } else {
                    if (_post.$selectAll) {
                        $(_post.$selector).each((p) => {
                            _post.content += $(p).text();
                        });
                    } else {
                        _post.content = $(_post.$selector).text();
                    }
                }

                if (_post.content) {
                    _post.hasContent = true;
                    post.$posts_content.update(_post);
                }

                callback(null, {
                    done: true,
                    hasContent: _post.hasContent || false,
                    needBrowser: _post.needBrowser || !_post.hasContent,
                    url: _post.details.url,
                    selector: _post.$selector,
                    guid: _post.guid,
                });
            })
            .catch((err) => {
                callback(err, {
                    url: _post.details.url,
                    guid: _post.guid,
                    needBrowser : true
                });
            });
    };

    google_news.add_article = function (_article) {
        // {
        //     "source": {
        //         "id": "argaam",
        //         "name": "Argaam"
        //     },
        //     "author": "Argaam",
        //     "title": "مصادر لرويترز: الصندوق السيادي السعودي يسعى لطرح عام أولي لشركته \"علم\"",
        //     "description": "قالت ثلاثة مصادر مطلعة لرويترز إن صندوق الاستثمارات العامة السعودي، وهو الصندوق السيادي للثروة بالمملكة، يدرس طرحا عاما أوليا لشركته (علم) لأمن المعلو",
        //     "url": "http://www.argaam.com/ar/article/articledetail/id/1376711",
        //     "urlToImage": "https://www.argaam.com/content/ar/images/argaam-plus-ar.jpg",
        //     "publishedAt": "2020-05-18T12:00:00Z",
        //     "content": null
        // },

        let _post = Object.assign(Object.assign({}, post.post_template), {});
        _post.is_approved = true;
        _post.author = { name: 'أهم الاخبار', logo_url: '/images/rss.png' };
        _post.text = _article.title;
        _post.date = _article.publishedAt ? new Date(_article.publishedAt) : new Date();
        _post.details = {
            title: _article.title,
            url: _article.url,
            image_url: _article.urlToImage,
            description: _article.description,
        };
        _post.article = _article;
        _post.is_google_news = true;

        post.get_post_author(
            {
                guid: site.md5(_post.author.name),
            },
            (err, new_author) => {
                if (!err && new_author) {
                    _post.author = new_author;
                    post.add_post_content(_post, (err, new_post) => {
                        if (!err && new_post) {
                            console.log('New Google News Post Added ' + new_post.id);
                            google_news.handlePostContent(new_post);
                        }
                    });
                } else {
                    post.add_post_author(_post.author, (err, new_author) => {
                        if (!err && new_author) {
                            _post.author = new_author;
                            post.add_post_content(_post, (err, new_post) => {
                                if (!err && new_post) {
                                    console.log('New Google News Post Added ' + new_post.id);
                                    google_news.handlePostContent(new_post);
                                }
                            });
                        }
                    });
                }
            },
        );
    };

    google_news.load = function (api, params) {
        console.log('Google New Auto Load');
        site.fetch(`http://newsapi.org/v2/${api}?apiKey=${google_news.apiKey}&${params}`, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' },
        })
            .then((res) => res.json())
            .then((body) => {
                if (body.status == 'ok' && body.totalResults > 0) {
                    body.articles.forEach((article) => {
                        google_news.add_article(article);
                    });
                }
            })
            .catch((err) => {
                // console.error(err)
            });
    };

    google_news.auto_load = function () {
        google_news.load('top-headlines', 'language=ar');
        google_news.load('top-headlines', 'country=eg&category=business');
        google_news.load('top-headlines', 'country=eg&category=entertainment');
        google_news.load('top-headlines', 'country=eg&category=general');
        google_news.load('top-headlines', 'country=eg&category=health');
        google_news.load('top-headlines', 'country=eg&category=science');
        google_news.load('top-headlines', 'country=eg&category=sports');
        google_news.load('top-headlines', 'country=eg&category=technology');

    };

 

    return google_news;
};
