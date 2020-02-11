
(function (angular, chance) {
    'use strict';

    var thisModule = angular.module('appComposite.CompositeView', ['pipComposite']);

    thisModule.controller('CompositeViewController',
        function ($scope, pipNavService, $timeout) {

            $timeout(function() {
                $('pre code').each(function(i, block) {
                    Prism.highlightElement(block);
                });
            });

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'COMPOSITE_CONTROLS';

            $scope.emptyComposite = [];

            $scope.onDisableClick = function () {
                $scope.emptyCompositeViewDisabled = !$scope.emptyCompositeViewDisabled;
            };

            $scope.isDisabled = function () {
                return $scope.emptyCompositeViewDisabled === true;
            };

            $scope.showAlert = function () {
             //   console.log('click'); // eslint-disable-line
            };

            $scope.item = {
                name: 'Name parent goal or vision',
                status1: 'Status1',
                status2: 'Status2'
            };

            $scope.compositeView = [
                {
                    type: 'text',
                    text: 'Architecture is both the process and the product of planning, designing, ' +
                    'and constructing buildings and other physical structures. Architectural works, ' +
                    'in the material form of buildings, are often perceived as cultural symbols and as works of art. ' +
                    'Historical civilizations are often identified with their surviving architectural achievements.',
                    docs: [],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    checklist: []
                },
                {
                    type: 'text',
                    text: '### "Architecture" can mean:',
                    docs: [],
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
                            text: 'A general term to describe buildings and other physical structures',
                            checked: true
                        },
                        {
                            text: 'The art and science of designing buildings and (some) nonbuilding structures',
                            checked: true
                        },
                        {
                            text: 'The style of design and method of construction of buildings ' +
                            'and other physical structures',
                            checked: true
                        },
                        {
                            text: 'Knowledge of art, science, technology and humanity',
                            checked: true
                        },
                        {
                            text: 'The practice of the architect, where architecture means offering ' +
                            'or rendering professional services in connection with the design and construction ' +
                            'of buildings, or built environments',
                            checked: true
                        },
                        {
                            text: 'The design activity of the architect, from the macro-level (urban design, ' +
                            'landscape architecture) to the micro-level (construction details and furniture).',
                            checked: true
                        }
                    ]
                },
                {
                    type: 'documents',
                    text: '',
                    docs: [
                        {
                            id: 'd1a56261932b44ada117a9d84df2b63b',
                            name: 'OikM2EZ2YDQ.jpg'
                        },
                        {
                            id: 'd62725a623b14756b11ad37d84103ef3',
                            name: 'veloster-menu-768x432.jpg'
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
                    type: 'embedded',
                    text: '',
                    docs: [],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    embed_type: 'youtube',
                    embed_uri: 'https://www.youtube.com/embed/Uu1WW0v8LGo?rel=0',
                    checklist: []
                },
                {
                    type: 'pictures',
                    text: '',
                    docs: [],
                    pic_ids: ['d1a56261932b44ada117a9d84df2b63b', 'd62725a623b14756b11ad37d84103ef3'],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    checklist: []
                },
                {
                    type: 'time',
                    text: '',
                    docs: [],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: '2015-08-31T21:00:00.000Z',
                    checklist: []
                },
                {
                    type: 'time',
                    text: '',
                    docs: [],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: '2015-07-31T21:00:00.000Z',
                    end: '2015-08-31T21:00:00.000Z',
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
                }
            ];

        }
    );
})(window.angular, window.chance);
