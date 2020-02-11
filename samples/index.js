
(function (angular) {
    'use strict';

    var thisModule = angular.module('appComposite',
        [
            // 3rd Party Modules
            'ui.router', 'ui.utils', 'ngResource', 'ngAria', 'ngCookies', 'ngSanitize', 'ngMessages',
            'ngMaterial', 'wu.masonry', 'LocalStorageModule', 'angularFileUpload', 'ngAnimate',
            // Modules from WebUI Framework
            'pipCommonRest', 'pipControls', 'pipComposite', 'pipNav', 'pipLayout', 'pipTheme',
            'pipDates', 'pipLocations', 'pipEntry',
            // testing data modules (have some data for example)
            // Error! Lost templates. Do not uncomment 'pipWebuiTests', 
            'pipSampleConfig',
            // Sample Application Modules
            'appComposite.Checklist',
            'appComposite.CompositeEmpty', 'appComposite.Composite', 'appComposite.CompositeView',
            'appComposite.ContentSwitch', 'appComposite.CompositeSummary', 'appComposite.MobileTouch',
            'appComposite.Embedded'
        ]
    );

    thisModule.controller('pipSampleController',
        function ($scope, $http, $rootScope, $state, $timeout, pipAppBar, pipRest, pipSession) {

            $scope.pages = [
                {
                    title: 'Checklist', state: 'checklist', url: '/checklist',
                    controller: 'ChecklistController', templateUrl: 'checklist.html'
                },
                {
                    title: 'Composite Empty', state: 'composite_empty', url: '/composite_empty',
                    controller: 'CompositeEmptyController', templateUrl: 'composite_empty.html'
                },
                {
                    title: 'Composite', state: 'composite', url: '/composite',
                    controller: 'CompositeController', templateUrl: 'composite.html'
                },
                {
                    title: 'Composite View', state: 'composite_view', url: '/composite_view',
                    controller: 'CompositeViewController', templateUrl: 'composite_view.html'
                },
                {
                    title: 'Composite Summary', state: 'composite_summary', url: '/composite_summary',
                    controller: 'CompositeSummaryController', templateUrl: 'composite_summary.html'
                },
                {
                    title: 'Content Switch', state: 'content_switch', url: '/content_switch',
                    controller: 'ContentSwitchController', templateUrl: 'content_switch.html'
                },
                {
                    title: 'Mobile Touch', state: 'mobile_touch', url: '/mobile_touch',
                    controller: 'MobileTouchController', templateUrl: 'mobile_touch.html'
                },
                {
                    title: 'Embedded controls', state: 'embedded', url: '/embedded',
                    controller: 'EmbeddedController', templateUrl: 'embedded.html'
                }
            ];

            $scope.serverUrl = 'http://alpha.pipservices.net';
            $scope.name = 'Sampler User';
            $scope.login = 'stas15';
            $scope.password = '123456';

            $scope.selected = {};
            $timeout(function () {
                $scope.selected.pageIndex = _.findIndex($scope.pages, { state: $state.current.name });
                if ($scope.selected.pageIndex == -1) {
                    $scope.selected.pageIndex = 0;
                }
                $scope.selected.state = $scope.pages[$scope.selected.pageIndex].state;
            });

            $scope.onSignin = onSignin;
            $scope.onNavigationSelect = onNavigationSelect;
            $scope.onDropdownSelect = onDropdownSelect;
            $scope.isEntryPage = isEntryPage;

            $scope.onSignin();

            return;

            function onSignin() {
                $scope.processing = true;
                pipRest.getResource('signin').call({
                    login: $scope.login,
                    password: $scope.password
                },
                    (data) => {
                        pipRest.setHeaders({
                            'x-session-id': data.id
                        });
                        $http.defaults.headers.common['x-session-id'] = data.id;
                        // $http.defaults.headers.common['session-id'] = sessionId;
                        let session = {
                            sessionId: data.id,
                            userId: data.user_id
                        }
                        pipSession.open(session);
                        $scope.processing = false;

                    },
                    (error) => {
                        $scope.processing = false;
                    });
            }

            function onNavigationSelect(state) {
                $state.go(state);
                $scope.selected.pageIndex = _.findIndex($scope.pages, { state: state });
                if ($scope.selected.pageIndex == -1) {
                    $scope.selected.pageIndex = 0;
                }
                $scope.selected.state = $scope.pages[$scope.selected.pageIndex].state;
            }

            function onDropdownSelect(obj) {
                if ($state.current.name !== obj.state) {
                    $state.go(obj.state);
                }
            }

            function isEntryPage() {
                return $state.current.name === 'signin' || $state.current.name === 'signup' ||
                    $state.current.name === 'recover_password' || $state.current.name === 'post_signup';
            }

        }
    );

})(window.angular);
