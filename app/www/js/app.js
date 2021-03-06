// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

  .run(function ($ionicPlatform, $rootScope, $location) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    //// register listener to watch route changes
    //$rootScope.$on("$locationChangeStart", function (event, next, current) {
    //  if (!$rootScope.isLogged) {
    //    // no logged user, we should be going to #login
    //    if (~next.indexOf('/tab/account')) {
    //      // already going to #login, no redirect needed
    //    } else {
    //      // not going to #login, we should redirect now
    //      $location.path("/tab/account");
    //    }
    //  }
    //});
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    console.log("[app init]");
    var deviceId = window.localStorage.getItem("grocery.deviceId");
    if (null === deviceId) {
      deviceId = window.crypto.getRandomValues(new Uint32Array(1))[0];
      window.localStorage.setItem("grocery.deviceId", deviceId);
    }

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        data: {
          endpoint: 'https://secure-springs-6529.herokuapp.com/v1/',
          //endpoint: 'http://localhost:3000/v1/',
          hmac: 'WaiuHOe6qKR+YM5wHVhrH5PUUbzuy7lbxzHbMv1I0C8=',
          email: '-',
          deviceId: deviceId
        }
      })

      .state('tab.products', {
        url: '/products',
        views: {
          'tab-products': {
            templateUrl: 'templates/tab-products.html',
            controller: 'ProductsCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/account');

  });
