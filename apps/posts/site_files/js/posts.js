var busy = false;
var last_posts = [];

function scope() {
    return angular.element(document.getElementById('main-layout')).scope();
};

const spider_server = 'http://127.0.0.1:60080';

const post_where = {
    is_video: document.location.href.like('*video*') ? true : null,
    is_approved: '##req.query.is_approved##' == 'false' ? false : true,
    is_porn: '##req.query.is_porn##' == 'true' ? true : false,
    is_hidden: '##req.query.is_hidden##' == 'true' ? true : false,
    is_children: '##req.query.is_children##' == 'true' ? true : null,
    is_rss: '##req.query.is_rss##' == 'true' ? true : null,
};

let posts_limit = 20;
if (document.location.href.like('*video*')) {
    posts_limit = 40;
}


function loadPosts(more) {

    if (busy) {
        return;
    }

    if (typeof (Mustache) == 'undefined') {
        return;
    }

    if (busy) return;
    busy = true;
    $('.posts-loading').remove();
    $('#posts').append('<p class="posts-loading"> <img src="/images/loading.gif"> ##word.posts_load_more## </p>');

    busy = true;
    if (more) {
        post_where.last_time = last_posts.length > 0 ? last_posts[last_posts.length - 1].time : null;
    }
    site.postData({
        url: '/api/posts/all',
        method: 'POST',
        data: {
            where: post_where,
            limit: posts_limit
        }
    }, function (res) {

        if (res.done && res.list.length == 0) {
            busy = true;
        } else {
            busy = false;
        }


        if (!res.done || res.list.length == 0) return;

        var rendered = '';
        var post_template = $('#post-template').html();
        var video_template = $('#video-template').html();
        var ad_template = $('#ad-template').html();

        Mustache.parse(post_template);
        last_posts = res.list;
        for (var i = 0; i < last_posts.length; i++) {
            try {
                var post = last_posts[i];
                
                post.timeago = xtime(new Date().getTime() - new Date(post.date).getTime());
                post.post_url = document.location.origin + '/post/' + post.guid + '/'+ encodeURI(post.details.title.split(' ').join('-'));
                post.text = post.is_rss ? post.text : xlinks(post.text);
                if (post.is_rss) {
                    post.text = post.text + ` <a target="_blank" rel="nofollow" href="${post.details.url}"> ##word.posts_read_more## </a> `;
                }
                if(post.is_video){
                    rendered += Mustache.render(video_template, post);

                }else{
                    rendered += Mustache.render(post_template, post);
                }
               
            } catch (error) {

            }
        }

        $('#posts').append('<span class="line"></span><span class="line"></span><span class="line"></span>');
        rendered += `
                        <div>
                        <!-- Post Ad-->
                        <ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article"
                            data-ad-format="fluid" data-ad-client="ca-pub-3372007384613151"
                            data-ad-slot="5838870332"></ins>
                        </div>
                    `
        $('#posts').append('<span class="line"></span><span class="line"></span><span class="line"></span>');
        $('#posts').append(rendered);

        busy = false;
        $('.posts-loading').remove();
        (adsbygoogle = window.adsbygoogle || []).push({});
    });


};

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
    if(false && offset < 0){
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


function xlinks(str) {
    if (typeof str !== "string") {
        return '';
    }
    let urlRegex = /(https?:\/\/[^\s]+)|((www)\.\S+)/g;
    str = str.replace(urlRegex, function (url) {
        return ` <a target="_blank" rel="nofollow" href="${url}">${url}</a> `;
    });

    str = str.replace('\n', '<br>');
    return str;
};

function urlify(text) {
    let data = {
        text: text,
        url_list: []
    };
    let urlRegex = /(https?:\/\/[^\s]+)/g;
    text.replace(urlRegex, function (url) {
        data.url_list.push(url);
        return '<a href="' + url + '">' + url + '</a>';
    })
    return data;
};

function newPost() {
    scope().newPost();
};

function newAuthor() {
    scope().newAuthor();
};

function get_page_info(url, callback) {
    site.postData({
        url: spider_server + '/api/page-info-spider',
        method: 'POST',
        data: {
            url: url
        }
    }, (res) => {

        callback(res);
    });
};

function get_page_urls(op, callback) {
    site.postData({
        url: spider_server + '/api/page-urls-spider',
        method: 'POST',
        data: op
    }, (res) => {
        callback(res);
    });
};

function generateAuthorData(link) {
    let $scope = scope();
    link = link || $scope.author.link;
    $scope.author_busy = true;
    $scope.$apply();
    get_page_info(link, (res) => {
        $scope.author = Object.assign($scope.author, {
            link: res.url,
            logo_url: res.image_url,
            name: res.title,
            description: res.description
        });
        $scope.author_busy = false;
        $scope.$apply();
    })
};

var one_post = one_post || false;

if(!one_post){
    loadPosts();
}


window.onscroll = function () {
    if(one_post){
        return;
    }

    var y = document.documentElement.offsetHeight;
    var yy = window.pageYOffset + window.innerHeight;

    if (y - 2000 <= yy) {
        loadPosts(true);
    }
};

var rss = null;

