module.exports = function init(site) {
  const post = require(__dirname + '/post.js')(site);
  require(__dirname + '/vars.js')(site, post);
  require(__dirname + '/rss.js')(site, post);
  require(__dirname + '/facebook.js')(site, post);
  require(__dirname + '/google_news.js')(site, post);

  site.activePostList = [];

  site.pageData = {
    siteNews: require(__dirname + '/site_files/json/site-news.json'),
    PostTypes: require(__dirname + '/site_files/json/post-types.json'),
  };

  function preparePots(type) {
    let where = {
      is_approved: true,
      is_porn: false,
      is_hidden: false,
    };
    let sort = { time: -1 };
    if (type == 'is_yts') {
      where['is_yts'] = true;
    } else if (type == 'is_google_news') {
      where['is_google_news'] = true;
    } else if (type == 'is_movies') {
      where['is_movies'] = true;
    } else if (type == 'is_series') {
      where['is_series'] = true;
    } else if (type == 'is_rss') {
      where['is_rss'] = true;
    } else if (type == 'is_children') {
      where['is_children'] = true;
      where['is_video'] = true;
    }

    post.$posts_content.findMany(
      {
        select: {
          id: 1,
          guid: 1,
          text: 1,
          author: 1,
          details: 1,
          date: 1,
          hasContent: 1,
          yts: 1,
          article: 1,
          is_google_news: 1,
          is_yts: 1,
          is_movies: 1,
          is_series: 1,
          is_rss: 1,
          is_children: 1,
        },
        limit: 1000,
        where: where,
        sort: sort,
      },
      (err, docs) => {
        if (!err && docs) {
          docs.forEach((doc) => {
            site.activePostList.push(handlePost(doc));
          });

          site.activePostList = site.activePostList.sort((a, b) => a.time > b.time);

          if (type === 'is_yts') {
            site.pageData.ytsList = site.activePostList.filter((p) => p.is_yts).slice(-5);
          } else if (type === 'is_google_news') {
            site.pageData.newsList = site.activePostList
              .filter((p) => p.is_google_news)
              .slice(-5)
              .filter((g) => !!g.text);
          } else if (type === 'is_children') {
            site.pageData.childrenList = site.activePostList.filter((p) => p.is_children).slice(-5);
          }
        }
      },
      false
    );
  }

  function prepareAllPosts() {
    preparePots('all');
    preparePots('is_google_news');
    preparePots('is_yts');
    preparePots('is_movies');
    preparePots('is_series');
    preparePots('is_rss');
    preparePots('is_children');

    setTimeout(() => {
      prepareAllPosts();
    }, 1000 * 60 * 15);
  }

  prepareAllPosts();
  function escapeHtml(unsafe) {
    return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function handlePost(doc) {
    if (doc.$handled) {
      return doc;
    }
    doc.$handled = true;
    doc.details.title = escapeHtml(doc.details.title);
    doc.page_title2 = doc.details.title.substring(0, 70);
    doc.image_url = doc.image_url || doc.details.image_url || '/images/no.png';
    doc.page_description = escapeHtml(doc.text);
    doc.post_url = '/post/' + doc.guid + '/' + encodeURI(doc.details.title.split(' ').join('-'));
    doc.author_url = '/author/' + doc.author.guid + '/' + encodeURI(doc.author.name.split(' ').join('-'));
    doc.timeago = post.xtime(new Date().getTime() - new Date(doc.date).getTime());
    doc.page_keywords = doc.details.title.split(' ').join(',');
    doc.details.description = doc.details.description || '';
    if (doc.is_video) {
      doc.post_type = 'full-video';
      if (doc.details.url.like('https://www.youtube.com/watch*')) {
        doc.details.url = 'https://www.youtube.com/embed/' + doc.details.url.split('=')[1].split('&')[0];
      }
    } else if (doc.is_yts) {
      doc.page_description = escapeHtml(doc.details.description);
      doc.banner = '/images/banner720p.png';
      doc.yts.torrents.forEach((torrent) => {
        if (torrent.quality == '1080p') {
          doc.banner = '/images/banner1080p.png';
        }
      });
    } else if (doc.is_google_news) {
      doc.page_description = escapeHtml(doc.details.description);
    } else if (doc.is_series) {
      doc.page_title2 = ' مسلسل ' + doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70);
      doc.page_description = escapeHtml(doc.details.description);
      doc.episode_count = doc.episode_list.length;
    } else if (doc.is_movies) {
      doc.page_title2 = ' فيلم ' + doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70);
      doc.page_description = escapeHtml(doc.details.description);
    } else {
      doc.post_type = 'full-post';
    }
    return doc;
  }

  site.onGET('/api/page-data', (req, res) => {
    res.json({
      done: true,
      data: site.pageData,
    });
  });

  site.onGET({
    name: '/css/posts.css',
    public: true,
    parser: null,
    path: [
      'client-side/theme_paper.css',
      'client-side/layout.css',
      'client-side/scrollbar.css',
      'client-side/progress.css',
      'client-side/treeview.css',
      'client-side/main-menu.css',
      'client-side/images.css',
      'client-side/navbar.css',
      'client-side/form.css',
      'client-side/btn.css',
      'client-side/selector.css',
      'client-side/checkbox.css',
      'client-side/radio.css',
      'client-side/modal.css',
      'client-side/fixed_menu.css',
      'client-side/color.css',
      'client-side/fonts.css',
      'client-side/font-droid.css',
      'client-side/effect.css',
      'client-side/table.css',
      'client-side/tabs.css',
      'client-side/help.css',
      'client-side/print.css',
      'client-side/ui.css',
      'client-side/tableExport.css',
      'client-side/font-awesome.css',
      site.dir + '/css/custom.css',
      'posts/custom.css',
      'posts/post.css',
      'posts/post-type.css',
      'posts/post-category.css',
      'posts/site-news.css',
      'posts/video.css',
      'posts/yts.css',
      'posts/google-news.css',
      'posts/series.css',
      'posts/movies.css',
      'posts/share-buttons.css',
    ],
  });

  post.image_list = [];
  site.onGET('/image/:guid', (req, res) => {
    if (post.image_list[req.params.guid]) {
      site
        .fetch(post.image_list[req.params.guid], {
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
            site
              .fetch(url, {
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
        }
      );
    }
  });

  site.onGET({
    name: '/',
    path: __dirname + '/site_files',
    public: true,
  });

  site.onGET({ name: '/', public: true }, (req, res) => {
    if (req.hasFeature('host.videos')) {
      site.callRoute('/videos', req, res);
    } else if (req.hasFeature('host.news')) {
      req.addFeature('hide-right-menu');
      req.addFeature('hide-left-menu');
      req.data.content_class = 'col10';
      site.callRoute('/posts', req, res);
    } else if (req.hasFeature('host.torrents')) {
      req.addFeature('torrents');
      req.addFeature('hide-right-menu');
      req.addFeature('hide-left-menu');
      req.data.content_class = 'col10';
      site.callRoute('/posts', req, res);
    } else if (req.hasFeature('host.media')) {
      req.addFeature('hide-right-menu');
      req.addFeature('hide-left-menu');
      req.data.content_class = 'col12';
      site.callRoute('/posts', req, res);
    } else {
      req.addFeature('google-ads');
      site.callRoute('/posts', req, res);
    }
  });

  site.onGET({ name: '/posts', public: true }, (req, res) => {
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
      }
    );
  });

  site.onGET({ name: '/torrents', public: true }, (req, res) => {
    req.addFeature('torrents');
    if (req.hasFeature('host.torrents')) {
      req.addFeature('hide-right-menu');
      req.addFeature('hide-left-menu');
      req.data.content_class = 'col10';
    } else if (req.hasFeature('host.news')) {
    } else if (req.hasFeature('host.media')) {
      req.addFeature('hide-right-menu');
      req.addFeature('hide-left-menu');
      req.data.content_class = 'col12';
    } else {
      req.addFeature('google-ads');
    }

    req.data.page_title2 = 'torrents movies - أفلام تورينت';
    site.callRoute('/posts', req, res);
  });

  site.onGET({ name: ['/post/:guid', '/post2/:guid'], public: true }, (req, res) => {
    if (req.params.guid == 'random') {
      if (site.activePostList && site.activePostList.length > 0) {
        let doc = site.activePostList[Math.floor(Math.random() * site.activePostList.length)];
        res.redirect('/post2/' + doc.guid + '/' + encodeURI(doc.details.title));
      } else {
        res.redirect('/');
      }
    } else {
      if (req.hasFeature('host.news')) {
        req.addFeature('hide-left-menu');
        req.addFeature('hide-right-menu');
        req.data.content_class = 'col10';
      } else if (req.hasFeature('host.torrents')) {
        req.addFeature('hide-left-menu');
        req.addFeature('hide-right-menu');
        req.data.content_class = 'col10';
      } else if (req.hasFeature('host.media')) {
        req.addFeature('hide-left-menu');
        req.addFeature('hide-right-menu');
        req.data.content_class = 'col12';
      } else {
        req.addFeature('google-ads');
        req.addFeature('host.all');
      }

      let _post = site.activePostList.find((p) => p.guid == req.params.guid);
      if (_post) {
        _post.$memory = true;
        responsePost(_post, res, req);
      } else {
        let where = {};
        where['guid'] = req.params.guid;
        post.$posts_content.find(
          where,
          (err, doc) => {
            if (!err && doc) {
              doc = handlePost(doc);
              site.activePostList.push(doc);
              responsePost(doc, res, req);
            } else {
              res.redirect('/');
            }
          },
          true
        );
      }
    }
  });

  site.onGET({ name: ['/torrent/random'], public: true }, (req, res) => {
    if ((list = site.activePostList.filter((p) => p.is_yts))) {
      let doc = list[Math.floor(Math.random() * list.length)];
      res.redirect('/post2/' + doc.guid + '/' + encodeURI(doc.details.title));
    } else {
      res.redirect('/');
    }
  });

  site.onGET({ name: ['/news/random'], public: true }, (req, res) => {
    if ((list = site.activePostList.filter((p) => p.is_google_news))) {
      let doc = list[Math.floor(Math.random() * list.length)];
      res.redirect('/post2/' + doc.guid + '/' + encodeURI(doc.details.title));
    } else {
      res.redirect('/');
    }
  });

  site.onGET({ name: '/youtube-view', public: true }, (req, res) => {
    req.queryRaw.videoid = req.queryRaw.videoid || '_Y8gawCe7mU';
    req.addFeature('host.default');

    res.render(
      'posts/youtube_view.html',
      { page_title: 'Show Youtube Video ', page_title2: req.queryRaw.videoid, page_description: 'Dynamic Youtube Video Playing in egytag.com' },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/page-view', public: true }, (req, res) => {
    req.addFeature('host.default');

    res.render(
      'posts/page_view.html',
      {},
      {
        parser: 'html css js',
      }
    );
  });

  site.onGET({ name: '/show-video', public: true }, (req, res) => {
    req.addFeature('host.default');

    res.render(
      'posts/show-video.html',
      {
        page_title2: 'مشاهدة فيديو',
      },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/akwam', public: true }, (req, res) => {
    req.addFeature('host.default');

    res.render(
      'posts/akwam.html',
      {
        page_title2: 'أكوام',
      },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/search', public: true }, (req, res) => {
    req.addFeature('host.default');

    res.render(
      'posts/index.html',
      {
        page_title2: '  بحث  | ' + req.query.q,
      },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/children-videos', public: true }, (req, res) => {
    req.addFeature('host.default');
    res.render(
      'posts/index.html',
      {
        page_title2: 'فيديوهات للأطفال',
      },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/videos', public: true }, (req, res) => {
    req.addFeature('hide-left-menu');
    req.addFeature('hide-right-menu');
    req.data.content_class = 'col12';
    req.addFeature('host.default');

    res.render(
      'posts/index.html',
      {
        page_title2: 'فيديوهات',
      },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/author/:guid/:title', public: true }, (req, res) => {
    req.addFeature('host.default');

    res.render(
      'posts/index.html',
      {
        page_title2: decodeURIComponent(req.params.title),
      },
      {
        parser: 'html css js',
      }
    );
  });

  site.onGET({ name: '/series', public: true }, (req, res) => {
    req.addFeature('host.default');
    req.addFeature('series');

    res.render(
      'posts/index.html',
      {
        page_title2: 'Series - مسلسلات',
      },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/movies', public: true }, (req, res) => {
    req.addFeature('host.default');
    req.addFeature('movies');
    res.render(
      'posts/index.html',
      {
        page_title2: 'Movies - أفلام',
      },
      {
        parser: 'html css js',
      }
    );
  });
  site.onGET({ name: '/top-news', public: true }, (req, res) => {
    req.addFeature('host.default');
    req.addFeature('google-ads');
    res.render(
      'posts/index.html',
      {
        page_title2: 'Latest News - أهم الأخبار',
      },
      {
        parser: 'html css js',
      }
    );
  });

  site.onGET({ name: ['/api/html-post'], public: true }, (req, res) => {
    res.is_blogger = true;
    let _post = site.activePostList.find((p) => p.guid == req.query.guid);
    if (_post) {
      _post.$memory = true;
      responsePost(_post, res, req);
    } else {
      let where = {};
      where['guid'] = req.query.guid;
      post.$posts_content.find(
        where,
        (err, doc) => {
          if (!err && doc) {
            doc = handlePost(doc);
            site.activePostList.push(doc);
            responsePost(doc, res, req);
          } else {
            res.redirect('/');
          }
        },
        true
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
      true
    );
  });

  site.onPOST({ name: 'api/posts/get', public: true }, (req, res) => {
    let response = {
      done: false,
    };
    if ((doc = site.activePostList.filter((p) => p.id == req.data.id))) {
      response.done = true;
      response.doc = doc;
      res.json(response);
    } else {
      let where = {};
      where['id'] = req.data.id;
      post.$posts_content.find(
        where,
        (err, doc) => {
          if (!err && doc) {
            doc = site.handlePost(doc);
            site.activePostList.push(doc);
            response.done = true;
            response.doc = doc;
            res.json(response);
          } else {
            response.error = err;
            res.json(response);
          }
        },
        true
      );
    }
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
        if ((index = site.activePostList.findIndex((p) => p.id == req.data.id))) {
          if (index > -1) {
            site.activePostList.splice(index, 1);
          }
        }
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
        if ((index = site.activePostList.findIndex((p) => p.id == req.data.id))) {
          if (result.doc && index > -1) {
            site.activePostList[index] = result.doc;
          }
        }
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

    let _post = { ...post.post_template, ...req.data };
    _post._created = req.getUserFinger();

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
              response.id = new_post.id;
              response.doc = site.handlePost(new_post);
              site.activePostList.push(response.doc);
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
                  response.id = new_post.id;
                  response.doc = site.handlePost(new_post);
                  site.activePostList.push(response.doc);
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
      }
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
    if (req.hasFeature('host.torrents2') || user_where.is_movies != undefined) {
      where.is_movies = req.hasFeature('host.torrents2') || user_where.is_movies;
    }
    if (user_where.author_guid != undefined) {
      where['author.guid'] = user_where.author_guid;
    }
    if (req.hasFeature('host.torrents') || req.hasFeature('host.yts') || user_where.is_yts) {
      delete where.is_movies;
      delete where.is_series;
      delete where.is_rss;
      delete where.is_google_news;
      delete where.is_video;
      sort = {
        'yts.year': -1,
      };
      where.is_yts = true;
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

    let start = (req.data.page_number || 0) * (req.data.limit || 0);
    let end = start + (req.data.limit || 0);

    let type = 'all';
    if (user_where.is_yts) {
      type = 'is_yts';
    } else if (user_where.is_google_news) {
      type = 'is_google_news';
    } else if (user_where.is_movies) {
      type = 'is_movies';
    } else if (user_where.is_rss) {
      type = 'is_rss';
    } else if (user_where.is_children) {
      type = 'is_children';
      delete user_where.is_video;
    } else if (user_where.is_series) {
      type = 'is_series';
    }
    if (
      !where['author.guid'] &&
      site.activePostList.length > end &&
      (user_where.sort == 'undefined' || user_where.sort == 'time') &&
      user_where.q == 'undefined' &&
      user_where.is_approved &&
      !user_where.is_video &&
      !user_where.author_guid &&
      !user_where.is_hidden &&
      !user_where.is_porn
    ) {
      response.done = true;
      response.memory = true;
      if (where.is_yts) {
        response.list = site.activePostList.filter((p) => p.is_yts).slice(start, end);
      } else if (where.is_google_news) {
        response.list = site.activePostList.filter((p) => p.is_google_news).slice(start, end);
      } else {
        response.list = site.activePostList.slice(start, end);
      }
      res.json(response);
    } else {
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
            response.where = where;
            response.list = docs;
          } else {
            response.error = err.message;
          }
          res.json(response);
        },
        true
      );
    }
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
      true
    );
  });

  function responsePost(doc, res, req, callback) {
    req.data.page_title = doc.page_title || site.word('page_title').ar;
    req.data.page_title2 = doc.page_title2 || site.word('page_title2').ar;
    req.data.page_description = doc.page_description || site.word('page_description').ar;
    req.data.page_keywords = doc.page_keywords || site.word('page_keywords').ar;
    req.data.image_url = doc.image_url || '/images/logo.png';

    req.data.h1 = req.data.page_title;

    if (doc.post_url.startsWith('/post')) {
      doc.post_url = req.headers.host + doc.post_url;
    }
    if (res.is_blogger) {
      res.render(
        'posts/blogger-yts.html',
        {
          ...req.data,
          doc: doc,
          siteNews: site.pageData.siteNews,
          PostTypes: site.pageData.PostTypes,
          ytsList: site.pageData.ytsList,
          newsList: site.pageData.newsList,
          childrenList: site.pageData.childrenList,
        },
        {
          parser: 'html css js',
        }
      );
    } else if (doc.is_video) {
      res.render(
        'posts/video.html',
        {
          ...req.data,
          doc: doc,
          siteNews: site.pageData.siteNews,
          PostTypes: site.pageData.PostTypes,
          ytsList: site.pageData.ytsList,
          newsList: site.pageData.newsList,
          childrenList: site.pageData.childrenList,
        },
        {
          parser: 'html css js',
        }
      );
    } else if (doc.is_yts) {
      req.addFeature('yts-post');
      res.render(
        'posts/yts.html',
        {
          ...req.data,
          doc: doc,
          siteNews: site.pageData.siteNews,
          PostTypes: site.pageData.PostTypes,
          ytsList: site.pageData.ytsList,
          newsList: site.pageData.newsList,
          childrenList: site.pageData.childrenList,
        },
        {
          parser: 'html css js',
        }
      );
    } else if (doc.is_google_news) {
      req.addFeature('news-post');

      res.render(
        'posts/google_news.html',
        {
          ...req.data,
          doc: doc,
          siteNews: site.pageData.siteNews,
          PostTypes: site.pageData.PostTypes,
          ytsList: site.pageData.ytsList,
          newsList: site.pageData.newsList,
          childrenList: site.pageData.childrenList,
        },
        {
          parser: 'html css js',
        }
      );
    } else if (doc.is_series) {
      res.render(
        'posts/series.html',
        {
          ...req.data,
          doc: doc,
          siteNews: site.pageData.siteNews,
          PostTypes: site.pageData.PostTypes,
          ytsList: site.pageData.ytsList,
          newsList: site.pageData.newsList,
          childrenList: site.pageData.childrenList,
        },
        {
          parser: 'html css js',
        }
      );
    } else if (doc.is_movies) {
      res.render(
        'posts/movie.html',
        {
          ...req.data,
          doc: doc,
          siteNews: site.pageData.siteNews,
          PostTypes: site.pageData.PostTypes,
          ytsList: site.pageData.ytsList,
          newsList: site.pageData.newsList,
          childrenList: site.pageData.childrenList,
        },
        {
          parser: 'html css js',
        }
      );
    } else {
      res.render(
        'posts/post.html',
        {
          ...req.data,
          doc: doc,
          siteNews: site.pageData.siteNews,
          PostTypes: site.pageData.PostTypes,
          ytsList: site.pageData.ytsList,
          newsList: site.pageData.newsList,
          childrenList: site.pageData.childrenList,
        },
        {
          parser: 'html css js',
        }
      );
    }
  }
};
