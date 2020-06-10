module.exports = function init(site , post) {

    let rss_busy = false
    let rss_list = []

    site.get(["/sitemap.xml"], (req, res) => {
        let where = {}
        if (req.params.guid) {
          where['guid'] = req.params.guid
        }
        post.$posts_content.findAll({
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
        if (req.query.is_rss == "true") {
          where['is_rss'] = true
        }
        if (req.query.is_video == "true") {
          where['is_video'] = true
        }
        if (req.query.is_youtube == "true") {
          where['is_youtube'] = true
        }
        if (req.query.is_children == "true") {
          where['is_children'] = true
        }
        if (req.query.is_yts == "true") {
          where['is_yts'] = true
        }
    
        if (req.params.guid == 'random') {
          post.$posts_content.findAll({
            where: where,
            select: {
              guid: 1,
              details: 1
            },
            limit: 100,
            sort: {
              date: -1
            }
          }, (err, docs) => {
            if (!err && docs && docs.length > 0) {
              let doc = docs[Math.floor(Math.random() * docs.length)]
              res.redirect('/rss/posts/' + doc.guid)
            } else {
              res.redirect('/rss/posts/random?limit=1')
            }
    
          })
        } else {
    
          if (req.params.guid) {
            where['guid'] = req.params.guid
          }
          post.$posts_content.findAll({
            where: where,
            sort: {
              id: -1
            },
            limit: req.query.limit || 10
          }, (err, docs) => {
            if (!err && docs) {
    
              let urls = ""
              docs.forEach((doc, i) => {
                doc.post_url = 'https://egytag.com' + '/post/' + doc.guid;
                if (typeof doc.text != "string") {
                  doc.text = "No Title"
                }
                doc.text = doc.text.replace(/<[^>]+>/g, '').replace(/&nbsp;|&laquo;|&raquo|&quot;|&rlm;|&llm;|&lrm;|&rrm;/g, '')
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
              res.end(402)
            }
          })
        }
    
    
    
    
      })

      post.prepare_rss_list = function() {
        post.$posts_author.findMany({
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
              post.$posts_author.update(doc)
            })
          }
        })
      }
    
      post.update_rss_feed = function() {
    
        if (rss_list.length == 0) {
          post.prepare_rss_list()
          setTimeout(() => {
            post.update_rss_feed()
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
              post.update_rss_feed()
            }, 1000)
    
            if (!error && body) {
    
              const $ = site.$.load(body, {
                normalizeWhitespace: true,
                xmlMode: true
              })
    
              $('item').each(function (i, xmlItem) {
                let _post = {}
                $(xmlItem).children().each(function (i, xmlItem) {
                  _post[$(this)[0].name] = $(this).text()
                })
                _post.pubDate = _post.pubDate || _post.pubdate || _post['dc:date']
                if (_post.link) {
                  post.add_post_content({
                    guid: site.md5(_post.link),
                    author: doc,
                    text: _post.title + ' <br> ' + _post.description,
                    date: _post.pubDate ? new Date(_post.pubDate) : new Date(),
                    details: {
                      url: _post.link,
                      title: _post.title
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
    
      post.json_to_xml = function(o, tab) {
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
      }

      //post.update_rss_feed()
}