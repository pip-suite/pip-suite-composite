export const CompositeFocusedEvent: string = 'focusedComposite'; 

{
    class CompositeFocusedController {
        constructor(
            $element: JQuery,
            $rootScope: angular.IRootScopeService
        ) {
            $element.bind("touchstart mousedown", (e) => {
                $rootScope.$broadcast(CompositeFocusedEvent);
            });
        }
    }

    const CompositeFocused = function () {
        return {
            restrict: 'A',
            scope: false,
            controller: CompositeFocusedController
        }
    }

    angular.module("pipCompositeFocused", [])
        .directive('pipCompositeFocused', CompositeFocused);

}