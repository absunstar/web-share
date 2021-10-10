module.exports = function init(site) {
  const $dashboard = site.connectCollection('dashboard');
  site.dashboard = null;

  site.onGET({
    name: 'dashboard',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
    public: true,
  });

  site.onGET({
    name: '/images',
    path: __dirname + '/site_files/images',
    public: true,
  });

  site.post({name : '/api/dashboard/get'  , public :true}, (req, res) => {
    let response = {
      done: false,
    };

    site.getDashboard((err, doc) => {
      if (err) {
        response.error = err.message;
      } else {
        response.done = true;
        response.doc = site.dashboard;
        res.json(response);
        return;
      }
    });
  });

  site.post({name :'/api/dashboard/save', public :true}, (req, res) => {
    let response = {
      done: false,
    };

    let data = req.data;
    if (data) {
      site.dashboard = data;
    }

    $dashboard.update(site.dashboard, (err, result) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.getDashboard = function (callback) {
    callback =
      callback ||
      function (err, doc) {
        if (err) {
          console.log(err.message);
        }
      };
    if (site.dashboard) {
      callback(null, site.dashboard);
      return;
    }

    $dashboard.find({}, (err, doc) => {
      if (!err && doc) {
        site.dashboard = doc;
        callback(null, site.dashboard);
      } else {
        let obj = {
          siteTitle: 'site title',
        };

        $dashboard.add(obj, (err, doc) => {
          if (!err && doc) {
            site.dashboard = doc;
            callback(null, site.dashboard);
          } else {
            callback(err ?? { message: 'Can Not Add Dashboard to DB' });
          }
        });
      }
    });
  };
  site.getDashboard();
};
