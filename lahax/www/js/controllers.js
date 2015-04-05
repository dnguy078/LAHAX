angular.module('starter.controllers', [])


.controller('LoginCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope, sharedProperties) {
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

                //$scope.getUserInfo(user);
                //
                //
                ////once signed in, store user name and unique id
			    var uniqueID = authData.uid.split(':');
			    $scope.uid = uniqueID[1];
			    sharedProperties.setUID(uniqueID[1]);
				var reff = new Firebase("https://lahax.firebaseio.com/users/" + authData.uid);
				reff.once("value", function(data) {
					sharedProperties.setDisplayName(data.val().displayName);
				});
				
            }).catch(function (error) {
                alert("Authentication failed:" + error.message);
                $ionicLoading.hide();
            });
        } else
            alert("Please enter email and password both");
    }

})

.controller('RoomsCtrl', function ($scope, Rooms, sharedProperties) {
    console.log("Rooms Controller initialized");
    $scope.rooms = Rooms.all(); 
})

.controller('DashCtrl', function ($scope, $firebase, $rootScope, $ionicPopup, sharedProperties) {
	console.log("controller called")
	console.log(sharedProperties.getUID());

	$scope.postMessage = function(message){
		if ( message.privateMode === undefined ) {
			message.privateMode = false;
		}
		console.log("Sending Message");
		var fbRef = new Firebase($rootScope.firebaseUrl);
		var userRef = fbRef.child("message");
		var obj = {
				uid : sharedProperties.getUID(), 
				title: message.title,
				content: message.content, 
				location: message.location,
				privateMode: message.privateMode,
				displayName: sharedProperties.getDisplayName()
		};
		userRef.push(obj);

	}
/*
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

.controller('MapCtrl', function ($scope, $state, $firebase, $rootScope, $ionicPopup, sharedProperties) {
    console.log("map controller called")

    $scope.updateMap = function() {
        
    }

    $scope.initializeMap = new function () {
        var onSuccess = function(position) {
            $rootScope.latitude = position.coords.latitude;
            $rootScope.longitude = position.coords.longitude;
            var coords = new google.maps.LatLng($rootScope.latitude, $rootScope.longitude);

            var mapOptions = {
              center: { lat: $rootScope.latitude, lng: $rootScope.longitude},
              zoom: 15
            };

            var map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);

            var marker = new google.maps.Marker({
                position: coords,
                map: map,
                animation: google.maps.Animation.DROP,
                title:"You are here!"
            })
        };

        // onError Callback receives a PositionError object
        //
        var onError = function(error) {
            alert('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');

            var mapOptions = {
              center: { lat: 43.0722, lng: 118.4441},
              zoom: 8
            };
            var map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }

    $scope.postMessage = function() {
    	$state.go('tab.dash');
    }
/*
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
  	*/
})

.controller('GeoFireCtrl', function ($scope, $firebase, $rootScope, sharedProperties) {
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


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, sharedProperties) {
    console.log("ChatDetailCtrl called")
  //$scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
