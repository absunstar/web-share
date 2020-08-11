let series_url = "https://akwam.net/series";
let series_page = "https://akwam.net/series?page=2";
let serie_url = "https://akwam.net/series/326/فلانتينو";
let episode_url = "https://akwam.net/episode/6846"
let watch_url = "http://pluslive.live/watch/16948" || "http://lefturl.com/watch/16949";
let download_url = "http://pluslive.live/link/16948" || "http://lefturl.com/link/16949";
let download_url2 = "https://akwam.net/download/17113/6770";
let download_url2_selector = "document.querySelector('.download-link')";
let download_url3 = "https://s208.akwam.download/download/1590194318/5ec71f0edfaec/Valantino.E27.720P.WEB-DL.akwam.net.mp4";
let download_url3_selector = "document.querySelector('.btn-loader a')";

var akwam = {
    series_list: [],
    movies_list : []
};

akwam.get_serie_info = function (serie, callback) {

    console.log('get_serie_info : ' + serie.url);

    serie = {
        author: {
            "name": "Series TV",
            "logo_url": "/images/series.png"
        },
        ref_url: serie.url,
        details: {},
        is_approved: true,
        is_akwam: true,
        is_series: true,
        episode_list: []
    }

    spider.get_page_content({
        url: serie.ref_url
    }, (data, err) => {
        if (err) {
            callback(null, err);
            return
        }
        data.tags.forEach(tag => {
            if (tag.tagName == "TITLE") {
                serie.text = tag._text.replace('| اكوام', '').trim();
                serie.details.url = serie.ref_url;
                serie.details.title = serie.text;
            } else if (tag.tagName == "META" && tag.name == "description") {
                serie.details.description = tag.content;
            } else if (tag.tagName == "IMG" && tag.class == "img-fluid" && tag.alt == serie.text) {
                serie.details.image_url = tag.src;
            } else if (tag.tagName == "A" && tag.href && tag._text && tag.href.like('*akwam.net/episode*')) {
                serie.episode_list.push({
                    title: tag._text,
                    url: tag.href,
                    watch_list: [],
                    download_list: []
                })
            }

            if (tag.tagName == "IMG" && serie.episode_list.length > 0 && !serie.episode_list[serie.episode_list.length - 1].image_url) {
                serie.episode_list[serie.episode_list.length - 1].image_url = tag.src;
            }
        });
        callback(serie);
    })
};

akwam.get_serie_episode_watch_urls = function (episode, callback) {
    console.log(`get_serie_episode_watch_urls : ${episode.url}  , ${episode.title} `);
    akwam.series_list[episode.$serie_index].episode_list[episode.$index].watch_list = [];
    akwam.series_list[episode.$serie_index].episode_list[episode.$index].source_watch_list = [];
    akwam.series_list[episode.$serie_index].episode_list[episode.$index].show_watch_list = [];
    akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting = 1;
    spider.get_page_content({
            url: akwam.series_list[episode.$serie_index].episode_list[episode.$index].url,
        },
        function (data, err) {
            if (err) {
                akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--
                callback(episode, err);
                return
            }
            data.tags.forEach(function (tag) {
                if (tag.tagName == "A" && tag.href && tag._text && tag.href.like("*watch*")) {
                    if (akwam.series_list[episode.$serie_index].episode_list[episode.$index].source_watch_list.filter(u => u.url == tag.href).length > 0) {
                        return;
                    }
                    console.log(`watch link : ${episode.title} , ${tag.href}`);
                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].source_watch_list.push({
                        url: tag.href
                    });
                   
                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting++;
                    spider.get_page_content({
                            url: tag.href,
                        },
                        function (data, err) {
                            if (err) {
                                console.log(err);
                                akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--;
                                return
                            }
                            data.tags.forEach(function (tag) {
                                if (tag.class == "download-link") {
                                    console.log(`show watch link : , ${episode.title} - ${tag.href} `);
                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].show_watch_list.push({
                                        url: tag.href
                                    });
                                    return;
                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting++;
                                    spider.get_page_content({
                                            url: tag.href,
                                        },
                                        function (data, err) {
                                            if (err) {
                                                akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--
                                                return
                                            }
                                            data.tags.forEach(function (tag) {
                                                if (tag.tagName == "SOURCE") {
                                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].watch_list.push({
                                                        type: tag.type,
                                                        size: tag.size,
                                                        href: tag.src,
                                                        guid: tag.src + tag.size,
                                                        title: " مسلسل " + akwam.series_list[episode.$serie_index].text + " - " + episode.title,
                                                        url: `/show-video?url=${tag.src}&title=${" مسلسل " + akwam.series_list[episode.$serie_index].text + " - " + episode.title}`
                                                    });

                                                }
                                            });
                                            akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--;
                                        }
                                    );
                                } else if (tag.tagName == "SOURCE") {
                                    console.log(`show watch link : , ${episode.title} - ${tag.href} `);
                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].show_watch_list.push({
                                        url: tag.href
                                    });
                                    return
                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].watch_list.push({
                                        type: tag.type,
                                        size: tag.size,
                                        href: tag.src,
                                        guid: tag.src + tag.size,
                                        title: " مسلسل " + akwam.series_list[episode.$serie_index].text + " - " + episode.title,
                                        url: `/show-video?url=${tag.src}&title=${" مسلسل " + akwam.series_list[episode.$serie_index].text + " - " + episode.title}`
                                    });

                                }

                            });
                            akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--;
                        }
                    );
                }
            });
            akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--;
        }
    );
    akwam.callback(akwam.series_list[episode.$serie_index].episode_list[episode.$index], callback);

};

akwam.get_serie_episode_download_urls = function (episode, callback) {
    console.log(`get_serie_episode_download_urls : ${episode.url}  , ${episode.title} `);
    akwam.series_list[episode.$serie_index].episode_list[episode.$index].download_list = [];
    akwam.series_list[episode.$serie_index].episode_list[episode.$index].source_download_list = [];
    akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting = 1;

    spider.get_page_content({
            url: akwam.series_list[episode.$serie_index].episode_list[episode.$index].url,
        },
        (data, err) => {
            if (err) {
                console.log(err);
                akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--
                callback(episode, err);
                return
            }
            data.tags.forEach((tag) => {
                if (tag.tagName == "A" && tag.href && tag._text && tag.class && tag.class.like("*link-download*")) {
                    console.log(`download link : ${episode.title} , ${tag.href}`);
                    if (akwam.series_list[episode.$serie_index].episode_list[episode.$index].source_download_list.filter(u => u.url == tag.href).length > 0) {
                        return;
                    }
                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].source_download_list.push({
                        url: tag.href,
                    });
                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting++;
                    spider.get_page_content({
                            url: tag.href,
                        },
                        (data, err) => {
                            if (err) {
                                akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--
                                return
                            }
                            data.tags.forEach((tag2) => {
                                if (tag2.tagName == "A" && tag2.class && tag2.class == "download-link") {
                                    console.log(`download download-link : ${episode.title} `);
                                  
                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting++;
                                    spider.get_page_content({
                                            url: tag2.href,
                                        },
                                        (data, err) => {
                                            if (err) {
                                                akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--
                                                return
                                            }
                                            data.tags.forEach((tag3) => {
                                                if (tag3.tagName == "A" && tag3.class && tag3.class.like("link*")) {
                                                    let exists = false;
                                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].download_list.forEach((s) => {
                                                        if (s.href == tag3.href) {
                                                            exists = true;
                                                        }
                                                    });
                                                    if (!exists) {
                                                        let t = {};
                                                        t.href = tag3.href;
                                                        t.size = "HD";
                                                        if (t.href.like("*480*")) {
                                                            t.size = "480";
                                                        } else if (t.href.like("*720*")) {
                                                            t.size = "720";
                                                        } else if (t.href.like("*1080*")) {
                                                            t.size = "1080";
                                                        } else if (t.href.like("*360*")) {
                                                            t.size = "360";
                                                        }
                                                        akwam.series_list[episode.$serie_index].episode_list[episode.$index].download_list.push(t);
                                                    }
                                                }
                                            });
                                            akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--;
                                        }
                                    );
                                } else if (tag2.tagName == "A" && tag2.class && tag2.class.like("link*")) {
                                    let exists = false;
                                    akwam.series_list[episode.$serie_index].episode_list[episode.$index].download_list.forEach((s) => {
                                        if (s.href == tag2.href) {
                                            exists = true;
                                        }
                                    });
                                    if (!exists) {
                                        let t = {};
                                        t.href = tag2.href;
                                        t.size = "HD";
                                        if (t.href.like("*480*")) {
                                            t.size = "480";
                                        } else if (t.href.like("*720*")) {
                                            t.size = "720";
                                        } else if (t.href.like("*1080*")) {
                                            t.size = "1080";
                                        } else if (t.href.like("*360*")) {
                                            t.size = "360";
                                        }
                                        akwam.series_list[episode.$serie_index].episode_list[episode.$index].download_list.push(t);
                                    }
                                }

                            });
                            akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--;
                        }
                    );
                }
            });
            akwam.series_list[episode.$serie_index].episode_list[episode.$index].waiting--;
        }
    );

    akwam.callback(episode, callback);

};

akwam.get_all_serie_data = function (serie, callback) {
    akwam.get_serie_info(serie, (serie, err) => {
        if (err) {
            callback(null, err)
            return
        }
        let serie_index = 0;
        if (typeof serie.$index == "undefined") {
            akwam.series_list.push(serie);
            serie = akwam.series_list[akwam.series_list.length - 1];
            serie_index = serie.$index = akwam.series_list.length - 1;
        }

        akwam.series_list[serie_index].waiting = 0;

        akwam.series_list[serie_index].episode_list.forEach((episode, i) => {
            episode.$index = i;
            episode.$serie_index = serie_index;
            akwam.series_list[serie_index].waiting++;
            akwam.get_serie_episode_watch_urls(akwam.series_list[serie_index].episode_list[episode.$index], (episode, err) => {
                akwam.series_list[serie_index].waiting--;
                if (err) {
                    return
                }
                akwam.series_list[serie_index].episode_list[episode.$index].watch_list = site.getUniqueObjects(episode.watch_list, "guid");
                console.log(`watch list collected : ${episode.title} `);
            });
            return;
            akwam.series_list[serie_index].waiting++;
            akwam.get_serie_episode_download_urls(akwam.series_list[serie_index].episode_list[episode.$index], (episode, err) => {
                akwam.series_list[serie_index].waiting--;
                if (err) {
                    return
                }
                akwam.series_list[serie_index].episode_list[episode.$index].download_list = site.getUniqueObjects(episode.download_list, "href");
                console.log(`download_list collected: ${episode.title} `);
            });
        });

        akwam.callback(akwam.series_list[serie_index], callback);

    });
};

akwam.callback = function (obj, callback) {
    callback = callback || function (res) {
        console.log(res)
    }
    let stop = false
    if (obj.waiting < 1) {
        stop = true;

    } else if (obj.is_series && obj.episode_list && obj.episode_list.length > 0) {
        if (obj.episode_list[0].waiting < 1 && obj.episode_list[obj.episode_list.length - 1].waiting < 1) {
            stop = true;
        }

    }
    if (stop) {
        if (obj.is_series) {
            setTimeout(() => {
                callback(akwam.series_list[obj.$index]);
            }, 1000 * 3);
        } else {
            callback(obj);
        }
    } else {
        setTimeout(() => {
            akwam.callback(obj, callback);
        }, 1000);
    }
};

akwam.get_movie_info = function (movie, callback) {

    console.log('get_movie_info : ' + movie.url);

    movie = {
        author: {
            "name": "movies TV",
            "logo_url": "/images/movies.png"
        },
        ref_url: movie.url,
        details: {},
        is_approved: true,
        is_akwam: true,
        is_movies: true
    }

    spider.get_page_content({
        url: movie.ref_url
    }, (data, err) => {
        if (err) {
            console.log(err);
            callback(null, err);
            return
        }
        data.tags.forEach(tag => {
            if (tag.tagName == "TITLE") {
                movie.text = tag._text.replace('| اكوام', '').trim();
                movie.details.url = movie.ref_url;
                movie.details.title = movie.text;
            } else if (tag.tagName == "META" && tag.name == "description") {
                movie.details.description = tag.content;
            } else if (tag.tagName == "IMG" && tag.class == "img-fluid" && tag.alt == movie.text) {
                movie.details.image_url = tag.src;
            }
        });
        callback(movie);
    })
};
akwam.get_all_movie_data = function (movie, callback) {
    akwam.get_movie_info(movie, (movie, err) => {
        if (err) {
            console.log(err);
            callback(null, err)
            return
        }
        let movie_index = 0;
        if (typeof movie.$index == "undefined") {
            akwam.movies_list.push(movie);
            movie = akwam.movies_list[akwam.movies_list.length - 1];
            movie_index = movie.$index = akwam.movies_list.length - 1;
        }

        akwam.movies_list[movie_index].waiting = 0;
       
            akwam.movies_list[movie_index].waiting++;
            akwam.get_movie_watch_urls(akwam.movies_list[movie_index], (episode, err) => {
                akwam.movies_list[movie_index].waiting--;
                if (err) {
                    return
                }
                akwam.movies_list[movie_index].show_watch_list = site.getUniqueObjects(episode.show_watch_list, "url");
                console.log(`show watch list collected : ${movie.title} `);
            });
        

        akwam.callback(akwam.movies_list[movie_index], callback);

    });
};
akwam.get_movie_watch_urls = function (movie, callback) {
   
    akwam.movies_list[movie.$index].source_watch_list = [];
    akwam.movies_list[movie.$index].show_watch_list = [];
    akwam.movies_list[movie.$index].waiting = 1;
    spider.get_page_content({
            url: akwam.movies_list[movie.$index].ref_url,
        },
        function (data, err) {
            if (err) {
                akwam.movies_list[movie.$index].waiting--
                callback(movie, err);
                return
            }
            data.tags.forEach(function (tag) {
                if (tag.tagName == "A" && tag.href && tag._text && tag.href.like("*watch*")) {
                    if (akwam.movies_list[movie.$index].source_watch_list.filter(u => u.url == tag.href).length > 0) {
                        return;
                    }
                    console.log(`watch link : ${movie.title} , ${tag.href}`);
                    akwam.movies_list[movie.$index].source_watch_list.push({
                        url: tag.href
                    });
                   
                    akwam.movies_list[movie.$index].waiting++;
                    spider.get_page_content({
                            url: tag.href,
                        },
                        function (data, err) {
                            if (err) {
                                console.log(err);
                                akwam.movies_list[movie.$index].waiting--;
                                return
                            }
                            data.tags.forEach(function (tag) {
                                if (tag.class == "download-link") {
                                    console.log(`show watch link : , ${movie.title} - ${tag.href} `);
                                    akwam.movies_list[movie.$index].show_watch_list.push({
                                        url: tag.href
                                    });
                                } else if (tag.tagName == "SOURCE") {
                                    console.log(`show watch link : , ${movie.title} - ${tag.href} `);
                                    akwam.movies_list[movie.$index].show_watch_list.push({
                                        url: tag.href
                                    });

                                }

                            });
                            akwam.movies_list[movie.$index].waiting--;
                        }
                    );
                }
            });
            akwam.movies_list[movie.$index].waiting--;
        }
    );
    akwam.callback(akwam.movies_list[movie.$index], callback);

};
akwam.upload_movie = function (movie, callback) {
    akwam.get_all_movie_data(movie, (movie) => {
        site.postData({
            method: "POST",
            url: "/api/posts/add",
            data: akwam.movies_list[movie.$index]
        }, (res) => {
            console.log(res)
        }, (err) => {
            console.log(err)
        });
    });
};
akwam.re_upload_movie = function (callback) {
    let id = post.id;
    akwam.get_all_movie_data(post, (movie, err) => {
        if (err) {
            console.log(err);
            return;
        }
        movie.id = parseInt(id);
        site.postData({
            method: "POST",
            url: "/api/posts/update",
            data: akwam.movies_list[movie.$index]
        }, (res) => {
            console.log(res)
        }, (err) => {
            console.log(err)
        });
    });
};
akwam.upload_serie = function (serie, callback) {
    akwam.get_all_serie_data(serie, (serie) => {
        site.postData({
            method: "POST",
            url: "/api/posts/add",
            data: akwam.series_list[serie.$index]
        }, (res) => {
            console.log(res)
        }, (err) => {
            console.log(err)
        });
    });
};

akwam.re_upload_serie = function (callback) {
    let id = post.id;
    akwam.get_all_serie_data(post, (serie, err) => {
        if (err) {
            console.log(err);
            return;
        }
        serie.id = parseInt(id);
        site.postData({
            method: "POST",
            url: "/api/posts/update",
            data: akwam.series_list[serie.$index]
        }, (res) => {
            console.log(res)
        }, (err) => {
            console.log(err)
        });
    });
};

akwam.remove = function (callback) {
    site.postData({
        method: "POST",
        url: "/api/posts/delete",
        data: post
    }, (res) => {
        console.log(res)
    }, (err) => {
        console.log(err)
    });
};
akwam.send_online = function (callback) {
    site.postData({
        method: "POST",
        url: "/api/posts/get",
        data: post
    }, (res) => {
        console.log(res)
        site.postData({
            method: "POST",
            url: "https://egytag.com/api/posts/add",
            data: res.doc
        }, (res) => {
            console.log(res)
        }, (err) => {
            console.log(err)
        });
    }, (err) => {
        console.log(err)
    });

};