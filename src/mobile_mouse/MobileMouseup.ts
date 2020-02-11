{
    interface IMobileMouseupAttributes extends ng.IAttributes {
        pipMobileMouseup: any;
    }

    const MobileMouseup = (scope: ng.IScope, elem: JQuery, attrs: IMobileMouseupAttributes) => {
        elem.bind("touchend mouseup", (e) => {
            scope.$apply(attrs.pipMobileMouseup);
        });
    }

    angular.module("pipMobileMouse")
        .directive('pipMobileMouseup', () => {
            return MobileMouseup;
        });
}