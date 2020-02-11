
(function (angular) {
    'use strict';

    var thisModule = angular.module('appComposite.ContentSwitch', ['pipComposite']);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            PRESS_BUTTON_FOR_SHOW_HIDE: 'Press button for show/hide content'
        });
        pipTranslateProvider.translations('ru', {
            PRESS_BUTTON_FOR_SHOW_HIDE: 'Нажмите кнопки чтоб показать/скрыть контент'
        });
    });

    thisModule.controller('ContentSwitchController',
        function ($scope, pipNavService, $timeout) {

            $timeout(function() {
                $('pre code').each(function(i, block) {
                    Prism.highlightElement(block);
                });
            });

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'COMPOSITE_CONTROLS';

            $scope.item = {
                pictureIds: [],
                docs: [],
                loc_name: '',
                loc_pos: null,
                start: null,
                end: null
            };

            $scope.contentSwitchOption = {
                picture: true,
                document: true,
                location: true,
                event: true
            };

            $scope.showPictures = true;
            $scope.showDocuments = true;
            $scope.showEvent = true;
            $scope.showLocation = true;
        }
    );

})(window.angular);
