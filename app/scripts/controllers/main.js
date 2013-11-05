'use strict';

angular.module('yoscrumApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
    });
  }).controller('ProjectListCtrl',function($scope,$http){
    $http.get('/api/projects').
    success(function(data) {
      console.log('rout di ng');
      $scope.projects = data.projects;
    });
  });