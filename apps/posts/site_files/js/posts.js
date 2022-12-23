var busy = false;
var last_posts = [];

function scope() {
  return angular.element(document.getElementById('main-layout')).scope();
}

var my_post_content_where = {
  author_guid: document.location.href.like('*author*') ? '##req.params.guid##' : null,
  is_video: document.location.href.like('*videos*') ? true : null,
  is_children: document.location.href.like('*children-videos*') ? true : null,
  is_yts: document.location.href.like('*torrents*') ? true : null,
  is_series: document.location.href.like('*series*') ? true : null,
  is_movies: document.location.href.like('*movies*') ? true : null,
  is_google_news: document.location.href.like('*top-news*') ? true : null,
  is_approved: '##req.query.is_approved##' == 'false' ? false : true,
  is_porn: '##req.query.is_porn##' == 'true' ? true : false,
  is_hidden: '##req.query.is_hidden##' == 'true' ? true : false,
  is_rss: '##req.query.is_rss##' == 'true' ? true : null,
  q: '##req.query.q##',
  sort: '##req.query.sort##',
};

var posts_limit = 20;
if (document.location.href.like('*videos*')) {
  posts_limit = 40;
}

var page_number = 0;
function loadPosts(more) {
  if (busy) {
    return;
  }

  busy = true;
  $('.posts-loading').remove();
  $('.no-data').remove();
  $('#posts').append('<p class="posts-loading"> <img src="/images/loading.gif"> ##word.posts_load_more## </p>');

  if (more) {
    my_post_content_where.last_time = last_posts.length > 0 ? last_posts[last_posts.length - 1].time : null;
  }

  site.postData(
    {
      url: '/api/posts/all',
      method: 'POST',
      data: {
        where: my_post_content_where,
        limit: posts_limit,
        page_number: page_number,
      },
    },
    function (res) {
      if (res.done && res.list.length == 0) {
        $('#posts').append('<p class="no-data"> <br><br>  ##word.no_data## <br><br> </p> ');
        $('.posts-loading').remove();
        setTimeout(() => {
          busy = true;
        }, 1000 * 3);

        return;
      }

      if (!res.done || res.list.length == 0) return;

      page_number++;
      var rendered = '<div class="posts">';

      last_posts = res.list;
      for (var i = 0; i < last_posts.length; i++) {
        try {
          var post = last_posts[i];

          post.timeago = xtime(new Date().getTime() - new Date(post.date).getTime());

          post.details.title = post.details.title || '';
          post.details.image_url = post.details.image_url || '/images/no.png';
          post.post_url = document.location.origin + '/post/' + post.guid + '/' + encodeURI(post.details.title.split(' ').join('-'));
          post.author_url = document.location.origin + '/author/' + post.author.guid + '/' + encodeURI(post.author.name.split(' ').join('-'));
          post.text = post.is_rss ? post.text : xlinks(post.text);
          post.banner = '/images/banner720p.png';
          if (post.is_rss) {
            post.text = post.text + ` <a target="_blank" rel="nofollow" href="${post.details.url}"> ##word.posts_read_more## </a> `;
          }
          if (post.is_video) {
            rendered += site.render('#video-template', post);
          } else if (post.yts) {
            post.yts.torrents.forEach((torrent) => {
              if (torrent.quality == '1080p') {
                post.banner = '/images/banner1080p.png';
              }
            });
            rendered += site.render('#yts-template', post);
          } else if (post.is_google_news) {
            rendered += site.render('#google-news-template', post);
          } else if (post.is_series) {
            post.episode_count = post.episode_list.length;
            rendered += site.render('#series-template', post);
          } else if (post.is_movies) {
            rendered += site.render('#movie-template', post);
          } else {
            rendered += site.render('#google-news-template', post);
          }
        } catch (error) {
          console.error(error);
        }
      }
      let placeholder_number = 108;
      if (page_number == 2) {
        placeholder_number = 109;
      } else if (page_number == 3) {
        placeholder_number = 110;
      } else if (page_number > 3) {
        placeholder_number = 111;
      }
      if (window.allowGoogleAds) {
        rendered += `
                          <div class="post-google-ads">
                          <br><br><br>
                          <!-- Post Ad-->
                            <ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article"
                                data-ad-format="fluid" data-ad-client="ca-pub-3372007384613151"
                                data-ad-slot="5838870332">
                            </ins>
                          <br><br><br>
                        </div>
                         
                      `;
      }
      rendered+='</div>'
      $('#posts').append(rendered);
      $('.posts-loading').remove();

      if (window.allowGoogleAds) {
        (adsbygoogle = window.adsbygoogle || []).push({});
      }
      setTimeout(() => {
        busy = false;
      }, 1000 * 5);
    },
    (err) => {
      console.log(err);
      setTimeout(() => {
        busy = false;
        loadPosts(more);
      }, 1000 * 5);
    }
  );
}

function xtime(_time) {
  if (typeof _time == 'undefined' || !_time) {
    return ' منذ قليل ';
  }

  let _type = null;

  let _time_2 = null;
  let _type_2 = null;

  let times = [1, 1000, 60, 60, 24, 30, 12];
  let times_type = ['x', 'ثانية', 'دقيقة', 'ساعة', 'يوم', 'شهر', 'سنة'];

  let offset = new Date().getTimezoneOffset();
  if (false && offset < 0) {
    let diff = Math.abs(offset) * 60 * 1000;
    _time = _time + diff;
  }

  if (_time <= 10000) {
    return ' منذ قليل ';
  }

  for (let i = 0; i < times.length; i++) {
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
    return [' منذ ', _time, _type].join(' ');
  } else {
    return [' منذ ', _time, _type, _time_2, _type_2].join(' ');
  }
}

function xlinks(str) {
  if (typeof str !== 'string') {
    return '';
  }
  let urlRegex = /(https?:\/\/[^\s]+)|((www)\.\S+)/g;
  str = str.replace(urlRegex, function (url) {
    return ` <a target="_blank" rel="nofollow" href="${url}">${url}</a> `;
  });

  str = str.replace('\n', '<br>');
  return str;
}

function urlify(text) {
  let data = {
    text: text,
    url_list: [],
  };
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  text.replace(urlRegex, function (url) {
    data.url_list.push(url);
    return '<a href="' + url + '">' + url + '</a>';
  });
  return data;
}

function newPost() {
  scope().newPost();
}

function newAuthor() {
  scope().newAuthor();
}

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
      description: res.description,
    });
    $scope.author_busy = false;
    $scope.$apply();
  });
}

function remove_post(_post, callback) {
  site.postData(
    {
      method: 'POST',
      url: '/api/posts/delete',
      data: _post,
    },
    (res) => {
      console.log(res);
    },
    (err) => {
      console.log(err);
    }
  );
}
function handle_post(_post) {
  $('#btn_handle').hide();
  document.querySelector('#btn_handle_loading').style.display = 'block';
  site.postData(
    {
      method: 'POST',
      url: '/api/post/google-news/handle',
      data: _post,
    },
    (res) => {
      document.querySelector('#btn_handle_loading').style.display = 'none';
      if (res.content) {
        $('.post-content').html(res.content);
        $('.post-content').show();
      } else if (res.needBrowser) {
        window.open(res.url);
      } else if (res.html) {
        $('.post-content').html(res.html);
      } else {
        window.open(res.url);
      }
    },
    (err) => {
      console.log(err);
    }
  );
}
window.stop_loading_posts = window.stop_loading_posts || false;

if (!window.stop_loading_posts) {
  loadPosts();
}

function isViewable(element) {
  const rect = element.getBoundingClientRect();
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

window.onscroll = function () {
  if (window.stop_loading_posts) {
    return;
  }

  var y = document.documentElement.offsetHeight;
  var yy = window.pageYOffset + window.innerHeight;

  if (y - 7000 <= yy) {
    loadPosts(true);
  }
};

var rss = null;
