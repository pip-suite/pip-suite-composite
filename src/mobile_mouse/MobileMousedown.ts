{
    interface IMobileMousedownAttributes extends ng.IAttributes {
        pipMobileMousedown: any;
    }

    const MobileMousedown = (scope: ng.IScope, elem: JQuery, attrs: IMobileMousedownAttributes) => {
        elem.bind("touchstart mousedown", (e) => {
            scope.$apply(attrs.pipMobileMousedown);
        });
    }

    angular.module("pipMobileMouse")
        .directive('pipMobileMousedown', () => {
            return MobileMousedown;
        });
}