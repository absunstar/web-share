module.exports = function init(site) {
  let __appName = 'scrapingList';
  let __memoryMode = true;
  let $collection = site.connectCollection(__appName);
  let __list = [];
  site['get_' + __appName] = function () {
    return __list;
  };
  if (__memoryMode) {
    $collection.findMany({}, (err, docs) => {
      if (!err) {
        if (docs.length == 0) {
          site.defaultScrapingList.forEach((item) => {
            item.active = true;
            item.needBrowser = item.needBrowser || false;
            $collection.add(item, (err, doc) => {
              if (!err && doc) {
                __list.push(doc);
              }
            });
          });
        } else {
          __list = [...__list, ...docs];
        }
      }
    });
  }

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: __appName,
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compres: true,
    lang: 'en',
  });

  site.post({ name: `/api/${__appName}/add`, require: { permissions: ['login'] } }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.body;
    _data.add_user_info = req.getUserFinger();

    $collection.add(_data, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        __list.push(doc);
      } else {
        response.error = err.mesage;
      }
      res.json(response);
    });
  });

  site.post({ name: `/api/${__appName}/update`, require: { permissions: ['login'] } }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.body;
    _data.edit_user_info = req.getUserFinger();

    $collection.edit(
      {
        where: {
          id: _data.id,
        },
        set: _data,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          if ((index = __list.findIndex((itm) => itm.id === result.doc.id))) {
            if (index > -1) {
              __list[index] = result.doc;
            } else {
              __list.push(result.doc);
            }
          }
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post({ name: `/api/${__appName}/view`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    if ((ad = __list.find((itm) => itm.id == req.data.id))) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'Not Exists';
      res.json(response);
    }
  });

  site.post({ name: `/api/${__appName}/delete`, require: { permissions: ['login'] } }, (req, res) => {
    let response = {
      done: false,
    };

    $collection.delete(
      {
        id: req.data.id,
      },
      (err, result) => {
        if (!err && result.count === 1) {
          response.done = true;
          __list.splice(
            __list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err?.mesage || 'Deleted Not Exists';
        }
        res.json(response);
      }
    );
  });

  site.post({ name: `/api/${__appName}/all`, public: true }, (req, res) => {
    res.json({
      done: true,
      list: __list.filter((u) => u.id > 0),
    });
  });
};
