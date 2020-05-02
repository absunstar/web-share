module.exports = function init(site) {

  const $posts_content = site.$posts_content = site.connectCollection("posts_content")
  const $posts_author = site.$posts_author = site.connectCollection("posts_author")
  const $posts_categories = site.$posts_categories = site.connectCollection("posts_categories")

  $posts_content.createUnique({
    guid: 1
  })
  $posts_author.createUnique({
    guid: 1
  })

  const post_template = require('./site_files/json/post.json')

  site.get({
    name: "/",
    path: __dirname + "/site_files"
  })

  site.get("/", (req, res) => {
    res.render("posts/index.html", {}, {
      parser: 'html css js'
    })
  })
  site.get(["/sitemap.xml"], (req, res) => {
    let where = {}
    if (req.params.guid) {
      where['guid'] = req.params.guid
    }
    $posts_content.findAll({
      where: where,
      sort: {
        id: -1
      },
      limit: 10000
    }, (err, docs) => {
      if (!err && docs) {
        let urls = ""
        docs.forEach((doc, i) => {
          doc.post_url = 'https://egytag.com' + '/post/' + doc.guid;
          urls += `
          <url>
              <loc>${doc.post_url}</loc>
              <lastmod>${new Date(doc.date).toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>.8</priority>
          </url>
          `
        })
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
                  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                  <url>
                  <loc>https://egytag.com/</loc>
                  <lastmod>${new Date().toISOString()}</lastmod>
                  <changefreq>always</changefreq>
                  <priority>1</priority>
              </url>
                     ${urls}
                  </urlset> 
                  `
        res.set('Content-Type', 'application/xml')
        res.end(xml)
      } else {
        res.end(404)
      }
    })
  })

  site.get(["/rss", "/rss/posts", "/rss/posts/:guid"], (req, res) => {
    let where = {}
    if (req.params.guid) {
      where['guid'] = req.params.guid
    }
    $posts_content.findAll({
      where: where,
      sort: {
        id: -1
      },
      limit: 100
    }, (err, docs) => {
      if (!err && docs) {
        let urls = ""
        docs.forEach((doc, i) => {
          doc.post_url = 'https://egytag.com' + '/post/' + doc.guid;
          doc.text = doc.text.replace(/<[^>]+>/g, '').replace(/&nbsp;|&laquo;|&raquo|&quot;|&rlm;|&llm;/g, '')
          urls += `
          <item>
            <title>${doc.details.title}</title>
            <link>${doc.post_url}</link>
            <description>${doc.text}</description>
            <date>${new Date(doc.date).toISOString()}</date>
          </item>
          `
        })
        let xml = `<?xml version="1.0" ?>
                    <rss version="2.0">
                      <channel>
                            <title>Egytag Global RSS</title>
                            <link>https://egytag.com</link>
                            <description>All Posts Rss Feeds</description>
                            ${urls}
                        </channel>
                     </rss>`
        res.set('Content-Type', 'application/xml')
        res.end(xml)
      } else {
        res.end(404)
      }
    })
  })

  site.get("/videos", (req, res) => {
    res.render("posts/videos.html", {
      page_title2: 'فيديوهات'
    }, {
      parser: 'html css js'
    })
  })

  site.get("/post/:guid", (req, res) => {
    let where = {}
    if (req.params.guid == 'random') {
      $posts_content.findAll({
        select: {
          guid: 1,
          details : 1
        },
        limit: 100,
        sort: {
          date: -1
        }
      }, (err, docs) => {
        if (!err && docs) {
          let doc = docs[Math.floor(Math.random() * docs.length)]
          res.redirect('/post/' + doc.guid+ '/'+ encodeURI(doc.details.title))
        } else {
          res.redirect('/')
        }

      })
    } else {
      where['guid'] = req.params.guid
      $posts_content.find(where, (err, doc) => {
        if (!err && doc) {
          doc.page_title2 = doc.details.title.replace(/<[^>]+>/g, '').substring(0, 70)
          doc.image_url = doc.details.image_url
          doc.page_description = doc.text.replace(/<[^>]+>/g, '')
          doc.post_url = req.headers.host + '/post/' + doc.guid
          doc.timeago = xtime(new Date().getTime() - new Date(doc.date).getTime());
          doc.page_keywords = doc.details.title.split(' ').join(',')
          if (doc.is_video) {
            doc.post_type = 'full-video'
          } else {
            doc.post_type = 'full-post'
          }
          res.render("posts/post.html", doc, {
            parser: 'html css js'
          })
        } else {
          res.redirect('/')
        }

      })
    }
  })


  function xtime(_time) {

    if (typeof (_time) == 'undefined' || !_time) {
      return " منذ قليل ";
    }

    var _type = null;

    var _time_2 = null;
    var _type_2 = null;

    var times = [1, 1000, 60, 60, 24, 30, 12];
    var times_type = ['x', 'ثانية', 'دقيقة', 'ساعة', 'يوم', 'شهر', 'سنة'];

    /*_time = (_time * 1000) - (2 * 60 * 60 * 1000 * 0);*/
    let offset = new Date().getTimezoneOffset();
    if (false && offset < 0) {
      let diff = (Math.abs(offset) * 60 * 1000)
      _time = _time + diff;
    }
    if (_time <= 10000) {
      return " منذ قليل ";
    }
    for (var i = 0; i < times.length; i++) {
      if (_time < times[i]) {

        break;
      } else {
        _type = times_type[i];
        if (i > 0) {
          _time_2 = _time % times[i];
          _type_2 = times_type[i - 1];
        }
        _time = _time / times[i];
      }
    }

    _time = Math.floor(_time);
    _time_2 = Math.floor(_time_2);

    if (_time_2 == 0 || _type_2 == null || _type_2 == 'x') {
      return [" منذ ", _time, _type].join(' ');
    } else {
      return [" منذ ", _time, _type, _time_2, _type_2].join(' ');
    }


  };

  function add_post_author(_post_author, callback) {
    callback = callback || function () {}

    _post_author.date = new Date()
    _post_author.time = _post_author.date.getTime()
    if (_post_author.is_rss) {
      _post_author.guid = site.md5(_post_author.rss_link)
    } else {
      _post_author.guid = _post_author.guid || site.md5(_post_author.name)
    }

    $posts_author.add(_post_author, (err, new_post_author) => {
      callback(err, new_post_author)
    })
  }

  function get_post_author(_post_author, callback) {
    callback = callback || function () {}

    $posts_author.get(_post_author, (err, new_post_author) => {
      callback(err, new_post_author)
    })
  }

  function add_post_content(_p, callback) {
    callback = callback || function () {}

    let _post = Object.assign(Object.assign({}, post_template), _p)

    _post.date = _post.date || new Date()
    _post.time = _post.date.getTime()
    _post.guid = _post.guid || site.md5(_post.text)

    $posts_content.add(_post, (err, new_post) => {
      callback(err, new_post)
    })
  }

  let rss_busy = false
  let rss_list = []

  function prepare_rss_list() {
    $posts_author.findMany({
      where: {
        is_rss: true,
        $or: [{
            last_feeds_update_time: {
              '$lt': Date.now() - (1000 * 60 * 5)
            }
          },
          {
            last_feeds_update_time: {
              $exists: false
            }
          }
        ]

      }
    }, (err, docs) => {
      if (!err && docs && docs.length > 0) {
        docs.forEach(doc => {
          rss_list.push(doc)
          doc.last_feeds_update_time = Date.now()
          $posts_author.update(doc)
        })
      }
    })
  }

  function update_rss_feed() {

    if (rss_list.length == 0) {
      prepare_rss_list()
      setTimeout(() => {
        update_rss_feed()
      }, 1000)
      return
    }

    let doc = rss_list.pop()

    if (doc.rss_link) {
      console.log('Request New RSS ' + doc.rss_link)
      site.request({
        url: doc.rss_link,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36'
        }
      }, function (error, response, body) {

        setTimeout(() => {
          update_rss_feed()
        }, 1000)

        if (!error && body) {

          const $ = site.$.load(body, {
            normalizeWhitespace: true,
            xmlMode: true
          })

          $('item').each(function (i, xmlItem) {
            let post = {}
            $(xmlItem).children().each(function (i, xmlItem) {
              post[$(this)[0].name] = $(this).text()
            })
            post.pubDate = post.pubDate || post.pubdate || post['dc:date']
            if (post.link) {
              add_post_content({
                guid: site.md5(post.link),
                author: doc,
                text: post.title + ' <br> ' + post.description,
                date: post.pubDate ? new Date(post.pubDate) : new Date(),
                details: {
                  url: post.link,
                  title: post.title
                },
                is_approved: true,
                is_rss: true
              }, (err, n) => {

              })
            }

          })

        }
      })
    }


  }

  update_rss_feed()

  site.post("/api/posts/add", (req, res) => {

    if (!req.session.user) {
      response.error = 'you are not login'
      res.json(response)
      return
    }

    let response = {}
    response.done = false

    let _post = Object.assign(Object.assign({}, post_template), req.data)

    if (req && res) {
      _post.$req = req
      _post.$res = res
      _post._created = site.security.getUserFinger({
        $req: req,
        $res: res
      })
    }

    get_post_author({
      guid: site.md5(_post.author.name)
    }, (err, new_author) => {
      if (!err && new_author) {
        _post.author = new_author
        add_post_content(_post, (err, new_post) => {
          if (!err) {
            response.done = true
            response.doc = new_post
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      } else {
        add_post_author(_post.author, (err, new_author) => {
          if (!err && new_author) {
            _post.author = new_author
            add_post_content(_post, (err, new_post) => {
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

    let user_where = req.data.where || {}

    if (user_where['text']) {
      where['text'] = new RegExp(where['text'], 'i')
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

    if (user_where.last_time != undefined) {
      where.time = {
        '$lt': user_where.last_time
      }
    }

    $posts_content.findMany({
      select: req.body.select || {},
      limit: req.body.limit || 20,
      where: where,
      sort: {
        time: -1
      }
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    })
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

    add_post_author(_post_author, (err, new_post_author) => {
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

    $posts_categories.add(_post_category, (err, doc) => {
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

    $posts_categories.findMany({
      is_show: true
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      }
      res.json(response)
    })

  })




  function json_to_xml(o, tab) {
    var toXml = function (v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
          for (var i = 0, n = v.length; i < n; i++)
            xml += ind + toXml(v[i], name, ind + "\t") + "\n";
        } else if (typeof (v) == "object") {
          var hasChild = false;
          xml += ind + "<" + name;
          for (var m in v) {
            if (m.charAt(0) == "@")
              xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
            else
              hasChild = true;
          }
          xml += hasChild ? ">" : "/>";
          if (hasChild) {
            for (var m in v) {
              if (m == "#text")
                xml += v[m];
              else if (m == "#cdata")
                xml += "<![CDATA[" + v[m] + "]]>";
              else if (m.charAt(0) != "@")
                xml += toXml(v[m], m, ind + "\t");
            }
            xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
          }
        } else {
          xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
        }
        return xml;
      },
      xml = "";
    for (var m in o)
      xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
  };

}