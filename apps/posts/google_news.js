module.exports = function init(site, post) {
  const google_news = {
    apiKey: '6aed1811909d48a0bb0924328fd41d8c',
    callback: function (err, data) {
      console.log(err || null);
    },
  };

  site.onGET('/api/post/google-news/auto-load', (req, res) => {
    google_news.auto_load();
    res.json({ done: true });
  });
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
        true
      );
    }
  });

  google_news.handlePostContent = function (_post, callback) {
    callback = callback || google_news.callback;
    _post.tracking = '';
    if (_post.hasContent) {
      _post.tracking += ' -hasContent ';
      callback(
        { message: '\nPost Content Exists\n' },
        {
          url: _post.details.url,
          guid: _post.guid,
          hasContent: _post.hasContent || false,
          tracking: _post.tracking,
        }
      );
      return;
    }

    if ((page = site.get_scrapingList().find((s) => _post.details.url.like(s.url)))) {
      _post.tracking += ' -page ';
      _post.$selector = page.selector;
      _post.$needBrowser = page.needBrowser;
      _post.$selectAll = page.selectAll;
      _post.$allowRegx = page.allowRegx;
      _post.$regx = page.regx;
      _post.$allowFilter = page.allowFilter;
      _post.$startFilter = page.startFilter;
      _post.$endFilter = page.endFilter;
    }

    if (_post.$needBrowser) {
      _post.tracking += ' -needBrowser ';
      callback(
        { message: '\nPost Need Browser\n' },
        {
          url: _post.details.url,
          guid: _post.guid,
          needBrowser: _post.$needBrowser || false,
          hasContent: _post.hasContent || false,
          tracking: _post.tracking,
        }
      );
      post.$posts_content.update(_post);
      return;
    }

    site
      .fetch(_post.details.url, {
        mode: 'cors',
        method: 'get',
        headers: {
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.${Date.now()} Safari/537.36`,
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
        _post.tracking += ' -fetch ';
        let $ = site.$.load(text);
        if (!_post.details.image_url) {
          if ((img = $('meta[property="og:image"]'))) {
            _post.details.image_url = img.attr('content');
            _post.tracking += ' -og:image ';
          }
        }

        if (_post.details.url.like('*youtube.com*')) {
          _post.tracking += ' -youtube ';
          let videoID = _post.details.url.split('=').pop();
          _post.hasContent = true;
          _post.content = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoID}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
          post.$posts_content.update(_post, (err, result) => {
            console.log(err || 'Post Content Set as youtube');
          });

          callback(null, {
            done: true,
            hasContent: _post.hasContent || false,
            content: _post.content,
            needBrowser: _post.$needBrowser || !_post.hasContent,
            url: _post.details.url,
            selector: _post.$selector,
            guid: _post.guid,
            tracking: _post.tracking,
          });

          return;
        }

        if ((page = site.get_scrapingList().find((s) => _post.details.url.like(s.url)))) {
          _post.tracking += ' -page2 ';
          _post.$selector = page.selector;
          _post.$selectImage = page.selectImage;
          _post.$needBrowser = page.needBrowser;
          _post.$selectAll = page.selectAll;
          _post.$allowRegx = page.allowRegx;
          _post.$regx = page.regx;
          _post.$allowFilter = page.allowFilter;
          _post.$startFilter = page.startFilter;
          _post.$endFilter = page.endFilter;

          if (!_post.$allowRegx && !_post.$selector) {
            callback(
              { message: '\nPost Selector and allowRegx Not Sets\n' },
              {
                needBrowser: true,
                url: _post.details.url,
                guid: _post.guid,
                tracking: _post.tracking,
              }
            );
            return;
          }

          if (!!_post.details.image_url && _post.$selectImage) {
            if ((img = $(_post.$selectImage))) {
              _post.details.image_url = img.attr('src');
              _post.tracking += ' -selectImage ';
            }
          }
          if (_post.$allowRegx) {
            _post.fullText = $.html();
            var match = _post.fullText.match(_post.$regx);
            if (match) {
              match.forEach((m) => {
                _post.content += m;
              });
            }
          } else if (_post.$allowFilter) {
            _post.fullText = $.html();
            _post.content = _post.fullText.split(_post.$startFilter)[1].split(_post.$endFilter)[0];
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
            post.$posts_content.update(_post, (err, result) => {
              console.log(err || 'Post Content Set');
            });
          }
        }

        callback(null, {
          done: true,
          hasContent: _post.hasContent || false,
          content: _post.content,
          needBrowser: _post.needBrowser || !_post.hasContent,
          url: _post.details.url,
          selector: _post.$selector,
          guid: _post.guid,
          tracking: _post.tracking,
        });
      })
      .catch((err) => {
        callback(err, {
          url: _post.details.url,
          guid: _post.guid,
          needBrowser: true,
          tracking: _post.tracking,
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

    let _post = { ...post.post_template };
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
      }
    );
  };

  google_news.load = function (api, params) {
    site
      .fetch(`http://newsapi.org/v2/${api}?apiKey=${google_news.apiKey}&${params}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
      })
      .then((res) => res.json())
      .then((body) => {
        if (body.status == 'ok' && body.articles) {
          body.articles.forEach((article) => {
            google_news.add_article(article);
          });
        } else {
          console.log(body);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  google_news.auto_load = function () {
    google_news.load('top-headlines', 'language=ar');
    setTimeout(() => {
      google_news.load('top-headlines', 'country=eg&category=business');
    }, 1000 * 60 * 10);
    setTimeout(() => {
      google_news.load('top-headlines', 'country=eg&category=entertainment');
    }, 1000 * 60 * 20);
    setTimeout(() => {
      google_news.load('top-headlines', 'country=eg&category=general');
    }, 1000 * 60 * 30);
    setTimeout(() => {
      google_news.load('top-headlines', 'country=eg&category=health');
    }, 1000 * 60 * 40);
    setTimeout(() => {
      google_news.load('top-headlines', 'country=eg&category=science');
    }, 1000 * 60 * 50);
    setTimeout(() => {
      google_news.load('top-headlines', 'country=eg&category=sports');
    }, 1000 * 60 * 60);
    setTimeout(() => {
      google_news.load('top-headlines', 'country=eg&category=technology');
    }, 1000 * 60 * 70);

    setTimeout(() => {
      google_news.auto_load();
    }, 1000 * 60 * 80);
  };

  google_news.auto_load();

  return google_news;
};
