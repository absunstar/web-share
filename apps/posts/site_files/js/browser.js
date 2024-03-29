var spider = {
    server : 'http://127.0.0.1:60080'
}

spider.get_page_info = function(url, callback) {
    site.postData({
        url: spider.server + '/api/page-info-spider',
        method: 'POST',
        data: {
            url: url,
            partition : SOCIALBROWSER.electron.remote.getCurrentWindow().webContents.getWebPreferences().partition
        }
    }, (res) => {

        callback(res);
    });
};

spider.get_page_urls = function(op, callback) {
    op.partition = SOCIALBROWSER.electron.remote.getCurrentWindow().webContents.getWebPreferences().partition

    site.postData({
        url: spider.server + '/api/page-urls-spider',
        method: 'POST',
        data: op
    }, (res) => {
        callback(res);
    });
};

spider.get_page_content = function(op, callback) {
    op.partition = SOCIALBROWSER.electron.remote.getCurrentWindow().webContents.getWebPreferences().partition

    site.postData({
        url: spider.server + '/api/page-content-spider',
        method: 'POST',
        data: op
    }, (res) => {
        callback(res);
    }, (err)=>{
        callback(null , err);
    });
};