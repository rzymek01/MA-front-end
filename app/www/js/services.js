angular.module('starter.services', [])
  .factory('Chats', function ($http, $state) {
    // Some fake testing data
    var products = [
      //{
      //  id: 1,
      //  name: 'Apple',
      //  amount: 0,
      //  picture: ''
      //},
      //{
      //  id: 2,
      //  name: 'Peach',
      //  amount: 2,
      //  picture: ''
      //}
    ];

    var endpoint = $state.current.data.endpoint;
    var token = 123;

    var currentUser = {
      email: $state.current.data.email,
      password: 'admin',
      hmac: $state.current.data.hmac,
      auth: '' //'hmac admin@example.com:123:' + $state.current.data.hmac
    };

    var computeHMAC = function (date, token, password) {
      var hash = CryptoJS.HmacSHA256('+' + token, password);
      return hash.toString(CryptoJS.enc.Base64);
    };

    return {
      all: function (successCallback, failureCallback) {
        $http({
          method: 'GET',
          url: endpoint + 'products',
          headers: {
            'Authorization': currentUser.auth
          }
        }).then(successCallback, failureCallback);
      },
      add: function(product, successCallback, failureCallback) {
        $http({
          method: 'POST',
          url: endpoint + 'products',
          data: {
            name: product.name,
            picture: product.picture
          },
          headers: {
            'Authorization': currentUser.auth
          }
        }).then(successCallback, failureCallback);
      },
      remove: function (product, successCallback, failureCallback) {
        $http({
          method: 'DELETE',
          url: endpoint + 'products/' + parseInt(product.id),
          headers: {
            'Authorization': currentUser.auth
          }
        }).then(successCallback, failureCallback);
      },
      update: function (product, successCallback, failureCallback) {
        $http({
          method: 'PUT',
          url: endpoint + 'products/' + parseInt(product.id),
          data: product,
          headers: {
            'Authorization': currentUser.auth
          }
        }).then(successCallback, failureCallback);
      },

      ///////////////////////////////////
      logout: function () {
        currentUser.email = '';
        currentUser.password = '';
        currentUser.hmac = '';
        currentUser.auth = '';
      },
      login: function (user, successCallback, failureCallback) {
        console.log('[login] user', !!user);

        currentUser.email = user.email;
        currentUser.password = user.password;
        currentUser.hmac = computeHMAC(null, token, currentUser.password);
        currentUser.auth = 'hmac ' + currentUser.email + ':' + token + ':' + currentUser.hmac;

        console.log('hmac', currentUser.hmac);
        console.log('auth', currentUser.auth);

        $http({
          method: 'GET',
          url: endpoint + 'users',
          headers: {
            'Authorization': currentUser.auth
          }
        }).then(successCallback, failureCallback);

      },
      register: function (user, successCallback, failureCallback) {
        console.log('[register] user', !!user);

        // add user
        $http({
          method: 'POST',
          url: endpoint + 'users',
          data: {
            email: user.email,
            password: user.password
          },
          headers: {
            'Authorization': currentUser.auth
          }
        }).then(successCallback, failureCallback);
      }

    };
  });
