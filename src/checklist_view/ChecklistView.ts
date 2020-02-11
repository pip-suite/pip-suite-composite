import { ChecklistItem } from '../data';
{

    interface IChecklistViewBindings {
        [key: string]: any;

        ngDisabled: any;
        pipChanged: any;
        pipOptions: any;
        pipRebind: any;
    }

    const ChecklistViewBindings: IChecklistViewBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipOptions: '=',
        pipRebind: '<?'
    }

    class ChecklistViewBindingsChanges implements ng.IOnChangesObject, IChecklistViewBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject<boolean>;
        pipChanged: ng.IChangesObject<(data: ChecklistItem[]) => ng.IPromise<void>>;
        pipOptions: ng.IChangesObject<ChecklistItem[]>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class ChecklistViewController {
        public ngDisabled: boolean;
        public pipChanged: Function;
        public pipOptions: ChecklistItem[]; 
        public pipRebind: boolean;

        private isChanged: boolean = false;

        constructor(
            private $element: JQuery
        ) {
            "ngInject";

            if (!this.pipOptions || !_.isArray(this.pipOptions)) {
                this.pipOptions = [];
            }

            $element.addClass('pip-checklist-view');

        }

        public $onChanges(changes: ChecklistViewBindingsChanges) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipOptions && changes.pipOptions.currentValue) {
                    if (!angular.equals(this.pipOptions, changes.pipOptions.currentValue)) {
                        if (!this.isChanged) {
                            this.pipOptions = changes.pipOptions.currentValue;
                        } else {
                            this.isChanged = false;
                        }
                    }
                }
            }
        }

        private toBoolean(value: any): boolean {
            if (value == null) return false;
            if (!value) return false;
            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }

        public onChecklistChange(): void {
            this.isChanged = true;
            if (this.pipChanged) {
                this.pipChanged(this.pipOptions);
            }
        }

        public onClick($event: JQueryEventObject, item: ChecklistItem): void { 
            if ($event) {
                $event.stopPropagation();
            }
            if (this.ngDisabled) {
                return;
            }

            this.onChecklistChange();
        }
    }

    const ChecklistView: ng.IComponentOptions = {
        bindings: ChecklistViewBindings,
        templateUrl: 'checklist_view/ChecklistView.html',
        controller: ChecklistViewController
    }

    angular.module("pipChecklistView", ['pipComposite.Templates'])
        .component('pipChecklistView', ChecklistView);

}
