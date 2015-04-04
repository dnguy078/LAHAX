.factory("Auth", ["$firebaseAuth", "$rootScope", function ($firebaseAuth, $rootScope) {
  var ref = new Firebase($rootScope.fireBaseUrl);
  return $firebaseAuth(ref);
}])