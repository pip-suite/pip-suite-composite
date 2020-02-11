
(function (angular, chance) {
    'use strict';

    var thisModule = angular.module('appComposite.CompositeSummary', []);

    thisModule.controller('CompositeSummaryController',
        function ($scope, pipNavService, $timeout) {

            $timeout(function () {
                $('pre code').each(function (i, block) {
                    Prism.highlightElement(block);
                });
            });

            pipNavService.appbar.removeShadow();
            pipNavService.breadcrumb.text = 'COMPOSITE_CONTROLS';

            $scope.compositeSummarySecondary = [
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
                            text: 'Efficiently simplify visionary content rather than extensive. ' +
                            'Phosfluorescently engage.',
                            checked: true
                        },
                        {
                            text: 'Phosfluorescently engage clicks-and-mortar niche markets.',
                            checked: true
                        },
                        {
                            text: 'Proactively communicate collaborative strategic theme areas for B2B ROI. Assertively.',
                            checked: false
                        },
                        {
                            text: 'Appropriately morph revolutionary leadership.',
                            checked: true
                        },
                        {
                            text: 'Conveniently redefine empowered catalysts for change vis-a-vis ' +
                            'timely action items. Continually underwhelm interactive information ' +
                            'whereas leading-edge networks.',
                            checked: true
                        }
                    ]
                },
                {
                    type: 'time',
                    text: '',
                    docs: [],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: '2015-07-31T21:00:00.000Z',
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
                },
                {
                    type: 'documents',
                    text: '',
                    docs: [
                        {
                            id: '127b18367bba4f11a92624aa45be1752',
                            name: '3'
                        },
                        {
                            id: '2de4b99b5a1643c99a5a6cad05f77323',
                            name: 'flower-631765_960_720.jpg'
                        }
                    ],
                    pic_ids: [],
                    loc_pos: null,
                    loc_name: '',
                    start: null,
                    end: null,
                    checklist: []
                }
            ];

            $scope.compositeSummary = [
                {
                    type: 'text',
                    text: chance.paragraph(),
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
                            text: 'Efficiently simplify visionary content rather than extensive. ' +
                            'Phosfluorescently engage.',
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
                            text: 'Conveniently redefine empowered catalysts for change vis-a-vis timely ' +
                            'action items. Continually underwhelm interactive information whereas ' +
                            'leading-edge networks.',
                            checked: true
                        }
                    ]
                },
                {
                    type: 'text',
                    text: chance.paragraph(),
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
                    text: chance.paragraph(),
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
                    pic_ids: [
                        {
                            id: 'd09b0260edbe4a80806b15cfde80b84e',
                            name: 'name.jpg',
                            url: ''
                        },
                        {
                            id: 'd09b0260edbe4a80806b15cfde80b84e',
                            name: 'name.jpg',
                            url: ''
                        }
                    ],
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
                    pic_ids: [
                        {
                            id: 'd09b0260edbe4a80806b15cfde80b84e',
                            name: 'name.jpg',
                            url: ''
                        },
                        {
                            id: 'd09b0260edbe4a80806b15cfde80b84e',
                            name: 'name.jpg',
                            url: ''
                        }
                    ],
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
                    start: '2015-07-31T21:00:00.000Z',
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
                    type: 'pictures',
                    text: '',
                    docs: [],
                    pic_ids: [
                        {
                            id: 'd09b0260edbe4a80806b15cfde80b84e',
                            name: 'name.jpg',
                            url: ''
                        },
                        {
                            id: 'd09b0260edbe4a80806b15cfde80b84e',
                            name: 'name.jpg',
                            url: ''
                        }
                    ],
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
                }
            ];

        }
    );

})(window.angular, window.chance);
