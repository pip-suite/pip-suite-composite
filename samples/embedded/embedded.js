
(function (angular) {
    'use strict';

    var thisModule = angular.module('appComposite.Embedded', ['pipEmbeddedEdit']);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            SAMPLE: 'Sample',
            DISABLED_CONTROL: 'Disabled control',
            EMBEDDED_EDIT: 'Embedded edit control',
            EMBEDDED_VIEW: 'Embedded view control'
        });
        pipTranslateProvider.translations('ru', {
            SAMPLE: 'Пример',
            DISABLED_CONTROL: 'Отключенный контрол',
            EMBEDDED_EDIT: 'Embedded edit control',
            EMBEDDED_VIEW: 'Embedded view control'
        });
    });

    thisModule.controller('EmbeddedEditController',
        function ($scope, pipNavService, $timeout) {

            $timeout(function() {
                $('pre code').each(function(i, block) {
                    Prism.highlightElement(block);
                });
            });

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'EMBEDDED_EDIT';


            $scope.embedded = {
                embed_type: 'youtube',
                embed_uri: ''
            }

            $scope.embedded1 = {
                embed_type: 'youtube',
                embed_uri: ''
            }

            $scope.embeddedViewYoutube = {
                embed_type: 'youtube',
                embed_uri: 'https://www.youtube.com/embed/Uu1WW0v8LGo?rel=0'
            }

            $scope.embeddedViewCustom = {
                embed_type: 'custom',
                embed_uri: 'https://www.youtube.com/embed/Uu1WW0v8LGo?rel=0'
            }

            $scope.onChange = function (embedType, embedUri) {
                console.log('onChange embedType', embedType);
                console.log('onChange embedUri', embedUri);
            }

            $scope.onChangeDisabled = function (embedType, embedUri) {
                console.log('onChangeDisabled embedType', embedType);
                console.log('onChangeDisabled embedUri', embedUri);
            }

            $scope.onDisabled = function () {
                return true;
            }

        
        }
    );

})(window.angular);

// custom


