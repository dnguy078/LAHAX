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

.controller('RoomsCtrl', function ($scope, Rooms) {
    console.log("Rooms Controller initialized");
    $scope.rooms = Rooms.all(); 
})

.controller('DashCtrl', function ($scope, $firebase, $rootScope, $ionicPopup) {
	console.log("controller called")
/*
	$scope.postMessage = function(message){
		console.log("Sending Message");
		var fbRef = new Firebase($rootScope.firebaseUrl);
		var userRef = fbRef.child("message");
		var obj = {
				uid : message.uid, 
				title: message.title,
				content: message.content, 
				location: message.location
		};
		userRef.push(obj);

	}

	$scope.showPopup = function() {
		$scope.data = {};
	   var myPopup = $ionicPopup.show({
	 	 templateUrl: 'popup-postmessage.html',
	     title: 'Create message',
	     subTitle: 'Craft your message',
	     scope: $scope,
	     buttons: [
	       { text: 'Cancel' } 
	     ]
	   });
	   myPopup.then(function(res) {
	     console.log('Tapped!', res);
	   });
  	};
  	*/
})

.controller('ChatsCtrl', function($scope, $firebaseArray) {
  var ref = new Firebase("https://lahax.firebaseio.com/message");
  var testChat = $firebaseArray(ref);
  $scope.messages = $firebaseArray(ref);
  console.log($scope.messages); 
})

.controller('MapCtrl', function ($scope, $firebase, $rootScope, $ionicPopup) {
    console.log("map controller called")

    $scope.updateMap = function () {
        console.log("Map updated.");
        console.log("latitude: " + $rootScope.coords.lat + "\n" + "longitude: " + $rootScope.coords.lng);
        var coords = new google.maps.LatLng($rootScope.coords.lat,
                                            $rootScope.coords.lng);

        var mapOptions = {
            center: coords,
            zoom: 15
        }

        $rootScope.map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

        $rootScope.usermarker = new google.maps.Marker({
            position: coords,
            map: $rootScope.map,
            animation: google.maps.Animation.DROP,
            title:"You are here!"
        })
    }

    $scope.initializeMap = new function () {
        var onSuccess = function(position) {
            $rootScope.coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude}
            var coords = new google.maps.LatLng(position.coords.latitude, 
                                                position.coords.longitude);

            var mapOptions = {
              center: { lat: $rootScope.coords.lat, lng: $rootScope.coords.lng},
              zoom: 15
            };

            $rootScope.map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);

            $rootScope.usermarker = new google.maps.Marker({
                position: coords,
                map: $rootScope.map,
                animation: google.maps.Animation.DROP,
                title:"You are here!"
            })

            $rootScope.$watch("coords", $scope.updateMap, objectEquality=true);
        };

        // onError Callback receives a PositionError object
        //
        var onError = function(error) {
            alert('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');

            var mapOptions = {
              center: { lat: 44.0722, lng: 118.4441},
              zoom: 8
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    $scope.postMessage = function(message, self){
		console.log("Sending Message");
		var fbRef = new Firebase($rootScope.firebaseUrl);
		var userRef = fbRef.child("message");
		var obj = {
				uid : message.uid, 
				title: message.title,
				content: message.content, 
				location: message.location
		};
		userRef.push(obj);
	}


    $scope.cameraClick = function(){




        
    }

	$scope.showPopup = function() {
		$scope.message = {privateMode : false};
	   var myPopup = $ionicPopup.show({
	     title: 'Create message',
	     subTitle: 'Craft your message',
	     templateUrl: '/templates/popup-postmessage.html',
	     scope: $scope,
	     buttons: [
	  
	       {
        	text: '<b>Post</b>',
        	type: 'button-positive',
        	onTap: function(e) {
          		var fbRef = new Firebase($rootScope.firebaseUrl);
				var userRef = fbRef.child("message");
				var obj = {
					uid : $scope.message.uid, 
					title: $scope.message.title,
					content: $scope.message.content, 
					location: $scope.message.location,
					privateMode: $scope.message.privateMode
				};
				userRef.push(obj);
	        }
	      },
	      { text: 'Cancel',
	         type: 'button-assertive' }
	     ]
	   });

	   myPopup.then(function(res) {
	     console.log('Tapped!', res);
	   });
  	};
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

    $scope.getCurrentLocation = new function() {
        var poll = function() {

            // onSuccess Callback
            // This method accepts a Position object, which contains the
            // current GPS coordinates
            //
            var onSuccess = function(position) {
                $scope.latitude = position.coords.latitude;
                $scope.longitude = position.coords.longitude;
                $rootScope.coords.lat = position.coords.latitude;
                $rootScope.coords.lng = position.coords.longitude;
                $scope.$apply();
            };

            // onError Callback receives a PositionError object
            //
            var onError = function(error) {
                alert('code: '    + error.code    + '\n' +
                      'message: ' + error.message + '\n');
            }
            
            navigator.geolocation.getCurrentPosition(onSuccess, onError);

            setTimeout(function() {
                console.log("Called.")
                navigator.geolocation.getCurrentPosition(onSuccess, onError);
                poll();
            }, 10000);
        }
        poll();
    }
})


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    console.log("ChatDetailCtrl called")
  //$scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
