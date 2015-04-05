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
        var location = {
                lat: parseFloat(message.latitude),
                lng: parseFloat(message.longitude)
        };
		var obj = {
				uid : sharedProperties.getUID(), 
				title: message.title,
				content: message.content, 
				location: location,
				privateMode: message.privateMode,
				displayName: sharedProperties.getDisplayName()
		};
		var objRef = userRef.push(obj);
        var geoRef = fbRef.child("_geofire");
        var geoFire = new GeoFire(geoRef);
        geoFire.set(objRef.name(), [location.lat, location.lng]).then(function() {
            console.log("Provided keys have been added to GeoFire");
        }, function(error) {
            console.log("Error: " + error);
        });
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
/*
=======
.controller('DashCtrl', function ($scope, $firebase, $rootScope, $ionicPopup) {
	console.log("controller called");

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
                // var location = $rootScope.coords;
                var location = {
                    lat: parseFloat($scope.message.lat),
                    lng: parseFloat($scope.message.lng)
                }
                var obj = {
                    uid : $scope.message.uid, 
                    title: $scope.message.title,
                    content: $scope.message.content, 
                    location: location,
                    privateMode: $scope.message.privateMode
                };
                var objRef = userRef.push(obj);
                var geoRef = fbRef.child("_geofire");
                var geoFire = new GeoFire(geoRef);
                geoFire.set(objRef.name(), [location.lat, location.lng]).then(function() {
                    console.log("Provided keys have been added to GeoFire");
                }, function(error) {
                    console.log("Error: " + error);
                });
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
    $scope.getCurrentLocation = new function() {
        var poll = function() {

            // onSuccess Callback
            // This method accepts a Position object, which contains the
            // current GPS coordinates
            //
            var onSuccess = function(position) {
                $scope.latitude = position.coords.latitude;
                $scope.longitude = position.coords.longitude;
                $rootScope.coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }
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

.controller('ChatsCtrl', function($scope, $firebaseArray, $rootScope) {
	console.log('ChatsCtrl');
   var ref = new Firebase("https://lahax.firebaseio.com/message");
   var testChat = $firebaseArray(ref);
  $scope.messages = testChat;
  console.log($scope.messages); 
})

.controller('MapCtrl', function ($scope, $state, $firebase, $rootScope, $ionicPopup, sharedProperties) {
    console.log("map controller called")

    $scope.updateMap = function() {
        var coords = new google.maps.LatLng($rootScope.coords.lat,
                                            $rootScope.coords.lng);
        // pan map to new location
        $rootScope.map.panTo(coords);

        // move the user marker
        $rootScope.usermarker.setMap(null);
        $rootScope.usermarker = new google.maps.Marker({
            position: coords,
            map: $rootScope.map,
            animation: google.maps.Animation.DROP,
            title:"You are here!"
        });

        // change geoFire query center
        console.log("Moving query center.")
        $rootScope.mapQuery.updateCriteria({
            center: [$rootScope.coords.lat, $rootScope.coords.lng],
            radius: 10
        })
    };

    $scope.addMarker = function(key, location, distance) {
        // add the key to the set of markers, add a marker to the map
        console.log("new message found!");
        var location = new google.maps.LatLng(location[0], location[1]);
        var marker = new google.maps.Marker({
            position: location,
            map: $rootScope.map,
            animation: google.maps.Animation.DROP,
            title:"You are here!"
        });

        $rootScope.mapMarkers[key] = marker  
    }

    $scope.removeMarker = function(key, location, distance) {
        // delete the appropriate marker from the map
        console.log("message deleted: " + key);
        var marker = $rootScope.mapMarkers[key];
        if (marker) {
            marker.setMap(null);
        }
        delete $rootScope.mapMarkers[key];
        console.log($rootScope.mapMarkers);
    }

    $scope.initializeMap = new function () {

        // initialize a default map first
        $rootScope.coords = {
            lat: 37.0,
            lng: -122.06
        }

        var coords = new google.maps.LatLng($rootScope.coords.lat, $rootScope.coords.lng);
        var mapOptions = {
            center: coords,
            zoom: 15,
            disableDefaultUI: true
        };

        $rootScope.map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

        $rootScope.usermarker = new google.maps.Marker({
            position: coords,
            map: $rootScope.map
        });

        // detect the user's current position and center the map on that location
        var onSuccess = function(position) {
            $rootScope.coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude};

            var coords = new google.maps.LatLng(position.coords.latitude, 
                                                position.coords.longitude);

            var mapOptions = {
              center: coords,
              zoom: 15,
              disableDefaultUI: true
            }

            $rootScope.map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);

            if ($rootScope.usermarker) {
                $rootScope.usermarker.setMap(null);
            }
            $rootScope.usermarker = new google.maps.Marker({
                position: coords,
                map: $rootScope.map,
                animation: google.maps.Animation.DROP
            });
        };

        // if we can't detect the user's current location, choose a preset location instead
        var onError = function(error) {
            alert('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        };

        navigator.geolocation.getCurrentPosition(onSuccess, onError);    

        // initialize the geoFire query and a dictionary of active markers
        var fbRef = new Firebase($rootScope.firebaseUrl);
        var geoRef = fbRef.child("_geofire");
        var geoFire = new GeoFire(geoRef);
        $rootScope.mapQuery = geoFire.query({
            center: [$rootScope.coords.lat, $rootScope.coords.lng],
            radius: 20
        });
        $rootScope.mapMarkers = {};

        // set up call-backs for the geoFire query
        $rootScope.mapQuery.on("key_exited", $scope.removeMarker);

        $rootScope.mapQuery.on("key_entered", $scope.addMarker);

        $rootScope.$watch("coords", $scope.updateMap, objectEquality=true);
    };

    $scope.postMessage = function() {
    	$state.go('tab.dash');
    }
})

// .controller('GeoFireCtrl', function ($scope, $firebase, $rootScope, sharedProperties) {
//     console.log("controller called")

//     $scope.postLocationKey = function(key, x_coord, y_coord) {
//         console.log("Sending Message");
//         var fbRef = new Firebase($rootScope.firebaseUrl);
//         var userRef = fbRef.child("_geofire");
//         var geoFire = new GeoFire(userRef);
//         geoFire.set(key, [parseFloat(x_coord), parseFloat(y_coord)]).then(function() {
//           console.log("Provided keys have been added to GeoFire");
//         }, function(error) {
//           console.log("Error: " + error);
//         });
//     }

//     $scope.deleteKey = function(key) {
//         console.log("Deleting message...");
//         var fbRef = new Firebase($rootScope.firebaseUrl);
//         var userRef = fbRef.child("_geofire");
//         var geoFire = new GeoFire(userRef);
//         geoFire.remove(key);
//     }

//     $scope.scanLocation = function(x, y, r) {
//         console.log("Finding Messages");
//         var fbRef = new Firebase($rootScope.firebaseUrl);
//         var userRef = fbRef.child("_geofire");
//         var geoFire = new GeoFire(userRef);
//         var geoQuery = geoFire.query({
//             center : [parseFloat(x), parseFloat(y)],
//             radius : parseFloat(r)
//         });
//         geoQuery.on("key_entered", function(key, location, distance) {
//             console.log(key + " at distance " + distance);
//         });
//     }
// })


.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, sharedProperties) {
    console.log("ChatDetailCtrl called")
  //$scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
