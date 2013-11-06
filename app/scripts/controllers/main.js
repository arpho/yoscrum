'use strict';

angular.module('yoscrumApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });
  }).controller('ProjectListCtrl',function($scope,$http){
    $http.get('/api/projects').
    success(function(data) {
      $scope.projects = data;
        var customers = [];
        for (var i=0;i<data.length;i++){
            if(  customers.indexOf(data[i].customer)>-1){}
            else{
                customers.push(data[i].customer)
            }
        }
        $scope.customers = customers;
    });
  }).controller('ProjectCtrl',function($scope,$http,$routeParams){
    $http.get('api/project/'+$routeParams.ProjectId).success(function(data){
        $scope.project = data;
        console.log(data);
    })
}).controller('CustomersListCtrl',function($scope,$http){
    $http.get('/api/customers_list').
    success(function(data){
     $scope.customers = data;
    })}).controller('New_customerCtrl',function($scope,$http){
        $scope.user = {nome:'lu',cognome:'pi'};
        $scope.save = function(user){
            $http.post('api/new_customer',user)}
    }).controller('CustomerCtrl',function($scope,$http,$routeParams){
    console.log($routeParams)
    $http.get('api/customer/:'+$routeParams.CustomerId).success(function(data){
        $scope.customer = data;
    })
});
    
