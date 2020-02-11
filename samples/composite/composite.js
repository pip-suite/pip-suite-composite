(function (angular, chance) {
    'use strict';

    var thisModule = angular.module('appComposite.Composite', []);

    thisModule.config(function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            FILLED: 'Filled'
        });
        pipTranslateProvider.translations('ru', {
            FILLED: 'Заполненный'
        });
    });

    thisModule.controller('CompositeController',
        function ($scope, pipNavService, $timeout) {

            $timeout(function() {
                $('pre code').each(function(i, block) {
                    Prism.highlightElement(block);
                });
            });

            $scope.emptyComposite = [];

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'COMPOSITE_CONTROLS';

            $scope.disabled = function () {
                return false;
            }

            $scope.onChange = function(compositeView) {
                // console.log('onChange', $scope.compositeView);
            }

            $scope.compositeView = [
                {
                    type: 'text',
                    text: 'Architecture is both the process and the product of planning, designing, ' +
                    'and constructing buildings and other physical structures. Architectural works, ' +
                    'in the material form of buildings, are often perceived as cultural symbols and ' +
                    'as works of art. Historical civilizations are often identified with their surviving ' +
                    'architectural achievements.',
                    docs: [],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    checklist: []
                },
                {
                    type: 'pictures',
                    text: '',
                    docs: [],
                    pic_ids: [ 'd09b0260edbe4a80806b15cfde80b84e', 'd09b0260edbe4a80806b15cfde80b84e', 'd09b0260edbe4a80806b15cfde80b84e' ],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    checklist: []
                },
                {
                    type: 'location',
                    text: '',
                    docs: [],
                    pic_ids: [],
                    loc_pos: {
                        type: 'Point',
                        coordinates: [32.393603, -110.982593]
                    },
                    loc_name: '780 W. Lost Creek Place, Tucson, AZ 85737',
                    start: null,
                    end: null,
                    checklist: []
                },
                {
                    type: 'documents',
                    text: '',
                    docs: [
                        {
                            id: '02572da356cc4b46bd4e7fee60503a4e',
                            name: '2'
                        },
                        {
                            id: '0ecf74366ea542ffb2635b452928666c',
                            name: '1'
                        }
                    ],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    checklist: []
                },
                {
                    type: 'checklist',
                    text: '',
                    docs: [],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    checklist: [
                        {
                            text: 'Efficiently simplify visionary content rather than extensive. Phosfluorescently engage.',
                            checked: true
                        },
                        {
                            text: 'Phosfluorescently engage clicks-and-mortar niche markets.',
                            checked: true
                        },
                        {
                            text: 'Следующий будет пустым',
                            checked: false
                        },
                        {
                            text: '',
                            checked: true
                        },
                        {
                            text: 'Conveniently redefine empowered catalysts for change vis-a-vis timely action items.' +
                            ' Continually underwhelm interactive information whereas leading-edge networks.',
                            checked: true
                        }
                    ]
                }
            ];

        }
    );

})(window.angular, window.chance);
