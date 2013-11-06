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
    });
  }).controller('ProjectCtrl',function($scope,$http,$routeParams){
    $http.get('api/project/'+$routeParams.ProjectId).success(function(data){
        $scope.project = data;
        console.log(data)
    })
});