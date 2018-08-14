angular.module('BlocksApp').controller('NftController', function($stateParams, $rootScope, $scope,$http,$location) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
    });
    var activeTab = $location.url().split('#');
    if (activeTab.length > 1)
      $scope.activeTab = activeTab[1];

    $rootScope.$state.current.data["pageSubTitle"] = $stateParams.hash; //replace with token name
    $scope.addrHash = isAddress($stateParams.hash) ? $stateParams.hash : undefined;
    var address = $scope.addrHash;
  console.log("address is ",address)

    $http({
      method: 'POST',
      url: '/nftrelay',
      data: {"action": "info", "address": address}
    }).success(function(data) {
      console.log(data)
      $scope.token = data;
      $scope.token.address = address;
      $scope.addr = {"bytecode": data.bytecode};
      if (data.name)
        $rootScope.$state.current.data["pageTitle"] = data.name;
    });

})
.directive('transferNfts', function($http) {
  return {
    restrict: 'E',
    templateUrl: '/views/transfer-nfts.html',
    scope: false,
    link: function(scope, elem, attrs){

      scope.getTransferNfts = function(last,order) {
        var data = {"action": "transferNfts"};
        data.last_id = last;
        data.order = order;
        data.address = scope.addrHash;

        $http({
          method: 'POST',
          url: '/nftrelay',
          data: data
        }).success(function(data) {
          scope.transfer_nfts = data.transList;
          scope.infoMaps = data.infoMaps;
        });
      }
      scope.getTransferNfts(-1,0)
   }
  }
})
.directive('contractSource', function($http) {
  return {
    restrict: 'E',
    templateUrl: '/views/contract-source.html',
    scope: false,
    link: function(scope, elem, attrs){
        //fetch contract stuff
        $http({
          method: 'POST',
          url: '/compile',
          data: {"addr": scope.addrHash, "action": "find"}
        }).success(function(data) {
          scope.contract = data;
        });
      }
  }
})
