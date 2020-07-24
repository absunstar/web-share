module.exports = function init(site) {


  const post = require(__dirname + '/post.js')(site)
  require(__dirname + '/rss.js')(site, post)
  require(__dirname + '/facebook.js')(site, post)
  require(__dirname + '/google_news.js')(site , post)

  site.get({
    name: "/css/posts.css",
    path: [
      __dirname + "/site_files/css/custom.css",
      __dirname + "/site_files/css/post.css",
      __dirname + "/site_files/css/post-type.css",
      __dirname + "/site_files/css/post-category.css",
      __dirname + "/site_files/css/site-news.css",
      __dirname + "/site_files/css/video.css",
      __dirname + "/site_files/css/yts.css",
      __dirname + "/site_files/css/google-news.css",
      __dirname + "/site_files/css/series.css",
      __dirname + "/site_files/css/movies.css",
      __dirname + "/site_files/css/share-buttons.css"
    ]
  })

  post.image_list = []
  site.get('/image/:guid', (req, res) => {
    if (post.image_list[req.params.guid]) {
      site.request({
        url: post.image_list[req.params.guid],
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363'
        },
        encoding: null
      }, (err, resp, buffer) => {
        res.set("Content-Type", "image/png")
        res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
        res.end(buffer)
      })
      //res.redirect(post.image_list[req.params.guid])
      return
    } else {
      $posts_content.find({
        where: {
          guid: req.params.guid
        },
        select: {
          details: 1
        }
      }, (err, doc) => {
        if (!err && doc && doc.details && doc.details.image_url) {
          let url = doc.details.image_url
          post.image_list[req.params.guid] = url
          site.request({
            url,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.18363'
            },
            encoding: null
          }, (err, resp, buffer) => {
            res.set("Content-Type", "image/png")
            res.set("Cache-Control", "public, max-age=" + 60 * site.options.cache.images)
            res.end(buffer)
          })
          //res.redirect(post.image_list[req.params.guid])
        } else {
          res.end(402)
        }
      })
    }


  })

  site.get({
    name: "/",
    path: __dirname + "/site_files"
  })

  site.get("/", (req, res) => {
    res.render("posts/index.html", {}, {
      parser: 'html css js'
    })
  })
  site.get("/show-video", (req, res) => {
    res.render("posts/show-video.html", {
      page_title2: 'مشاهدة فيديو'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/akwam", (req, res) => {
    res.render("posts/akwam.html", {
      page_title2: 'أكوام'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/search", (req, res) => {
    res.render("posts/index.html", {
      page_title2: '  بحث  | ' + req.query.q
    }, {
      parser: 'html css js'
    })
  })
  site.get("/children-videos", (req, res) => {
    req.features.push('hide-menu')
    res.render("posts/index.html", {
      page_title2: 'فيديوهات للأطفال'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/videos", (req, res) => {
    req.features.push('hide-menu')
    res.render("posts/index.html", {
      page_title2: 'فيديوهات'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/author/:guid/:title", (req, res) => {
    res.render("posts/index.html", {
      page_title2: decodeURIComponent(req.params.title)
    }, {
      parser: 'html css js'
    })
  })
  site.get("/torrents", (req, res) => {
    req.features.push('hide-menu')
    req.features.push('torrents')
    res.render("posts/index.html", {
      page_title2: 'torrents movies - أفلام تورينت'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/series", (req, res) => {
    req.features.push('hide-menu')
    req.features.push('series')
    res.render("posts/index.html", {
      page_title2: 'Series - مسلسلات'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/movies", (req, res) => {
    req.features.push('hide-menu')
    req.features.push('movies')
    res.render("posts/index.html", {
      page_title2: 'Movies - أفلام'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/top-news", (req, res) => {
    req.features.push('hide-menu')
    res.render("posts/index.html", {
      page_title2: 'Latest News - أهم الأخبار'
    }, {
      parser: 'html css js'
    })
  })
  site.get("/post/:guid", (req, res) => {
    let where = {}
    if (req.params.guid == 'random') {
      post.$posts_content.findAll({
        select: {
          guid: 1,
          details: 1
        },
        limit: 100,
        sort: {
          date: -1
        }
      }, (err, docs) => {
        if (!err && docs) {
          let doc = docs[Math.floor(Math.random() * docs.length)]
          res.redirect('/post/' + doc.guid + '/' + encodeURI(doc.details.title))
        } else {
          res.redirect('/')
        }

      } , true)
    } else {
      where['guid'] = req.params.guid
      post.$posts_content.find(where, (err, doc) => {
        if (!err && doc) {
          doc.page_title2 = doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70)
          doc.image_url = doc.details.image_url
          doc.page_description = doc.text.replace(/<[^>]+>/g, '')
          doc.post_url = req.headers.host + '/post/' + doc.guid+ '/'+ encodeURI(doc.details.title.split(' ').join('-'));
          doc.author_url = '/author/' + doc.author.guid+ '/'+ encodeURI(doc.author.name.split(' ').join('-'));
          doc.timeago = post.xtime(new Date().getTime() - new Date(doc.date).getTime());
          doc.page_keywords = doc.details.title.split(' ').join(',')
          doc.details.description = doc.details.description || ""
          if (doc.is_video) {
            doc.post_type = 'full-video'
            if (doc.details.url.like('https://www.youtube.com/watch*')) {
              doc.details.url = 'https://www.youtube.com/embed/' + doc.details.url.split('=')[1].split('&')[0]
            }
            res.render("posts/video.html", doc, {
              parser: 'html css js'
            })
          } else if (doc.is_yts) {
            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '')
            if (req.hasFeature('browser.unknown')) {
              doc.details.image_url = "/images/torrent.png" //"/image/" + doc.guid
              doc.image_url = doc.details.image_url
            }
            res.render("posts/yts.html", doc, {
              parser: 'html css js'
            })
          } else if (doc.is_google_news) {
            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '')
            res.render("posts/google_news.html", doc, {
              parser: 'html css js'
            })
          } else if (doc.is_series) {
            doc.page_title2 = ' مسلسل ' + doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70)
            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '')
            doc.episode_count = doc.episode_list.length
            res.render("posts/series.html", doc, {
              parser: 'html css js'
            })
          } else if (doc.is_movies) {
            doc.page_title2 = ' فيلم ' + doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70)
            doc.page_description = doc.details.description.replace(/<[^>]+>/g, '')
            res.render("posts/movie.html", doc, {
              parser: 'html css js'
            })
          } else {
            doc.post_type = 'full-post'
            res.render("posts/post.html", doc, {
              parser: 'html css js'
            })
          }

        } else {
          res.redirect('/')
        }

      } , true)
    }
  })

  site.post("api/posts/get", (req, res) => {
    let response = {
      done: false
    }
    let where = {}
    where['id'] = req.data.id
    post.$posts_content.find(where, (err, doc) => {
      if (!err && doc) {
        response.done = true
        response.doc = doc
        res.json(response)
      } else {
        response.error = err
        res.json(response);
      }
    } , true)

  })
  site.post("api/posts/delete", (req, res) => {
    let response = {
      done: false
    }
    let where = {}
    where['id'] = req.data.id
    post.$posts_content.delete(where, (err, doc) => {
      if (!err && doc) {
        response.done = true
        res.json(response)
      } else {
        response.error = err
        res.json(response);
      }
    })

  })
  site.post("/api/posts/update", (req, res) => {
    let response = {
      done: false
    }
    let where = {}
    where['id'] = req.data.id

    post.$posts_content.update(req.data, (err, result) => {
      if (!err) {
        response.done = true
        response.result = result
        res.json(response)
      } else {
        response.error = err.message
        res.json(response);
      }
    })

  })
  site.post("/api/posts/add", (req, res) => {

    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'you are not login'
      res.json(response)
      return
    }



    let _post = Object.assign(Object.assign({}, post.post_template), req.data)

    if (req && res) {
      _post.$req = req
      _post.$res = res
      _post._created = site.security.getUserFinger({
        $req: req,
        $res: res
      })
    }

    post.get_post_author({
      guid: site.md5(_post.author.name)
    }, (err, new_author) => {
      if (!err && new_author) {
        _post.author = new_author
        post.add_post_content(_post, (err, new_post) => {
          if (!err) {
            response.done = true
            response.doc = new_post
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      } else {
        post.add_post_author(_post.author, (err, new_author) => {
          if (!err && new_author) {
            _post.author = new_author
            post.add_post_content(_post, (err, new_post) => {
              if (!err) {
                response.done = true
                response.doc = new_post
              } else {
                response.error = err.message
              }
              res.json(response)
            })
          } else {
            res.json(response)
          }
        })
      }
    })

  })

  site.post("/api/posts/all", (req, res) => {
    let response = {}
    response.done = false

    let where = {
      is_approved: true,
      is_porn: false,
      is_hidden: false
    }
    let sort = {
      time: -1
    }
    let skip = 0

    let user_where = req.data.where || {}

    if (user_where.q != undefined && user_where.q != "undefined") {
      where['text'] = new RegExp(user_where['q'], 'i')
    }

    if (user_where.last_time != undefined) {
      where.time = {
        '$lt': user_where.last_time
      }
    }

    if (user_where.is_approved != undefined) {
      where.is_approved = user_where.is_approved
    }
    if (user_where.is_porn != undefined) {
      where.is_porn = user_where.is_porn
    }
    if (user_where.is_children != undefined) {
      where.is_children = user_where.is_children
    }
    if (user_where.is_video != undefined) {
      where.is_video = user_where.is_video
    }
    if (user_where.is_hidden != undefined) {
      where.is_hidden = user_where.is_hidden
    }
    if (user_where.is_rss != undefined) {
      where.is_rss = user_where.is_rss
    }
    if (user_where.is_google_news != undefined) {
      where.is_google_news = user_where.is_google_news
    }
    if (user_where.is_series != undefined) {
      where.is_series = user_where.is_series
    }
    if (user_where.is_movies != undefined) {
      where.is_movies = user_where.is_movies
    }
    if (user_where.author_guid != undefined) {
      where['author.guid'] = user_where.author_guid
    }
    if (user_where.is_yts != undefined) {
      sort = {
        'yts.year': -1
      }
      where.is_yts = user_where.is_yts
      skip = (req.data.page_number || 0) * (req.data.limit || 20)
      delete where.time
      if (user_where.sort != undefined) {
        if (user_where.sort == "rating") {
          sort = {
            'yts.rating': -1
          }
        } else if (user_where.sort == "year") {
          sort = {
            'yts.year': -1
          }
        } else if (user_where.sort == "time") {
          sort = {
            'time': -1
          }
        }
      }
    }

    post.$posts_content.findMany({
      select: req.body.select || {},
      limit: req.data.limit || 20,
      where: where,
      sort: sort,
      skip: skip
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    } , true)
  })

  site.post("/api/posts/authors/add", (req, res) => {


    // if (!req.session.user) {
    //   response.error = 'you are not login'
    //   res.json(response)
    //   return
    // }


    let response = {}
    response.done = false

    let _post_author = req.data

    if (req && res) {
      _post_author.$req = req
      _post_author.$res = res
      _post_author._created = site.security.getUserFinger({
        $req: req,
        $res: res
      })
    }

    post.add_post_author(_post_author, (err, new_post_author) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      if (res) {
        res.json(response)
      }
    })

  })

  site.post("/api/posts/categories/add", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'you are not login'
      res.json(response)
      return
    }

    let _post_category = req.data

    if (req && res) {
      _post_category.$req = req
      _post_category.$res = res
      _post_category._created = site.security.getUserFinger({
        $req: req,
        $res: res
      })
    }

    _post_category.date = _post_category.date || new Date()
    _post_category.time = _post_category.date.getTime()
    _post_category.guid = _post_category.guid || site.md5(_post_category.ar)

    post.$posts_categories.add(_post_category, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      }
      res.json(response)
    })

  })


  site.post("/api/posts/categories/all", (req, res) => {

    let response = {
      done: false
    }

    post.$posts_categories.findMany({
      is_show: true
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      }
      res.json(response)
    } , true)

  })



}