import { CompositeEmptyEvent, CompositeAddItemEvent } from '../composite_edit/CompositeEdit';

export class CompositeAddItemEventParams {
    public type: string;
    public id: string;
}

export class CompositeToolbarButton {
    public picture: boolean = true;
    public document: boolean = true;
    public location: boolean = true;
    public event: boolean = true;
    public checklist: boolean = true;
    public text: boolean = true;
}

{
    const translateConfig = function (pipTranslateProvider) {
        pipTranslateProvider.translations('en', {
            'TEXT': 'Text',
            'CHECKLIST': 'Checklist',
            'LOCATION': 'Location',
            'PICTURE': 'Picture',
            'TIME': 'Time',
            'DOCUMENT': 'Document'
        });

        pipTranslateProvider.translations('ru', {
            'TEXT': 'Текст',
            'CHECKLIST': 'Список',
            'LOCATION': 'Локация',
            'PICTURE': 'Изображение',
            'TIME': 'Время',
            'DOCUMENT': 'Document'
        });
    }

    interface ICompositeToolbarBindings {
        [key: string]: any;

        ngDisabled: any;
        emptyState: any;
        pipToolbarButton: any;
        compositeId: any;
    }

    const CompositeToolbarBindings: ICompositeToolbarBindings = {
        ngDisabled: '<?',
        emptyState: '<?pipCompositeEmpty', // Set init state of toolbar
        pipToolbarButton: '=?', // Set visibility of toolbar button, true by default
        compositeId: '=?pipCompositeId', // Set pip-composite-id, for several composite components in one scope
    }

    class CompositeToolbarBindingsChanges implements ng.IOnChangesObject, ICompositeToolbarBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject< boolean >;
        emptyState: ng.IChangesObject< boolean >;
        pipToolbarButton: ng.IChangesObject<CompositeToolbarButton>;;
        compositeId: ng.IChangesObject<string>;
    }

    class CompositeToolbarController {
        private cleanupCompositeEvent: any;

        public toolbarButton: CompositeToolbarButton;

        public ngDisabled: boolean;
        public emptyState: boolean;
        public pipToolbarButton: CompositeToolbarButton;
        public compositeId: string;

        constructor(
            private $rootScope: ng.IRootScopeService,
            private $element: JQuery
        ) {
"ngInject";

            this.toolbarButton = new CompositeToolbarButton();

            this.setOption();

            $element.addClass('pip-composite-toolbar');

            this.cleanupCompositeEvent = this.$rootScope.$on(CompositeEmptyEvent, (event: ng.IAngularEvent, value: boolean) => {
                this.emptyState = !value;
            });
        }

        public $onDestroy() {
            if (angular.isFunction(this.cleanupCompositeEvent)) {
                this.cleanupCompositeEvent();
            }
        }

        public $onChanges(changes: CompositeToolbarBindingsChanges) {
            if (changes.pipToolbarButton && changes.pipToolbarButton.currentValue) {
                this.setOption();
            }
        }

        public toBoolean(value: any): boolean {
            if (value == null) return false;
            if (!value) return false;
            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }

        public onAddItem(contentType: string): void {
            let params: CompositeAddItemEventParams = {
                type: contentType,
                id: this.compositeId
            };

            this.$rootScope.$emit(CompositeAddItemEvent, params);
        };

        public setOption(): void {
            _.assign(this.pipToolbarButton, this.pipToolbarButton);
            this.toolbarButton.text = true;
            // if (this.pipToolbarButton !== null && this.pipToolbarButton !== undefined) {
            //     this.toolbarButton.picture = this.pipToolbarButton.picture === false ? this.pipToolbarButton.picture : true;
            //     this.toolbarButton.document = this.pipToolbarButton.document === false ? this.pipToolbarButton.document : true;
            //     this.toolbarButton.location = this.pipToolbarButton.location === false ? this.pipToolbarButton.location : true;
            //     this.toolbarButton.event = this.pipToolbarButton.event === false ? this.pipToolbarButton.event : true;
            //     this.toolbarButton.checklist = this.pipToolbarButton.checklist === false ? this.pipToolbarButton.checklist : true;
            // } else {
            //     this.toolbarButton.picture = true;
            //     this.toolbarButton.document = true;
            //     this.toolbarButton.location = true;
            //     this.toolbarButton.event = true;
            //     this.toolbarButton.checklist = true;
            // }
            // this.toolbarButton.text = true;
        };
    }


    const CompositeToolbar: ng.IComponentOptions = {
        bindings: CompositeToolbarBindings,
        templateUrl: 'composite_toolbar/CompositeToolbar.html',
        controller: CompositeToolbarController
    }

    angular.module("pipCompositeToolbar", ['pipComposite.Templates'])
        .config(translateConfig)
        .component('pipCompositeToolbar', CompositeToolbar);

}