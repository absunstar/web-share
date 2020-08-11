module.exports = function init(site) {

    const post = {}

    post.$posts_content = site.$posts_content = site.connectCollection("posts_content")
    post.$posts_author = site.$posts_author = site.connectCollection("posts_author")
    post.$posts_categories = site.$posts_categories = site.connectCollection("posts_categories")
    post.post_template = require('./site_files/json/post.json')


    post.$posts_content.createUnique({
        guid: 1
    })

    post.$posts_author.createUnique({
        guid: 1
    })


    post.xtime = function (_time) {

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
                /*check this */
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

    post.add_post_author = function (_post_author, callback) {
        callback = callback || function () {}

        _post_author.date = new Date()
        _post_author.time = _post_author.date.getTime()
        if (_post_author.is_rss) {
            _post_author.guid = site.md5(_post_author.rss_link)
        } else {
            _post_author.guid = _post_author.guid || site.md5(_post_author.name)
        }

        post.$posts_author.add(_post_author, (err, new_post_author) => {
            callback(err, new_post_author)
        })
    }

    post.get_post_author = function (_post_author, callback) {
        callback = callback || function () {}

        post.$posts_author.get(_post_author, (err, new_post_author) => {
            callback(err, new_post_author)
        })
    }

    post.add_post_content = function (_p, callback) {
        callback = callback || function () {}

        let _post = Object.assign(Object.assign({}, post.post_template), _p)

        _post.date = _post.date || new Date()
        _post.time = _post.date.getTime()
        _post.guid = _post.guid || site.md5(_post.text)

        post.$posts_content.add(_post, (err, new_post) => {
            callback(err, new_post)
        })
    }



    return post
}