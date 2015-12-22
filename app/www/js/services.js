angular.module('starter.services', [])
  .factory('Chats', function ($http, $state) {
    var publicAPI = {
      all: function (successCallback, failureCallback) {
        if (online) {
          $http({
            method: 'GET',
            url: endpoint + 'products',
            headers: {
              'Authorization': currentUser.auth
            }
          }).then(successCallback, failureCallback);
        } else {
          var syncData = syncDataStorage.get();
          var products = Object.keys(syncData).reduce(function(prev, curr) {
            if (syncData[curr].data) {
              prev[curr] = syncData[curr].data;
            }
            return prev;
          }, {});
          successCallback({
            data: products
          });
        }
      },
      add: function(product, successCallback, failureCallback) {
        if (online) {
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
        } else {
          var syncData = syncDataStorage.get();
          var localId = getNewClientId();
          product.id = localId;
          syncData[localId] = {
            data: product,
            diff: product
          };
          syncDataStorage.set(syncData);
          successCallback();
        }
      },
      remove: function (product, successCallback, failureCallback) {
        if (online) {
          $http({
            method: 'DELETE',
            url: endpoint + 'products/' + parseInt(product.id),
            headers: {
              'Authorization': currentUser.auth
            }
          }).then(successCallback, failureCallback);
        } else {
          var syncData = syncDataStorage.get();
          syncData[product.id] = {
            data: null,
            diff: null
          };
          syncDataStorage.set(syncData);
          successCallback();
        }
      },
      update: function (product, successCallback, failureCallback) {
        if (online) {
          $http({
            method: 'PUT',
            url: endpoint + 'products/' + parseInt(product.id),
            data: product,
            headers: {
              'Authorization': currentUser.auth
            }
          }).then(successCallback, failureCallback);
        } else {
          var syncData = syncDataStorage.get();
          if (product.id < 0) {
            syncData[product.id].data = product;
            syncData[product.id].diff.amount = product.amount;
          } else {
            syncData[product.id] = {
              data: product,
              diff: {
                amount: product.amount
              }
            };
          }

          syncDataStorage.set(syncData);
          successCallback();
        }
      },
      sync: function(successCallback, failureCallback) {
        var syncData = syncDataStorage.get();
        var diffs = Object.keys(syncData).reduce(function(prev, curr) {
          prev[curr] = syncData[curr].diff;
          return prev;
        }, {});

        $http({
          method: 'POST',
          url: endpoint + 'sync',
          data: diffs,
          headers: {
            'Authorization': currentUser.auth
          }
        }).then(function(response) {
            srvResponseCallback(response.data, syncData, successCallback);
        }, failureCallback);
      },

      ///////////////////////////////////
      logout: function () {
        currentUser.email = '';
        currentUser.password = '';
        currentUser.hmac = '';
        currentUser.auth = '';
        window.localStorage.setItem(userKey, JSON.stringify(currentUser));
        window.localStorage.setItem("grocery.data", "{}");
        token = window.crypto.getRandomValues(new Uint32Array(1))[0];
        window.localStorage.setItem("grocery.deviceId", token);
        $state.current.data.email = '-';
      },
      login: function (user, successCallback, failureCallback) {
        console.log('[login] user', !!user);

        currentUser.email = user.email;
        currentUser.password = user.password;
        currentUser.hmac = computeHMAC(null, token, currentUser.password);
        currentUser.auth = 'hmac ' + currentUser.email + ':' + token + ':' + currentUser.hmac;
        window.localStorage.setItem(userKey, JSON.stringify(currentUser));
        $state.current.data.email = user.email;

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

    // private
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

    var computeHMAC = function (date, token, password) {
      var hash = CryptoJS.HmacSHA256('+' + token, password);
      return hash.toString(CryptoJS.enc.Base64);
    };

    var endpoint = $state.current.data.endpoint;
    var token = $state.current.data.deviceId;
    console.log("my device id", token);

    var userKey = "grocery.user";
    var currentUser = JSON.parse(window.localStorage.getItem(userKey));
    if (null === currentUser) {
      currentUser = {
        email: $state.current.data.email,
        password: 'admin',
        hmac: $state.current.data.hmac,
        auth: '' //'hmac admin@example.com:123:' + $state.current.data.hmac
      };
    } else {
      currentUser.hmac = computeHMAC(null, token, currentUser.password);
      currentUser.auth = 'hmac ' + currentUser.email + ':' + token + ':' + currentUser.hmac;
    }
    window.localStorage.setItem(userKey, JSON.stringify(currentUser));

    var online = false;
    var syncDataStorage = (function(window) {
      if (window.localStorage) {
        var key = "grocery.data";
        return {
          get: function () {
            var copy = JSON.parse(window.localStorage.getItem(key) || "{}");
            return copy;
          },
          set: function (data) {
            var copy = JSON.stringify(data);
            window.localStorage.setItem(key, copy);
          }
        }
      } else {
        console.log("There's no localStorage. Fallback to object.");
        var data = {};
        return {
          get: function() {
            var copy = data; //@todo extend angular.merge
            return copy;
          },
          set: function(newData) {
            var copy = newData; //@todo extend angular.merge
            data = copy;
          }
        }
      }
    })(window);

    var getNewClientId = function() {
      var newId = parseInt(window.localStorage.getItem("grocery.clientId") || 0) - 1;
      window.localStorage.setItem("grocery.clientId", newId);
      return newId;
    };

    var srvResponseCallback = function(response, syncData, callback) {
      for (var key in response) {
        if (response.hasOwnProperty(key)) {
          var diff = response[key];
          if (diff === null) { // remove
            delete syncData[key];
          } else if (diff.id !== undefined && diff.name !== undefined) { // add (other device)
            syncData[diff.id] = {
              data: diff
            };
          } else if (diff.id !== undefined) { // add (this device)
            var product = syncData[key];
            delete syncData[key];
            product.data.id = diff.id;
            syncData[diff.id] = product;
          } else if (diff.amount !== undefined) { // update
            syncData[key].data.amount = diff.amount;
          } else {
            console.log("[srvResponseCallback] unknown case, key:", key);
          }
        }
      }

      // mark each product as sync.
      Object.keys(syncData).forEach(function(key) {
        if (null !== syncData[key].diff) {
          syncData[key].diff = {};
        }
      });

      syncDataStorage.set(syncData);
      callback();
    };

    return publicAPI;
  });
