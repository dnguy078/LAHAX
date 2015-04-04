.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  $rootScope.fireBaseUrl = "https://lahax.firebaseio.com/";
  var ref = new Firebase($rootScope.fireBaseUrl);
  return $firebaseAuth(ref);
}])