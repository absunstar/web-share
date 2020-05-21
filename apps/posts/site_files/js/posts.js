var busy = false;
var last_posts = [];

function scope() {
    return angular.element(document.getElementById('main-layout')).scope();
};


const post_where = {
    is_video: document.location.href.like('*videos*') ? true : null,
    is_children: document.location.href.like('*children-videos*') ? true : null,
    is_yts: document.location.href.like('*torrents*') ? true : null,
    is_google_news: document.location.href.like('*top-news*') ? true : null,
    is_approved: '##req.query.is_approved##' == 'false' ? false : true,
    is_porn: '##req.query.is_porn##' == 'true' ? true : false,
    is_hidden: '##req.query.is_hidden##' == 'true' ? true : false,
    is_rss: '##req.query.is_rss##' == 'true' ? true : null,
    q: '##req.query.q##',
    sort: '##req.query.sort##',
};

let posts_limit = 20;
if (document.location.href.like('*videos*')) {
    posts_limit = 40;
}

let page_number = 0;
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
            limit: posts_limit,
            page_number: page_number
        }
    }, function (res) {

        if (res.done && res.list.length == 0) {
            $('#posts').append('<br><br> <p class="no-data">##word.no_data##</p> <br><br>');
            $('.posts-loading').remove();
            busy = true;
            return;
        } else {
            busy = false;
        }


        if (!res.done || res.list.length == 0) return;

        page_number++;
        var rendered = '';
        var post_template = $('#post-template').html();
        var video_template = $('#video-template').html();
        var yts_template = $('#yts-template').html();
        var ad_template = $('#ad-template').html();
        var google_news_template = $('#google-news-template').html();
        
        Mustache.parse(post_template);
        last_posts = res.list;
        for (var i = 0; i < last_posts.length; i++) {
            try {
                var post = last_posts[i];
                
                post.timeago = xtime(new Date().getTime() - new Date(post.date).getTime());
                post.post_url = document.location.origin + '/post/' + post.guid + '/'+ encodeURI(post.details.title.split(' ').join('-'));
                post.text = post.is_rss ? post.text : xlinks(post.text);
                post.banner ='/images/banner720p.png'
                if (post.is_rss) {
                    post.text = post.text + ` <a target="_blank" rel="nofollow" href="${post.details.url}"> ##word.posts_read_more## </a> `;
                }
                if(post.is_video){
                    rendered += Mustache.render(video_template, post);

                }else if(post.yts){
                   post.yts.torrents.forEach(torrent => {
                       if(torrent.quality == '1080p'){
                        post.banner ='/images/banner1080p.png'
                       }
                   });
                    rendered += Mustache.render(yts_template, post);

                }else if(post.is_google_news){
                     rendered += Mustache.render(google_news_template, post);
                 }else{
                    rendered += Mustache.render(post_template, post);
                }
                
            } catch (error) {
                console.log(error)
            }
        }

        $('#posts').append('<br><br><br>');
        rendered += `
                        <div>
                        <!-- Post Ad-->
                        <ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article"
                            data-ad-format="fluid" data-ad-client="ca-pub-3372007384613151"
                            data-ad-slot="5838870332"></ins>
                        </div>
                    `
        $('#posts').append('<br><br><br>');
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

function generateAuthorData(link) {
    let $scope = scope();
    link = link || $scope.author.link;
    $scope.author_busy = true;
    $scope.$apply();
    spider.get_page_info(link, (res) => {
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

