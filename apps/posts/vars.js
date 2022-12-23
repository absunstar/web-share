module.exports = function init(site, post) {
  post.siteList = [
    {
      url: 'xxxxxxxxx',
      selector: 'xxxxxxxxx',
    },  {
      url: '*new.masrmix.com*',
      selector: '.section-post',
    },
    {
      url: '*koora.fal3arda.com*',
      selector: '.post-inner',
    },
    {
      url: '*muhtwaplus.com*',
      selector: '.content-inner',
    },
    {
      url: '*elbalad.news*',
      selector: 'article',
    },
    {
      url: '*mes7at.com*',
      selector: '.content-inner',
    },
    {
      url: '*aleqt.com*',
      selector: 'article',
    },
    {
      url: '*investing.com*',
      selector: '.articlePage',
    },
    {
      url: '*al-ain.com*',
      selector: 'article',
    },
    {
      url: '*arabic.news.cn*',
      selector: '#detail',
    },
    {
      url: '*nafeza2world*',
      selector: 'article',
    },
    {
      url: '*bbc.com*',
      selector: 'main',
    },
    {
      url: '*albayan.ae*',
      selector: '#articledetails',
    },
    {
      url: '*elmostaqbal.com*',
      selector: '.content-inner',
    },
    {
      url: '*alarabiya.net*',
      selector: '#body-text',
    },
    {
      url: '*skynewsarabia.com*',
      selector: '.article-container',
    },
    {
      url: '*youm7.com*',
      selector: '#articleBody',
    },
    {
      url: '*almayadeen.net*',
      selector: '.post-details',
    },
    {
      url: '*alittihad.ae*',
      selector: '.art-text',
    },
    {
      url: '*arabic.rt.com*',
      selector: '.article .text',
    },
    {
      url: '*emaratalyoum.com*',
      selector: '#articledetails',
    },
    {
      url: '*aitnews.com*',
      selector: '.entry-content',
    },
    {
      url: '*sabq.org*',
      selector: '#dev-content',
      needBrowser: true,
    },
    {
      url: '*aljazeera.net*',
      selector: '#main-content-area .container__inner > div',
    },
    {
      url: '*menafn.com*',
      selector: '#ContentPlaceHolder1_div_story_body',
    },
    {
      url: '*kora.fal3arda.com*',
      selector: '.entry-content-inner',
    },
    {
      url: '*masrawy.com*',
      selector: '.ArticleDetails.details',
    },
    {
      url: '*al-jazirahonline.com*',
      selector: 'article .entry-content-wrap',
    },
    {
      url: '*al-marsd.com*',
      selector: '.entry-content',
    },
    {
      url: '*emarat-news.ae*',
      selector: '.content-inner',
    },
    {
      url: '*ngmisr.com*',
      selector: 'article.post',
    },
    {
      url: '*ahdathnet.com*',
      selector: '#article',
    },
    {
      url: '*wam.ae*',
      selector: '.thePost',
    },
    {
      url: '*btolat.com*',
      selector: 'article.post',
    },
    {
      url: '*slaati.com*',
      selector: '.show-main',
    },
    {
      url: '*ienalwatan.com*',
      selector: 'article',
    },
    {
      url: '*thaqfny.com*',
      selector: '.post-content',
    },
    {
      url: '*sawahnews.com*',
      selector: 'article',
    },
    {
      url: '*arabic.cnn.com*',
      selector: 'article',
    },
    {
      url: '*shorouknews.com*',
      selector: '.innerNews',
    },
    {
      url: '*sawahpress.com*',
      selector: '.entry-content',
    },
    {
      url: '*24.ae*',
      selector: 'article',
    },
    {
      url: '*alkhaleej.ae*',
      selector: '.content',
    },
    {
      url: '*almountakhab.com*',
      selector: '.article-body',
    },
    {
      url: '*yallakora.com*',
      selector: 'article',
    },
    {
      url: '*france24.com*',
      selector: 'article',
    },
    {
      url: '*zahratalkhaleej.ae*',
      selector: '.article-content',
    },
    {
      url: '*filgoal.com*',
      selector: '.article',
    },
    {
      url: '*sawtbeirut.com*',
      selector: '.single-body',
    },
    {
      url: '*aljazeerh-alarabiya.com*',
      selector: '.news_content',
    },
    {
      url: '*gulf365.com*',
      selector: '#content article',
    },
    {
      url: '*almasryalyoum.com*',
      selector: '#NewsStory',
      needBrowser: false,
    },
    {
      url: '*kooora.com*',
      selector: '.articleBody',
      needBrowser: true,
      filter: {
        start: 'article_content = "',
        end: '"',
      },
    },
  ];
};
