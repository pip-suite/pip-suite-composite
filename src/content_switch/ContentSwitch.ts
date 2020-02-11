{
    interface IContentSwitchAttributes extends angular.IAttributes {
        pipParentElementName: any;
    }

    interface IContentSwitchScope extends angular.IScope {
        onButtonClick: any;
        contentSwitchOption: any;
        showIconPicture: any;
        showIconDocument: any;
        showIconEvent: any;
        showIconLocation: any;
        showEvent: any;
        showDocuments: any;
        showLocation: any;
        showPictures: any;
    }

    class ContentSwitchLink {
        private parentElementNameGetter: any;
        private parentElement: any;

        constructor(
            private $parse: ng.IParseService,
            private $scope: IContentSwitchScope,
            private $element: JQuery,
            private $attrs: IContentSwitchAttributes
        ) {
            "ngInject";
            
            this.parentElementNameGetter = $parse($attrs.pipParentElementName);
            this.parentElement = this.parentElementNameGetter($scope);
            this.setOption();
        }

        private scrollTo(childElement): void {
            setTimeout(() => {
                let modDiff: number = Math.abs($(this.parentElement).scrollTop() - $(childElement).position().top);
                if (modDiff < 20) {
                    return;
                }
                let scrollTo = $(this.parentElement).scrollTop() + ($(childElement).position().top - 20);
                $(this.parentElement).animate({
                    scrollTop: scrollTo + 'px'
                }, 300);
            }, 100);
        };

        private setOption(): void {
            // todo
            if (this.$scope.contentSwitchOption !== null && this.$scope.contentSwitchOption !== undefined) {
                this.$scope.showIconPicture = this.$scope.contentSwitchOption.picture ? this.$scope.contentSwitchOption.picture : this.$scope.showIconPicture;
                this.$scope.showIconDocument = this.$scope.contentSwitchOption.document ? this.$scope.contentSwitchOption.document : this.$scope.showIconDocument;
                this.$scope.showIconLocation = this.$scope.contentSwitchOption.location ? this.$scope.contentSwitchOption.location : this.$scope.showIconLocation;
                this.$scope.showIconEvent = this.$scope.contentSwitchOption.event ? this.$scope.contentSwitchOption.event : this.$scope.showIconEvent;
            } else {
                this.$scope.showIconPicture = true;
                this.$scope.showIconDocument = true;
                this.$scope.showIconLocation = true;
                this.$scope.showIconEvent = true;
            }
        };

        public onButtonClick(type: string): void {
            if (!this.parentElement) return;

            switch (type) {
                case 'event':
                    // On Event click action
                    if (this.$scope.showEvent)
                        scrollTo('.event-edit');
                    break;
                case 'documents':
                    // On Documents click action
                    if (this.$scope.showDocuments)
                        scrollTo('.pip-document-list-edit');
                    break;
                case 'pictures':
                    // On Pictures click action
                    if (this.$scope.showPictures)
                        scrollTo('.pip-picture-list-edit');
                    break;
                case 'location':
                    // On Location click action
                    if (this.$scope.showLocation)
                        scrollTo('.pip-location-edit');
                    break;
            };
        };


    }

    const ContentSwitch = function ($parse: ng.IParseService) {
        return {
            restrict: 'EA',
            scope: false,
            templateUrl: 'content_switch/ContentSwitch.html',
            link: function (
                $scope: IContentSwitchScope,
                $element: JQuery,
                $attrs: IContentSwitchAttributes
            ) {
                new ContentSwitchLink($parse, $scope, $element, $attrs);
            }
        }
    }

    angular.module("pipContentSwitch", ['pipComposite.Templates'])
        .directive('pipContentSwitch', ContentSwitch);

}