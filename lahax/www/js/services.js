angular.module('starter.services', [])

/*
 sharedProperties among controllers
 */
    .service('sharedProperties', function () {
        var uid = '';
        var displayName = '';
        var timePosted = '';
        
        return {
            getUID: function () {
                return uid;
            },
            setUID: function(value) {
                uid = value;
            },
            getDisplayName: function () {
              return displayName;
            },
            setDisplayName: function(value) {
              displayName = value;
            },
            getTimePosted: function() {
                return timePosted;
            },
            setTimePosted: function(value) {
                timePosted = value;
            }

        };
    })

.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  $rootScope.firebaseUrl = "https://lahax.firebaseio.com";
  var ref = new Firebase($rootScope.firebaseUrl);
  return $firebaseAuth(ref);
}])

.factory('Chats', function($firebaseArray) {
  // Might use a resource here that returns a JSON array
  var ref = new Firebase("https://lahax.firebaseio.com/message");
  var testChat = $firebaseArray(ref);
  var testChat1 = [testChat] 
  $scope.messages = $firebaseArray(ref);
  console.log(testChat); 
  console.log(testChat1); 
  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});


