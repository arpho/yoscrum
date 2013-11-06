'use strict';

angular.module('yoscrumApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'ProjectListCtrl'
      }).when('/project/:ProjectId',{
        templateUrl:'views/project.html',
        controller: 'ProjectCtrl'
    })
      .otherwise({
        redirectTo: '/'
      });
  });
