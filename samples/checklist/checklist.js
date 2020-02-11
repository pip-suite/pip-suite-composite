(function (angular) {
    'use strict';

    var thisModule = angular.module('appComposite.Checklist', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            EMPTY: 'Empty',
            CHECK_LIST_VIEW: 'Checklist view'
        });
        pipTranslateProvider.translations('ru', {
            EMPTY: 'Пустой',
            CHECK_LIST_VIEW: 'Просмотр checklist'
        });
    });

    thisModule.controller('ChecklistController',
        function ($scope, pipNavService, $timeout) {

            $timeout(function () {
                $('pre code').each(function (i, block) {
                    Prism.highlightElement(block);
                });
            });

            init();

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'COMPOSITE_CONTROLS';

            $scope.onDisableViewClick = function () {
                $scope.emptyChecklistViewDisabled = !$scope.emptyChecklistViewDisabled;
            };

            $scope.onDisableClick = function () {
                $scope.emptyChecklistDisabled = !$scope.emptyChecklistDisabled;
            };

            $scope.isDisabled = function () {
                return $scope.emptyChecklistDisabled === true;
            };

            $scope.isDisabledView = function () {
                return $scope.emptyChecklistViewDisabled === true;
            };

            $scope.onChangeView = function (data) {
              //  console.log('checkListView changed');
            }

            $scope.onChange = function (data) {
               // console.log('checkListView changed', _.cloneDeep(data));
            }

            $scope.onReInit = function () {
                $scope.viewChecklist = _.union(
                    getCheckList({
                        size: 6,
                        optionTextType: 'paragraph'
                    }),
                    getCheckList({
                        size: 6,
                        optionTextType: 'sentence'
                    })
                );
            }

            $scope.onReset = function () {
                init();
            };

            function init() {
                $scope.emptyChecklistDisabled = false;
                $scope.emptyChecklistRebind = false;

                $scope.emptyChecklist = [];

                $scope.checklistDynamic = _.union(
                    getCheckList({
                        size: 6,
                        optionTextType: 'paragraph'
                    }),
                    getCheckList({
                        size: 6,
                        optionTextType: 'sentence'
                    })
                );

                $scope.viewChecklist = _.union(
                    getCheckList({
                        size: 6,
                        optionTextType: 'paragraph'
                    }),
                    getCheckList({
                        size: 6,
                        optionTextType: 'sentence'
                    })
                );

                $scope.viewChecklistEdit = _.union(
                    getCheckList({
                        size: 6,
                        optionTextType: 'paragraph'
                    }),
                    getCheckList({
                        size: 6,
                        optionTextType: 'sentence'
                    }), [{
                        text: 'http://www.rambler.ru',
                        checked: true
                    }]
                );
            }

            // get entity
            function getCheckList(options) {
                function getText(optionTextType, optionLength) {
                    var text;
                    if (optionTextType)
                        switch (optionTextType) {
                            case 'word':
                                text = chance.word({ length: optionLength });
                                break;
                            case 'sentence':
                                text = chance.sentence({ words: optionLength });
                                break;
                            case 'paragraph':
                                text = chance.paragraph({ sentences: optionLength });
                                break;
                        }
                    else text = chance.sentence({ words: optionLength });

                    return text;
                };

                function getChecked(onlyCheck, onlyUnCheck) {
                    if (onlyCheck) return onlyCheck;
                    if (onlyUnCheck) return onlyUnCheck;
                    var checked = chance.bool();

                    return checked;
                };

                var size = 1 + Math.floor(Math.random() * 10),
                    onlyCheck = false,
                    onlyUnCheck = false,
                    optionTextType,// {word, sentence, paragraph}
                    optionLength,
                    checklistContent = [],
                    i = 0;

                if (options) {
                    size = options.size ? options.size : size;
                    onlyCheck = options.onlyCheck === true ? options.onlyCheck : onlyCheck;
                    onlyUnCheck = options.onlyUnCheck === true ? options.onlyUnCheck : onlyUnCheck;
                    optionTextType = options.optionTextType ? options.optionTextType : null;
                    optionLength = options.optionLength ? options.optionLength : null;
                }

                for (i = 0; i < size; i++) {
                    var item = {
                        text: getText(optionTextType, optionLength),
                        checked: getChecked(onlyCheck, onlyUnCheck)
                    }

                    checklistContent.push(item);
                }

                return checklistContent;
            }

        }
    );

})(window.angular);
