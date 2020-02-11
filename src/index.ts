/// <reference path="../typings/tsd.d.ts" />


import './checklist_edit/ChecklistEdit';
import './checklist_view/ChecklistView';
import './composite_edit/CompositeEdit';
import './composite_summary/CompositeSummary';
import './composite_toolbar/CompositeToolbar';
import './composite_view/CompositeView';
import './utilities/CompositeFocused';
import './mobile_mouse';
import './content_switch/ContentSwitch';
import './embedded_edit/EmbeddedEdit';
import './embedded_view/EmbeddedView';
import './data';

angular.module('pipComposite', [
    'pipContentSwitch',
    'pipChecklistEdit',
    'pipChecklistView',
    'pipCompositeEdit',
    'pipCompositeView',
    'pipCompositeSummary',
    'pipCompositeToolbar',
    'pipCompositeFocused',
    'pipMobileMouse',
    'pipEmbeddedEdit',
    'pipEmbeddedView'
]);

export * from './data';