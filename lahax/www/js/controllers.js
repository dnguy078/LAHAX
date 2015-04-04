angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
    console.log('Login Controller Initialized');
    console.log($rootScope.firebaseUrl);

    var ref = new Firebase($rootScope.firebaseUrl);
    var auth = $firebaseAuth(ref);

    $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.createUser = function (user) {
        console.log("Create User Function called");
        if (user && user.email && user.password && user.displayname) {
            $ionicLoading.show({
                template: 'Signing Up...'
            });

            auth.$createUser({
                email: user.email,
                password: user.password
            }).then(function (userData) {
                alert("User created successfully!");
                ref.child("users").child(userData.uid).set({
                    email: user.email,
                    displayName: user.displayname
                });
                $ionicLoading.hide();
                $scope.modal.hide();
            }).catch(function (error) {
                alert("Error: " + error);
                $ionicLoading.hide();
            });
        } else
            alert("Please fill all details");
    }

    $scope.signIn = function (user) {

        if (user && user.email && user.pwdForLogin) {
            $ionicLoading.show({
                template: 'Signing In...'
            });
            auth.$authWithPassword({
                email: user.email,
                password: user.pwdForLogin
            }).then(function (authData) {
                console.log("Logged in as:" + authData.uid);
                ref.child("users").child(authData.uid).once('value', function (snapshot) {
                    var val = snapshot.val();
                    // To Update AngularJS $scope either use $apply or $timeout
                    $scope.$apply(function () {
                        $rootScope.displayName = val;
                    });
                });
                $ionicLoading.hide();
                $state.go('tab.dash');
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }
})

.controller('DashCtrl', function ($scope, $firebase, $rootScope) {
	console.log("controller called")

	$scope.postMessage = function(message){
		console.log("Sending Message");
		var fbRef = new Firebase($rootScope.firebaseUrl);
		var userRef = fbRef.child("message");
		userRef.set({
			a : {
			 	uid : message.uid, 
				title: message.title,
				content: message.content, 
				location: message.location
			}
		});
	}
})

.controller('MapCtrl', function ($scope, $firebase, $rootScope) {
    console.log("map controller called")

    $scope.initializeMap = new function initialize() {
        var mapOptions = {
          center: { lat: -34.397, lng: 150.644},
          zoom: 8
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    }
})

.controller('GeoFireCtrl', function ($scope, $firebase, $rootScope) {
    console.log("controller called")

    $scope.postLocationKey = function(key, x_coord, y_coord) {
        console.log("Sending Message");
        var fbRef = new Firebase($rootScope.firebaseUrl);
        var userRef = fbRef.child("_geofire");
        var geoFire = new GeoFire(userRef);
        geoFire.set(key, [parseFloat(x_coord), parseFloat(y_coord)]).then(function() {
          console.log("Provided keys have been added to GeoFire");
        }, function(error) {
          console.log("Error: " + error);
        });
    }

    $scope.getKey = function(key) {
        console.log("Retrieving Message");
        var fbRef = new Firebase($rootScope.firebaseUrl);
        var userRef = fbRef.child("_geofire");
        var geoFire = new GeoFire(userRef);
        geoFire.get(key).then(function(location) {
          if (location === null) {
            console.log("Provided key is not in GeoFire");
          }
          else {
            console.log("Provided key has a location of " + location);
          }
        }, function(error) {
          console.log("Error: " + error);
        });
    }

    $scope.scanLocation = function(x, y, r) {
        console.log("Finding Messages");
        var fbRef = new Firebase($rootScope.firebaseUrl);
        var userRef = fbRef.child("_geofire");
        var geoFire = new GeoFire(userRef);
        var geoQuery = geoFire.query({
            center : [parseFloat(x), parseFloat(y)],
            radius : parseFloat(r)
        });
        geoQuery.on("key_entered", function(key, location, distance) {
            console.log(key + " at distance " + distance);
        });
    }
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
