
let btn1 = document.querySelector('#dashboard .tab-link');
if (btn1) {
  btn1.click();
}

app.controller("dashboard", function ($scope, $http) {

  $scope.dashboard = {};

  $scope.siteTemplate = [
    {
      id: 1,
      ar: 'empty',
      en: 'empty'
    },
    {
      id: 2,
      ar: 'news',
      en: 'news'
    }
  ];



  $scope.load = function (where) {
    $scope.dashboard = {};
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/dashboard/get"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.dashboard = response.data.doc
        } else {
          $scope.dashboard = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.save = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/dashboard/save",
      data: $scope.dashboard
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.load();

});