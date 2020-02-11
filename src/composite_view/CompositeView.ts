import { ContentBlock } from '../data';
{
    interface ICompositeViewBindings {
        [key: string]: any;

        ngDisabled: any;
        pipDisabledChecklist: any;
        pipChanged: any;
        pipContents: any;
        pipRebind: any;
    }

    const CompositeViewBindings: ICompositeViewBindings = {
        ngDisabled: '<?',
        pipDisabledChecklist: '<?',
        pipChanged: '=?',
        pipContents: '=?',
        pipRebind: '<?'
    }

    class CompositeViewBindingsChanges implements ng.IOnChangesObject, ICompositeViewBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject<boolean>;
        pipDisabledChecklist: ng.IChangesObject<boolean>;
        pipChanged: ng.IChangesObject<() => ng.IPromise<void>>;
        pipContents: ng.IChangesObject<ContentBlock[]>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class CompositeViewController implements ICompositeViewBindings {
        public ngDisabled: boolean;
        public pipDisabledChecklist: boolean;
        public pipChanged: Function;
        public pipContents: ContentBlock[];
        public pipRebind: boolean;

        public compositeContent: ContentBlock[];

        private selected: any = {};

        constructor(
            private $element: JQuery,
            private $attrs: ng.IAttributes
        ) {
            "ngInject";

            $element.addClass('pip-composite-view');
            this.selected.isChanged = false;
            this.pipContents = _.isArray(this.pipContents) ? this.pipContents : [];

            this.generateList(this.pipContents);
        }

        public $onChanges(changes: CompositeViewBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
                if (this.pipRebind && changes.pipContents && _.isArray(changes.pipContents.currentValue)) {
                    this.selected.isChanged === true ? this.selected.isChanged = false : this.generateList(changes.pipContents.currentValue);
                }
            }

            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }

            if (changes.pipDisabledChecklist && changes.pipDisabledChecklist.currentValue !== changes.pipDisabledChecklist.previousValue) {
                this.pipDisabledChecklist = changes.pipDisabledChecklist.currentValue;
            }
        }
        
        private getPicIds(ids: string[]): pip.pictures.Attachment[] {
            let result: pip.pictures.Attachment[] = [];

            _.each(ids, (id: string) => {
                let item: pip.pictures.Attachment = {
                    id: id
                }

                result.push(item);
            })

            return result;
        }

        private updateContents(): void {
            this.selected.isChanged = true;
            this.pipContents = this.compositeContent;
        }

        public isDisabled(): boolean {
            return this.pipDisabledChecklist === true || this.ngDisabled === true;
        }

        public onContentChange(): void {
            this.updateContents();
            if (this.pipChanged) {
                this.pipChanged(this.pipContents);
            }
        }

        public onCompositeChange(): void {
            this.updateContents();
            if (this.pipChanged)
                this.pipChanged(this.pipContents);
        }

        private generateList(content: ContentBlock[]): void {
            if (!content || content.length < 1) {
                this.clearList();
                return;
            } else {
                this.compositeContent = [];
                let id: number = 0;
                _.each(content, (item: ContentBlock) => {
                    if (typeof (item) != 'object' || item == null) {
                        throw new Error('Error: content error!');
                    }
                    item.id = id;
                    item.picIds = item.pic_ids ? this.getPicIds(item.pic_ids) : null;
                    id++;
                    this.compositeContent.push(item);
                });
            }
        }

        private clearList(): void {
            this.compositeContent = [];
        }
    }

    const CompositeView: ng.IComponentOptions = {
        bindings: CompositeViewBindings,
        templateUrl: 'composite_view/CompositeView.html',
        controller: CompositeViewController
    }

    angular.module("pipCompositeView", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates', 'pipEmbeddedView'])
        .component('pipCompositeView', CompositeView);

}