var spider = {
    server : 'http://127.0.0.1:60080'
}

spider.get_page_info = function(url, callback) {
    site.postData({
        url: spider.server + '/api/page-info-spider',
        method: 'POST',
        data: {
            url: url,
            partition : $$$.browser.remote.getCurrentWindow().webContents.getWebPreferences().partition
        }
    }, (res) => {

        callback(res);
    });
};

spider.get_page_urls = function(op, callback) {
    op.partition = $$$.browser.remote.getCurrentWindow().webContents.getWebPreferences().partition

    site.postData({
        url: spider.server + '/api/page-urls-spider',
        method: 'POST',
        data: op
    }, (res) => {
        callback(res);
    });
};