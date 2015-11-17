angular.module('starter.controllers', [])

  //.controller('DashCtrl', function ($scope) {
  //})

  .controller('ProductsCtrl', function ($scope, $ionicPopup, $timeout, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    $scope.$on('$ionicView.enter', function(e) {
      // fetch products
      showPopupWithSpinner();
      Chats.all(getSuccess, getFailure);
    });

    var rawProducts = {};
    $scope.products = [];
    $scope.product = {
      name: '',
      picture: 'http://goo.gl/BEnYzV'
    };

    //var template = '<ion-popover-view>\n  <ion-header-bar>\n    <h1 class="title">My Popover Title</h1>\n  </ion-header-bar>\n  <ion-content>\n    Hello!\n  </ion-content>\n</ion-popover-view>';
    //$scope.popover = $ionicPopover.fromTemplate(template, {
    //  scope: $scope
    //});

    $scope.remove = function (product) {
      showPopupWithSpinner('Please wait...');
      Chats.remove(product, removeSuccess, removeFailure);
    };
    $scope.add = function (product) {
      showPopupWithSpinner('Please wait...');
      Chats.add(product, addSuccess, addFailure);
    };
    $scope.inc = function (product, amount) {
      product.amount += +amount;
      showPopupWithSpinner('Please wait...');
      Chats.update(product, updateSuccess, updateFailure);
    };
    $scope.dec = function (product, amount) {
      product.amount -= +amount;
      if (product.amount < 0) {
        product.amount = 0;
      }
      showPopupWithSpinner('Please wait...');
      Chats.update(product, updateSuccess, updateFailure);
    };

    //$scope.openPopover = function($event) {
    //  $scope.popover.show($event);
    //};
    //$scope.closePopover = function() {
    //  $scope.popover.hide();
    //};
    ////Cleanup the popover when we're done with it!
    //$scope.$on('$destroy', function() {
    //  $scope.popover.remove();
    //});

    var sortProducts = function(items) {
      var keys = Object.keys(items),
        array = [];
      for (var i = 0, l = keys.length; i < l; ++i) {
        array.push(items[keys[i]]);
      }
      array.sort(function(a, b) {
        return a.name.localeCompare(b.name);
      });
      return array;
    };

    var popup = null;
    var showPopupWithSpinner = function (title) {
      popup = $ionicPopup.show({
        title: title || 'Loading data',
        template: '<ion-spinner icon="android"></ion-spinner>'
      });
    };

    var getSuccess = function (response) {
      rawProducts = response.data;
      $scope.products = sortProducts(rawProducts);

      $timeout(function () {
        popup.close();
      }, 100);
    };
    var getFailure = function (response) {
      //@todo: check response, @link https://docs.angularjs.org/api/ng/service/$http
      popup.close();
      var alert = $ionicPopup.alert({
        title: 'Error',
        subTitle: (401 == response.status) ? 'You have to log in' : 'Some error occurs during loading data'
      });
    };

    var addSuccess = function (response) {
      popup.close();
      Chats.all(getSuccess, getFailure);
      $scope.product.name = '';
    };
    var addFailure = function (response) {
      //@todo: check response, @link https://docs.angularjs.org/api/ng/service/$http
      popup.close();
      var alert = $ionicPopup.alert({
        title: 'Error',
        subTitle: (401 == response.status) ? 'You have to log in' : 'Some error occurs during adding product'
      });
    };

    var removeSuccess = function (response) {
      popup.close();
      Chats.all(getSuccess, getFailure);
    };
    var removeFailure = function (response) {
      //@todo: check response, @link https://docs.angularjs.org/api/ng/service/$http
      popup.close();
      var alert = $ionicPopup.alert({
        title: 'Error',
        subTitle: (401 == response.status) ? 'You have to log in' : 'Some error occurs during adding product'
      });
    };

    var updateSuccess = function (response) {
      popup.close();
      Chats.all(getSuccess, getFailure);
    };
    var updateFailure = function (response) {
      //@todo: check response, @link https://docs.angularjs.org/api/ng/service/$http
      popup.close();
      var alert = $ionicPopup.alert({
        title: 'Error',
        subTitle: (401 == response.status) ? 'You have to log in' : 'Some error occurs during updating product'
      });
    };
  })

  //.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
  //  $scope.chat = Chats.get($stateParams.chatId);
  //})

  .controller('AccountCtrl', function ($scope, $state, $ionicPopup, $timeout, $sce, Chats) {
    $scope.settings = {
      enableFriends: true
    };

    $scope.user = {
      email: '',
      password: ''
    };

    $scope.loginMsg = 'test';

    $scope.data = $state.current.data;

    var popup = null;

    var showPopupWithSpinner = function () {
      $scope.loginMsg = $sce.trustAsHtml('<div>Please wait...</div><ion-spinner icon="android"></ion-spinner>');
      popup = $ionicPopup.show({
        template: '<div ng-bind-html="loginMsg"></div>',
        title: 'Information',
        scope: $scope
      });
    };

    var loginSuccess = function (response) {
      console.info('login successful');
      $scope.loginMsg = 'Login successful';
      $scope.data.email = $scope.user.email;

      $scope.user.email = '';

      $timeout(function () {
        popup.close();
      }, 2000);
    };

    var loginFailure = function (response) {
      console.warn('bad login or password', response.status);
      //@todo: check response, @link https://docs.angularjs.org/api/ng/service/$http
      $scope.loginMsg = 'Bad login or password';
      $timeout(function () {
        popup.close();
      }, 2000);
    };

    var registerSuccess = function (response) {
      $scope.loginMsg = 'User has been added';
      $timeout(function () {
        popup.close();
      }, 2000);
    };

    var registerFailure = function (response) {
      $scope.loginMsg = 'Some error occurs during adding the user';
      $timeout(function () {
        popup.close();
      }, 2000);
    };

    $scope.register = function (user) {
      console.log('[register]');
      showPopupWithSpinner();
      Chats.register(user, registerSuccess, registerFailure);

      this.user.email = '';
      this.user.password = '';
    };
    $scope.login = function (user) {
      console.log('[login]');
      showPopupWithSpinner();
      Chats.login(user, loginSuccess, loginFailure);

      this.data.email = '-';
      this.user.password = '';
    };
    $scope.logout = function () {
      console.log('[log out]');
      this.data.email = '-';
      this.user.email = '';
      this.user.password = '';
      Chats.logout();
    };
  });
