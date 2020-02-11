import { CompositeBlockTypes } from '../composite_edit/CompositeEdit';
import { ContentBlock, ChecklistItem } from '../data';
{

    interface ICompositeSummaryBindings {
        [key: string]: any;

        pipContents: any;
        pipChecklistSize: any;
        pipTextSize: any;
        pipPrimaryBlockLimit: any;
        pipSecondaryBlockLimit: any;
        pipSecondaryBlockTypes: any;
        pipRebind: any;
    }

    const CompositeSummaryBindings: ICompositeSummaryBindings = {

        pipContents: '<?',
        pipChecklistSize: '<?',
        pipTextSize: '<?',
        pipPrimaryBlockLimit: '<?',
        pipSecondaryBlockLimit: '<?',
        pipSecondaryBlockTypes: '<?',
        pipRebind: '<?'
    }

    class CompositeSummaryBindingsChanges implements ng.IOnChangesObject, ICompositeSummaryBindings {
        [key: string]: ng.IChangesObject<any>;

        pipContents: ng.IChangesObject<ContentBlock[]>;
        pipChecklistSize: ng.IChangesObject<number>;
        pipTextSize: ng.IChangesObject<number>;
        pipPrimaryBlockLimit: ng.IChangesObject<number>;
        pipSecondaryBlockLimit: ng.IChangesObject<number>;
        pipSecondaryBlockTypes: ng.IChangesObject<string[]>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class CompositeSummaryController {
        public pipContents: ContentBlock[];
        public pipChecklistSize: number;
        public pipTextSize: number;
        public pipPrimaryBlockLimit: number;
        public pipSecondaryBlockLimit: number;
        public pipSecondaryBlockTypes: string[];
        public pipRebind: boolean;

        public compositeContent: ContentBlock[];

        public disableControl: boolean = true;
        public disabledChecklist: boolean = true;

        constructor(
            private $element: JQuery
        ) {
            "ngInject";

            $element.addClass('pip-composite-summary');

            this.pipChecklistSize = this.pipChecklistSize ? this.pipChecklistSize : 0;
            this.pipTextSize = this.pipTextSize ? this.pipTextSize : 0;
            this.pipPrimaryBlockLimit = this.pipPrimaryBlockLimit === undefined || this.pipPrimaryBlockLimit === null ? -1 : this.pipPrimaryBlockLimit;
            this.pipSecondaryBlockLimit = this.pipSecondaryBlockLimit === undefined || this.pipSecondaryBlockLimit === null ? -1 : this.pipSecondaryBlockLimit;
            this.pipSecondaryBlockTypes = this.pipSecondaryBlockTypes && _.isArray(this.pipSecondaryBlockTypes) ? this.pipSecondaryBlockTypes : CompositeBlockTypes.SecondaryBlock;

            this.generateList(this.pipContents);
        }

        public $onChanges(changes: CompositeSummaryBindingsChanges) {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipContents && changes.pipContents.currentValue) {
                    if (!angular.equals(this.pipContents, changes.pipContents.currentValue)) {
                        this.generateList(this.pipContents);
                    }
                }
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

        private toBoolean(value: any): boolean {
            if (value == null) return false;
            if (!value) return false;
            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }


        // limit cacklist position
        public limitChecklist(content: ContentBlock[], val: number): void {
            if (!val) return;
            let ellapsed: ChecklistItem = {
                text: '...',
                checked: false
            };
            _.each(content, (item: ContentBlock) => {
                if (item && item.type == CompositeBlockTypes.Checklist) {
                    let checklistLength: number = item.checklist.length;
                    item.checklist = _.take(item.checklist, val);
                    if (checklistLength > val) {
                        item.checklist.push(ellapsed);
                    }
                }
            });
        };

        // choose primary blocks (text and picture)
        public selectSummary(content: ContentBlock[]): ContentBlock[] {
            let result: ContentBlock[] = [];
            let i: number;

            _.each(content, (item: ContentBlock) => {
                if (this.pipPrimaryBlockLimit >= 0 && i >= this.pipPrimaryBlockLimit) {
                    return result;
                }
                //if (item.type == 'text' || item.type == 'pictures' ) {
                if (this.pipSecondaryBlockTypes.indexOf(item.type) < 0) {
                    result.push(item);
                    i += 1;
                }
            });

            return result;
        }

        // отбираем остальные блоки если они есть
        public selectSummarySecondary(content: ContentBlock[], types: string[]): ContentBlock[] {
            let i: number;
            let limit: number = this.pipSecondaryBlockLimit < 0 ? content.length : this.pipSecondaryBlockLimit;
            let result: ContentBlock[] = [];

            for (i; i < content.length; i++) {
                if (types.indexOf(content[i].type) > -1) {
                    result.push(content[i]);
                    if (result.length >= limit) {
                        break;
                    }
                }
            }

            return result;
        }

        public generateList(content: ContentBlock[]): void {
            if (!content || content.length < 1) {
                this.clearList();

                return;
            } else {
                let summaryContent: ContentBlock[] = _.cloneDeep(content);
                let result: ContentBlock[] = this.selectSummary(summaryContent);
                if (result.length == 0) {
                    result = this.selectSummarySecondary(summaryContent, this.pipSecondaryBlockTypes);
                }

                this.limitChecklist(result, this.pipChecklistSize);

                let id: number;
                _.each(result, (item: ContentBlock) => {
                    item.id = id;
                    item.picIds = item.pic_ids ? this.getPicIds(item.pic_ids) : null;
                    id++;
                });
                this.compositeContent = result;
            }
        }

        public clearList() {
            this.compositeContent = [];
        }
    }

    const CompositeSummary: ng.IComponentOptions = {
        bindings: CompositeSummaryBindings,
        templateUrl: 'composite_summary/CompositeSummary.html',
        controller: CompositeSummaryController
    }

    angular.module("pipCompositeSummary", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates'])
        .component('pipCompositeSummary', CompositeSummary);

}

