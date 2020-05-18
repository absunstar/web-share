module.exports = function init(site) {

    const $posts_content = site.$posts_content = site.connectCollection("posts_content")
    const crypto = require('crypto');

    const secret = 'abcdefg';

    var facebook = {
        app_id: '763530237517120', /* from my apps */
        secret_id: '0bcbb3c00fa8636b79535d6763da723a',/* from my apps */
        page_id: '1668811503334535',/* from my apps */
        app_access_token : "763530237517120|j3YteLgJje6d6htBhy7yRAzheGw",/* from my apps and follow from Graph API Explorer */
        user_access_token: "EAAK2bTyVHUABAANv7EMFGspraZCKniXCypHanIsCNbZCNC08mBCCTxqvspmWfiKiA4CnBUTbZCQhbLgGp73ZA2PZAjE3IKiG8ZCAv0ydOUYgHbDJa6SOcHl7jfNW2XOVxvbERc1qZBSzZC4QgmpJHTGDg2HZAGmTJAhD0beZAZBgXWisOMCgiqwhvfPcqrzgqkCBLUZD",
        user_long_access_token: "EAAK2bTyVHUABANH3hJq0RcilBaWb7cs5ArXyNf4uBwQRZBu3FdBDXHlHfsh74KgMfWFCVtgZBpK0tvf59hwbti3AKrD00zygeZBKlVFFzqUiDoX6KLUpCT8U0k24WO9Q3oKAsZBbyqoqsuotjD1LxOaWU6vBsiAnSZBZCuzcNvEgZDZD",
        page_access_token: "EAAK2bTyVHUABAG52X0ErBH0lr613o7Qts9yQICZALRZAmBfZCXJZBd2PpVzAjQbtPZBKcfZCvdLSCaVjewIyMKPMuOPYmPTIZAn33z19bXzZAlijtNRjQfMidw6pHlHnbZBQUkyMJMJ2J6eyicOijjjQsT84wjT7Siyzkwa7uD2MtuILPCHnlmkvMTTRJy805vYAZD",
        page_long_access_token: "EAAK2bTyVHUABAJBKfUmLsMzlHsD8z3IgIgoQM8Ni6yIwuOkAL5VdVRyMjVyVLxC3s7UZCbZCtTQXNJxVYZA2xqTBqnfUjIVrmgNcyKc2havGNvNgvkAsrBj7X6vU968z6bUrsiDffTsPZBoTePmOzq7mfzYA8GuLkYk5RPmVugZDZD"
    }
    facebook.appsecret_proof = crypto.createHmac('sha256', facebook.secret_id).update(facebook.page_long_access_token).digest('hex');

    facebook.get_user_long_access_token = function() {
        site.request.get(`https://graph.facebook.com/v7.0/oauth/access_token?grant_type=fb_exchange_token& client_id=${facebook.app_id}&client_secret=${facebook.secret_id}&fb_exchange_token=${facebook.user_access_token}&access_token=${facebook.user_access_token}`, function (error, response, body) {
            console.log(body);
        })
    }
    facebook.get_page_long_access_token = function() {
        site.request.get(`https://graph.facebook.com/v7.0/oauth/access_token?grant_type=fb_exchange_token& client_id=${facebook.app_id}&client_secret=${facebook.secret_id}&fb_exchange_token=${facebook.page_access_token}&access_token=${facebook.user_long_access_token}`, function (error, response, body) {
            console.log(body);
        })
    }

    //get_user_long_access_token()
    //get_page_long_access_token()

    facebook.post_to_facebook = function(data , callbaack) {
        console.log('posting to facebok')
        site.request.post({
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            url: `https://graph.facebook.com/${facebook.page_id}/feed`,
            body: `message=${data.message}&link=${data.link}&access_token=${facebook.page_long_access_token}&appsecret_proof=${facebook.appsecret_proof}`
        }, function (error, response, body) {
            callbaack(error || body);
        })
    }

    let post_id = 1

    facebook.post_movie = function() {
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
                    facebook.post_movie()
                }, 500);
                
            } else {
                facebook.post_to_facebook({
                    message: "حمل الان مجانا وبجودة عالية #أفلام_تورينت" + "\n\r" + doc.text,
                    link: "https://egytag.com/post/" + doc.guid
                } , (data)=>{
                    console.log(data)
                    if(data && data.error){
                        facebook.post_movie()
                    }else{
                        setTimeout(() => {
                            facebook.post_movie()
                        }, 1000 * 60 * 5);
                    }
                    
                })
                
            }

        })
    }

    // $posts_content.findAll({
    //     where: {
    //         is_yts: true
    //     },
    //     limit : 1,
    //     select : {id : 1}
    // }, (err, docs) => {
    //     if(!err && docs && docs.length > 0){
    //         post_id = docs[0].id + 15
    //        facebook.post_movie()
    //     }
    // })
     

    // facebook.get_long_access_token()

    // facebook.post_to_facebook('New Features Soon !!')

    return facebook

}