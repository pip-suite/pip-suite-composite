
(function (angular) {
    'use strict';

    var thisModule = angular.module('appComposite.CompositeEmpty', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            DESCRIBE_THIS: 'Descibe this...',
            CONTENT: 'Result content'
        });
        pipTranslateProvider.translations('ru', {
            DESCRIBE_THIS: 'Опишите это...',
            CONTENT: 'Содержимое результата'
        });
    });

    thisModule.controller('CompositeEmptyController',
        function ($scope, pipNavService, $timeout) {

            $timeout(function () {
                $('pre code').each(function (i, block) {
                    Prism.highlightElement(block);
                });
            });



            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'COMPOSITE_CONTROLS';

            $scope.emptyComposite = [];

            $scope.onDisableClick = function () {
                $scope.emptyChecklistDisabled = !$scope.emptyChecklistDisabled;
            };

            $scope.isDisabled = function () {
                return $scope.emptyChecklistDisabled === true;
            };

            $scope.onReset = function () {
                $scope.emptyComposite = [];
            };

            $scope.onChange = function () {
                //    console.log('onChange $scope.emptyComposite', $scope.emptyComposite); // eslint-disable-line
            };

            $scope.onSave = function () {
                if ($scope.compositeContent) {
                    console.log('compositeContent', $scope.compositeContent);
                    $scope.compositeContent.save(
                        (data) => {
                            console.log('save composite content', data);
                        },
                        (error) => {
                            console.log('save composite error', error, $scope.compositeContent);
                        }
                    );
                }
            };

            $scope.onAbort = function () {
                if ($scope.compositeContent) {
                    $scope.compositeContent.abort();
                }
            };
        }
    );

})(window.angular);
