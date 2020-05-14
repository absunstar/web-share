module.exports = function init(site) {

    const $posts_content = site.$posts_content = site.connectCollection("posts_content")


    const facebook = {
        app_id: '763530237517120',
        secret_id: '0bcbb3c00fa8636b79535d6763da723a',
        page_id: '1668811503334535',
        user_access_token: "EAAK2bTyVHUABAANv7EMFGspraZCKniXCypHanIsCNbZCNC08mBCCTxqvspmWfiKiA4CnBUTbZCQhbLgGp73ZA2PZAjE3IKiG8ZCAv0ydOUYgHbDJa6SOcHl7jfNW2XOVxvbERc1qZBSzZC4QgmpJHTGDg2HZAGmTJAhD0beZAZBgXWisOMCgiqwhvfPcqrzgqkCBLUZD",
        user_long_access_token: "EAAK2bTyVHUABAPaqivZAvlVRcm97P9vWnW7VLswuhNE6RtbsNZB5S8bPna48SY82wTNMBMQGr8bCkYzvDQrez0kRSFC3KZBS1fevtH3CIbHZAliwVH9FwL8QB0McZCf6w2xZBA8JJIZA3TgZBync46Qf9ZClF7ZAmMKG3byKC2CZBXZALgZDZD",
        page_access_token: "EAAK2bTyVHUABAG52X0ErBH0lr613o7Qts9yQICZALRZAmBfZCXJZBd2PpVzAjQbtPZBKcfZCvdLSCaVjewIyMKPMuOPYmPTIZAn33z19bXzZAlijtNRjQfMidw6pHlHnbZBQUkyMJMJ2J6eyicOijjjQsT84wjT7Siyzkwa7uD2MtuILPCHnlmkvMTTRJy805vYAZD",
        page_long_access_token: "EAAK2bTyVHUABAJBKfUmLsMzlHsD8z3IgIgoQM8Ni6yIwuOkAL5VdVRyMjVyVLxC3s7UZCbZCtTQXNJxVYZA2xqTBqnfUjIVrmgNcyKc2havGNvNgvkAsrBj7X6vU968z6bUrsiDffTsPZBoTePmOzq7mfzYA8GuLkYk5RPmVugZDZD"
    }
    
    function get_long_access_token() {
        site.request.get(`https://graph.facebook.com/v7.0/oauth/access_token?grant_type=fb_exchange_token& client_id=${facebook.app_id}&client_secret=${facebook.secret_id}&fb_exchange_token=${facebook.page_access_token}&access_token=${facebook.user_access_token}`, function (error, response, body) {
            console.log(body);
        })
    }
    //get_long_access_token()
    function post_to_facebook(data , callbaack) {
        console.log('posting to facebok')
        site.request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: `https://graph.facebook.com/${facebook.page_id}/feed`,
            body: `message=${data.message}&link=${data.link}&access_token=${facebook.page_long_access_token}`
        }, function (error, response, body) {
            callbaack(error || body);
        })
    }

    let post_id = 1

    function post_movie() {
        console.log('try find movie ' + post_id)
        $posts_content.find({
            where: {
                id: post_id,
                is_yts: true
            }
        }, (err, doc) => {
            post_id++
            if (err || !doc) {
                console.log(err)
                setTimeout(() => {
                    post_movie()
                }, 500);
                
            } else {
                post_to_facebook({
                    message: "حمل الان مجانا وبجودة عالية #أفلام_تورينت" + "\n\r" + doc.text,
                    link: "https://egytag.com/post/" + doc.guid
                } , (data)=>{
                    console.log(data)
                    if(data && data.error){
                        post_movie()
                    }else{
                        setTimeout(() => {
                            post_movie()
                        }, 1000 * 60 * 5);
                    }
                    
                })
                
            }

        })
    }

    $posts_content.findAll({
        where: {
            is_yts: true
        },
        limit : 1,
        select : {id : 1}
    }, (err, docs) => {
        if(!err && docs){
            post_id = docs[0].id + 15
            // post_movie()
        }
    })
     

    // get_long_access_token()

    // post_to_facebook('New Features Soon !!')



}