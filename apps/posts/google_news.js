module.exports = function init(site , post) {

    const google_news = {
        apiKey: "6aed1811909d48a0bb0924328fd41d8c"
    }

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

        let _post = Object.assign(Object.assign({}, post.post_template), {})
        _post.is_approved = true
        _post.author = {name : "أهم الاخبار" , logo_url : "/images/rss.png"}
        _post.text = _article.title
        _post.date = _article.publishedAt ? new Date(_article.publishedAt) : new Date()
        _post.details = {
            title : _article.title,
            url : _article.url,
            image_url : _article.urlToImage,
            description : _article.description
        }
        _post.article = _article
        _post.is_google_news = true

        post.get_post_author({
            guid: site.md5(_post.author.name)
        }, (err, new_author) => {
            if (!err && new_author) {
                _post.author = new_author
                post.add_post_content(_post, (err, new_post) => {
                    if(!err && new_post){
                        console.log('New Google News Post Added ' + new_post.id)
                    }
                })
            } else {
                post.add_post_author(_post.author, (err, new_author) => {
                    if (!err && new_author) {
                        _post.author = new_author
                        post.add_post_content(_post, (err, new_post) => {
                            if(!err && new_post){
                                console.log('New Google News Post Added '+ new_post.id)
                            }
                        })
                    }
                })
            }
        })
    }

    google_news.load = function (params) {
        console.log('Google New Auto Load')
        site.request.get(`http://newsapi.org/v2/top-headlines?apiKey=${google_news.apiKey}&${params}`, function (error, response, body) {
            if (typeof body == "string") {
                body = JSON.parse(body)
            }

            if (body.status == "ok" && body.totalResults > 0) {
                body.articles.forEach(article => {
                    google_news.add_article(article)
                })
            }
        })

       
    }

    google_news.auto_load = function(){

        google_news.load("language=ar")
        google_news.load("country=eg")

        setTimeout(() => {
            google_news.auto_load()
        }, 1000 * 60 * 15);
    }

    google_news.auto_load()
    return google_news

}