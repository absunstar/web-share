app.controller('scrapingList', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.appName = 'scrapingList';
  $scope.mode = 'add';
  $scope.structure = {
    active: true,
    needBrowser: false,
    url: '',
    selector: '',
  };
  $scope.data = {};

  $scope.showAdd = function (_data) {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.data = { ...$scope.structure };
    site.showModal('#scrapingListManageModal');
  };

  $scope.add = function (_data) {
    $scope.error = '';
    const v = site.validated('#scrapingListManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: `/api/${$scope.appName}/add`,
      data: $scope.data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#scrapingListManageModal');
          site.resetValidated('#scrapingListManageModal');
          $scope.getAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showUpdate = function (_data) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.view(_data);
    $scope.data = {};
    site.showModal('#scrapingListManageModal');
  };

  $scope.update = function (_data) {
    $scope.error = '';
    const v = site.validated('#scrapingListManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: `/api/${$scope.appName}/update`,
      data: _data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#scrapingListManageModal');
          site.resetValidated('#scrapingListManageModal');
          $scope.getAll();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showView = function (_data) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.data = {};
    $scope.view(_data);
    site.showModal('#scrapingListManageModal');
  };

  $scope.view = function (_data) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: `/api/${$scope.appName}/view`,
      data: {
        id: _data.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.data = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showDelete = function (_data) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.data = {};
    $scope.view(_data);
    site.showModal('#scrapingListManageModal');
  };

  $scope.delete = function (_data) {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: `/api/${$scope.appName}/delete`,
      data: {
        id: $scope.data.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#scrapingListManageModal');
          $scope.getAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getAll = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: `/api/${$scope.appName}/all`,
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#articleSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.showSearch = function () {
    $scope.error = '';
    site.showModal('#scrapingListSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getAll($scope.search);
    site.hideModal('#articleSearchModal');
    $scope.search = {};
  };

  $scope.getAll();
});
