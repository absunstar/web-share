app.controller("posts", function ($scope, $http, $sce) {

  $scope.allow = allow();
  $scope.post = {};
  $scope.newPosts = [];
  $scope.author = {};
  $scope.categories = [];

  $scope.playVideo = function (video, event) {
    event.preventDefault();
    $('#videoPlayer').html(`<iframe src="${video.youtube_url}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
  };

  $scope.newURL = function () {
    $scope.error = '';
    $scope.url = {
      text: '',
      match: '',
      is_video: true,
      is_porn: false,
      is_children: false,
      is_approved: true,
      is_hidden: false,
      is_deleted: false
    };
    site.showModal('#newURLModal');
    $('#new_url').focus();
  };

  $scope.newPost = function () {
    $scope.error = '';
    $scope.post = {};
    site.showModal('#newPostModal');
    $('#new_post').focus();
  };

  $scope.newAuthor = function () {
    $scope.error = '';
    $scope.author = {
      is_approved : true
    };
    site.showModal('#newAuthorModal');
    $('#author_name').focus();
  };
  $scope.newPostCategory = function () {
    $scope.error = '';
    $scope.post_category = {
      is_show : true
    };
    
    site.showModal('#postCategoryModal');
    $('#post_category_ar').focus();
  };

  $scope.addToPosts = function (post) {

    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/posts/add",
      data: post
    }).then(
      function (response) {
        if (response.data.done) {
          post.$status = 'Published';
          site.hideModal('#newPostModal');
        } else {
          post.$status = 'Error';
        }
      },
      function (err) {
        post.$status = err.message;
      }
    );
  };

  $scope.addToAuthors = function (author) {
    author = author || $scope.author;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/posts/authors/add",
      data: author
    }).then(
      function (response) {
        if (response.data.done) {
          site.hideModal('#newAuthorModal');
        } else {
          $scope.error = 'Error';
        }
      },
      function (err) {
        $scope.error = err.message;
      }
    );
  };

  $scope.addToPostCategories = function (post_category) {
    post_category = post_category || $scope.post_category;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/posts/categories/add",
      data: post_category
    }).then(
      function (response) {
        if (response.data.done) {
          site.hideModal('#postCategoryModal');
        } else {
          $scope.error = 'Error';
        }
      },
      function (err) {
        $scope.error = err.message;
      }
    );
  };

  $scope.add = function (post) {

    $scope.error = '';

    post = post || {
      text: $('#new_post').html(),
      is_approved: true,
      details: {}
    };
    post.details = post.details || {};

    post.url_list = post.url_list || urlify(post.text).url_list;

    if (post.url_list.length > 0) {
      spider.get_page_info(post.url_list[0], function (res) {
        post.spider = {
          enabled: true
        };
        post.details.url = res.url;
        post.details.image_url = res.image_url;
        post.details.title = res.title;
        post.details.description = res.description;
        if (post.spider.enabled) {
          if (res.is_youtube) {
            post.text = post.details.title || post.details.description;
          } else {
            post.text = post.details.title || post.details.description;
          }
          post.is_approved = true;
          if (res.is_youtube) {
            post.author = {
              "id": 0,
              "name": res.channel_title || "Youtube",
              "logo_url": res.channel_image_url || "/images/youtube.png"
            };
          }
        } else {
          if (post.text == post.details.url) {
            post.text = post.details.title || post.details.description;
          }
        }
        $scope.addToPosts(post);
      });
    } else {
      $scope.addToPosts(post);
    }

  };

  $scope.addURL = function () {
    $scope.urls_busy = true;
    $scope.error = '';
    spider.get_page_urls({url : $scope.url.text , match : $scope.url.match}, (res) => {
      $scope.urls_busy = false;

      res.list.forEach((url, i) => {
        let post = {
          author : {name : res.title , logo_url : res.image_url , url : res.url},
          $status: 'Pending',
          is_video: $scope.url.is_video,
          is_porn: $scope.url.is_porn,
          is_children: $scope.url.is_children,
          is_approved: $scope.url.is_approved,
          is_hidden: $scope.url.is_hidden,
          is_deleted: $scope.url.is_deleted
        }
        $scope.newPosts.push(post);
        post.text = url;
        setTimeout(() => {
          $scope.add(post);
        }, 1000 * 5 * i);
      });
    });
  };

  $scope.loadPostCategories = function () {
    $scope.PostCategories = [];
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/posts/categories/all"
    }).then(
      function (response) {
        if(response.data.done){
          response.data.list.forEach(u =>{
            u.link = decodeURI(`/post-category/${u.id}/${u.en}/${u.ar}`);
          })
          $scope.PostCategories = response.data.list || [];
          
        }
      },
      function (err) {
        $scope.error = err.message;
      }
    );
  };
  $scope.loadPostTypes = function () {

    $scope.error = '';
    $http({
      method: "get",
      url: "/json/post-types.json"
    }).then(
      function (response) {
        $scope.PostTypes = response.data || [];
      },
      function (err) {
        $scope.error = err.message;
      }
    );
  };
  $scope.loadSiteNews = function () {

    $scope.error = '';
    $http({
      method: "get",
      url: "/json/site-news.json"
    }).then(
      function (response) {
        $scope.siteNews = response.data || [];
      },
      function (err) {
        $scope.error = err.message;
      }
    );
  };


  $scope.loadPostCategories();

  $scope.loadPostTypes();
  $scope.loadSiteNews();
});