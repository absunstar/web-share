module.exports = function init(site) {

  const $chat_words = site.$posts_content = site.connectCollection("chat_words")

  $chat_words.createUnique({
    word: 1
  })

  site.get({
    name: "/chat-bot",
    path: __dirname + "/site_files/html/index.html",
    parser : 'html cs js'
  })

  site.get({
    name: "/",
    path: __dirname + "/site_files"
  })

  site.post('/api/message/send', (req, res) => {
    res.json({
      done: true,
      message: req.data.message
    })
  })

  site.post('/api/chat-messages/all', (req, res) => {
    res.json({
      done: true,
      list: []
    })
  })

  function loadChatWords(min, max) {
    const lineByLine = require('n-readlines');
    const liner = new lineByLine(__dirname + '/site_files/txt/words.txt');
    let line;
    let arr = []
    while (line = liner.next()) {
      arr.push(line.toString('utf8'))
    }
    console.log('done ...................' + arr.length)
    for (let index = min; index < max; index++) {
      $chat_words.add({
        word: arr[index],
        length: arr[index].length
      })
    }
  }

  // loadChatWords(1000000, 2000000)

}