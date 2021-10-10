module.exports = function init(site){
    site.onGET({name:'images' , public : true , path: __dirname + '/site_files/images/'})
}