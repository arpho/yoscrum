'use strict';

angular.module('yoscrumApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'scrumFilters'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'ProjectListCtrl'
      }).when('/project/:ProjectId',{
        templateUrl:'views/project.html',
        controller: 'ProjectCtrl'
    }).when('/customers',{
        templateUrl: 'views/customers.html',
        controller: 'CustomersListCtrl'
    }).when('/new_customer',{
        templateUrl:'views/new_customer.html',
        controller: 'New_customerCtrl'
    }).when('/customer/:CustomerId',{
        templateUrl: 'views/view_customer.html',
        controller:'CustomerCtrl'
    })
      .otherwise({
        redirectTo: '/'
      });
  });
