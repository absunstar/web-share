module.exports = function init(site){
    site.onGET({name:'images' , path: __dirname + '/site_files/images/'})
}