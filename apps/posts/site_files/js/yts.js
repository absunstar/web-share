function get_yts_movies(op , callback){
    callback = callback || function(){};
    op = op || {};
    op.page = op.page || 1;
    op.limit = op.limit || 50;
    site.getData({
        url: `https://yts.mx/api/v2/list_movies.json?limit=${op.limit}&page=${op.page}`,
        method: 'GET',
    }, (res) => {
        callback(res);
    });
}

function get_all_yts_movies(op){
    op = op || {};
    op.page = op.page || 1;
    op.limit = op.limit || 50;
    get_yts_movies(op , (res)=>{
        if(res.status == "ok" && res.data.movies && res.data.movies.length > 0){
            res.data.movies.forEach(movie=>{
                let post = {
                    author : {
                        "name" : "Torrent Movies",
                        "logo_url" : "/images/torrent.png"
                    },
                    is_yts : true,
                    yts : movie,
                    text: movie.title_long || movie.title,
                    is_approved: true,
                    details: {
                        url : movie.url,
                        image_url : movie.medium_cover_image,
                        title : movie.title,
                        description : movie.description_full || movie.summary
                    }
                };
                site.postData({
                    url: `/api/posts/add`,
                    method: 'POST',
                    data : post
                }, (res) => {
                   console.log(res)
                });
            });
            op.page+=1;
            setTimeout(() => {
                get_all_yts_movies(op);
            }, 5000);
        }
    });

};