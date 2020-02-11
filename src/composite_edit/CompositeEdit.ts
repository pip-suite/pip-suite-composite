import { ChecklistDraggEvent } from '../checklist_edit/ChecklistEdit';
import { CompositeFocusedEvent } from '../utilities/CompositeFocused';
import { ContentBlock } from '../data';

let async = require('async');

export const CompositeEmptyEvent: string = 'pipCompositeNotEmpty';
export const CompositeAddItemEvent: string = 'pipAddContent';
export const CompositeNotEmptyEvent: string = 'pipCompositeNotEmpty';

export class CompositeAddItem {
    public id: number;
    public type: string;
}


const ConfigTranslations = (pipTranslate: pip.services.ITranslateService) => {
    if (pipTranslate) {
        (pipTranslate).setTranslations('en', {
            'COMPOSITE_TITLE': 'What\'s on your mind?',
            'COMPOSITE_PLACEHOLDER': 'Type text ...',
            'COMPOSITE_START_TIME': 'Start time',
            'COMPOSITE_END_TIME': 'End time'
        });
        (pipTranslate).setTranslations('ru', {
            'COMPOSITE_TITLE': 'Что у вас на уме?',
            'COMPOSITE_PLACEHOLDER': 'Введите текст ...',
            'COMPOSITE_START_TIME': 'Время начала',
            'COMPOSITE_END_TIME': 'Время окончания'
        });
    }
}

export class CompositeControl {
    save: (successCallback?: (data: CompositeContent[]) => void, errorCallback?: (error: any) => void) => void;
    abort: () => void;
    error?: any;
}

class SenderEvent {
    event: CompositeControl;
}

export class CompositeContent extends ContentBlock {
    public empty?: boolean;
    public documents?: pip.documents.DocumentListEditControl;
    public pictures?: pip.pictures.PictureListEditControl;
}

export class CompositeBlockTypes {
    static Text: string = 'text';
    static Pictures: string = 'pictures';
    static Checklist: string = 'checklist';
    static Documents: string = 'documents';
    static Location: string = 'location';
    static Time: string = 'time';
    static SecondaryBlock = ['checklist', 'documents', 'location', 'time']
    static PrimaryBlock = ['text', 'pictures']
    static All = ['text', 'pictures', 'checklist', 'documents', 'location', 'time']
}

{

    class CompositeSelected {
        public index: number = 0;
        public drag: boolean = true;
        public dragId: number = 0;
        public id: number;
        public isChanged: boolean = false;
        public event?: string;
    }

    interface ICompositeEditBindings {
        [key: string]: any;

        ngDisabled: any;
        pipChanged: any;
        pipContents: any;
        pipCreated: any;
        compositeId: any;
        pipCompositePlaceholder: any;
        pipScrollContainer: any;
        addedContent: any;
        pipRebind: any;
    }

    const CompositeEditBindings: ICompositeEditBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipCreated: '&?',
        pipContents: '=?',
        compositeId: '<?pipCompositeId',
        pipCompositePlaceholder: '<?',
        pipScrollContainer: '<?',
        addedContent: '<?pipAddedContent',
        pipRebind: '<?'
    }

    class CompositeEditBindingsChanges implements ng.IOnChangesObject, ICompositeEditBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject<boolean>;
        pipChanged: ng.IChangesObject<() => ng.IPromise<void>>;
        pipCreated: ng.IChangesObject<(event: SenderEvent) => ng.IPromise<void>>;
        pipContents: ng.IChangesObject<CompositeContent[]>;
        compositeId: ng.IChangesObject<number>;
        pipCompositePlaceholder: ng.IChangesObject<string>;
        pipScrollContainer: ng.IChangesObject<string>;
        addedContent: ng.IChangesObject<boolean>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class CompositeEditController implements ICompositeEditBindings {
        private defaultPlaceholder: string = 'COMPOSITE_PLACEHOLDER';
        private CONTENT_TYPES: string[] = CompositeBlockTypes.All;
        private cleanupCompositeEvent: any;
        private cleanupCompositeFocusedEvent: any;
        private cleanupChecklistDraggEvent: any;
        private _debounceChange: any;

        public ngDisabled: boolean;
        public pipChanged: Function;
        public pipCreated: (event: SenderEvent) => void;
        public pipContents: CompositeContent[];
        public compositeId: number;
        public pipCompositePlaceholder: string;
        public pipScrollContainer: string;
        public addedContent: string;
        public pipRebind: boolean;

        public compositeContent: CompositeContent[];
        public selected: CompositeSelected;
        public isFirst: boolean;
        public compositePlaceholder: string;

        public control: CompositeControl;

        constructor(
            private $q,
            private $element: JQuery,
            private $timeout: ng.ITimeoutService,
            private $document,
            private $rootScope: ng.IRootScopeService,
            private pipTranslate: pip.services.ITranslateService

        ) {
            "ngInject";

            this.selected = new CompositeSelected();
            this.selected.id = this.now();

            $element.addClass('pip-composite-edit');

            this.generateList(this.pipContents);
            this.setPlaceholder();
            this.control = {
                save: (successCallback?: (data: CompositeContent[]) => void, errorCallback?: (error: any) => void) => {
                    this.saveContent(successCallback, errorCallback);
                },
                abort: () => {
                    this.abortContent();
                },
                error: null
            };
            this.executeCallback();

            this.cleanupCompositeEvent = this.$rootScope.$on(CompositeAddItemEvent,
                (event: ng.IAngularEvent, args: CompositeAddItem) => {
                    if (this.compositeId) {
                        if (args.id && args.id == this.compositeId) {
                            this.addItem(args.type);
                        }
                    } else {
                        this.addItem(args.type);
                    }
                });

            this.cleanupChecklistDraggEvent = this.$rootScope.$on(ChecklistDraggEvent, () => {
                this.selected.drag = false;
                this.$timeout(() => {
                    this.selected.drag = false;
                }, 0);
            });

            this.cleanupCompositeFocusedEvent = this.$rootScope.$on(CompositeFocusedEvent, () => {
                if (this.isFirst) {
                    this.$timeout(() => {
                        let nextElement = angular.element('#composite-item-text-' + this.selected.id + '-0');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                }
            });

            this._debounceChange = _.debounce(() => {
                this.onCompositeChange();
            }, 200);
        }

        private abortContent(): void {
            _.each(this.compositeContent, (item: CompositeContent) => {
                if (item.pictures && item.pictures.abort) {
                    item.pictures.abort();
                } else if (item.documents && item.documents.abort) {
                    item.documents.abort();
                }
            });
        }

        private getPicIdsArray(data: pip.pictures.Attachment[]): string[] {
            let result: string[] = [];

            _.each(data, (item: pip.pictures.Attachment) => {
                if (item.id) {
                    result.push(item.id);
                }
            });

            return result;
        }

        private saveContent(successCallback?: (data: CompositeContent[]) => void, errorCallback?: (error: any) => void, abortFirstError?: boolean): void {
            let content: CompositeContent[];
            content = _.cloneDeep(this.compositeContent);
            let saveFirstError: any = null;

            async.eachOf(this.compositeContent,
                (item, index, callback) => {
                    if (item.pictures && item.pictures.save) {
                        item.pictures.save(
                            (data: pip.pictures.Attachment[]) => {
                                delete item.picIds;
                                item.pic_ids = this.getPicIdsArray(data);
                                callback();
                            },
                            (error: any) => {
                                saveFirstError = saveFirstError ? saveFirstError : error;
                                if (abortFirstError) {
                                    callback(error);
                                } else {
                                    callback();
                                }
                            }
                        );
                    } else if (item.documents && item.documents.save) {
                        item.documents.save(
                            (data: pip.documents.Attachment[]) => {
                                item.docs = data;
                                callback();
                            },
                            (error: any) => {
                                saveFirstError = saveFirstError ? saveFirstError : error;
                                if (abortFirstError) {
                                    callback(error);
                                } else {
                                    callback();
                                }
                            }
                        );
                    } else {
                        callback();
                    }
                },
                (error, result) => {
                    if (error || saveFirstError) {
                        if (abortFirstError) {
                            this.abortContent();
                        } 
                        this.compositeContent = content;
                        if (errorCallback) errorCallback(error);
                    } else {
                        this.onCompositeChange();
                        if (successCallback) successCallback(this.pipContents);
                    }
                });
        }

        public $onDestroy() {
            if (angular.isFunction(this.cleanupCompositeEvent)) {
                this.cleanupCompositeEvent();
            }
            if (angular.isFunction(this.cleanupChecklistDraggEvent)) {
                this.cleanupChecklistDraggEvent();
            }
            if (angular.isFunction(this.cleanupCompositeFocusedEvent)) {
                this.cleanupCompositeFocusedEvent();
            }
        }

        public $onChanges(changes: CompositeEditBindingsChanges): void {
            if (changes.pipRebind && changes.pipRebind.currentValue !== changes.pipRebind.previousValue) {
                this.pipRebind = changes.pipRebind.currentValue;
                if (this.pipRebind && changes.pipContents && _.isArray(changes.pipContents.currentValue)) {
                    if (!this.selected.isChanged || (this.pipContents
                        && this.pipContents.length != this.compositeContent.length)) {
                        this.generateList(this.pipContents);
                        this.selected.isChanged = false;
                    }
                }
            }

            if (changes.ngDisabled && changes.ngDisabled.currentValue !== changes.ngDisabled.previousValue) {
                this.ngDisabled = changes.ngDisabled.currentValue;
            }

            if (changes.pipCompositePlaceholder && changes.pipCompositePlaceholder.currentValue !== changes.pipCompositePlaceholder.previousValue) {
                this.pipCompositePlaceholder = changes.pipCompositePlaceholder.currentValue;
                this.setPlaceholder();
            }
        }

        private executeCallback() {
            // Execute callback
            if (this.pipCreated) {
                this.pipCreated({
                    event: this.control
                });
            }
        }

        private toBoolean(value: any): boolean {
            if (value == null) { return false; }
            if (!value) { return false; }
            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }

        private getEmptyItem(): CompositeContent {
            let emptyItem: CompositeContent = {
                empty: true,
                id: this.getId(),
                type: 'text',
                text: '', docs: [], pic_ids: [], loc_pos: null, loc_name: '',
                start: null, end: null, checklist: []
            }

            return emptyItem;
        }


        private setPlaceholder(): void {
            this.compositePlaceholder =
                (this.pipCompositePlaceholder === undefined || this.pipCompositePlaceholder === null) ?
                    this.pipTranslate.translate(this.defaultPlaceholder) :
                    this.pipTranslate.translate(this.pipCompositePlaceholder);
        }

        private addItem(contentType: string, value?: any): void {
            if (_.indexOf(this.CONTENT_TYPES, contentType) < 0) return;

            // generate new item
            var newItem: CompositeContent = {
                id: this.getId(),
                type: contentType,
                text: contentType == 'text' ? value : '',
                docs: contentType == 'documents' && value ? value : [],
                pic_ids: contentType == 'pictures' && value ? value : [],
                loc_pos: contentType == 'location' && value ? value.loc_pos : null,
                loc_name: contentType == 'location' && value ? value.loc_name : '',
                start: contentType == 'time' && value ? value.start : null,
                end: contentType == 'time' && value ? value.end : null,
                checklist: contentType == 'checklist' && value ? value : []
            };

            // calculate current index
            let index: number = _.findIndex(this.compositeContent, { id: this.selected.index });
            index = index < 0 ? 0 : index;

            // insert new element and select it
            if (this.compositeContent.length == 1 && this.compositeContent[0].empty) {
                this.compositeContent[0] = newItem;
            } else {
                this.compositeContent.splice(index + 1, 0, newItem);
                index += 1;
            }

            // insert new element and select it
            this.selected.index = newItem.id;
            this.onSelect();

            // focus to new element
            setTimeout(this.scrollTo(this.pipScrollContainer, '#composite-item-' + this.selected.id + '-' + index), 1000);

            // set toolbar
            this.isFirst = false;
            this.setToolbar();
            this._debounceChange();
        }

        private getId(): number {
            let id: number = -1;
            _.each(this.compositeContent, (item: CompositeContent) => {
                if (id < item.id) id = item.id;
            });

            return id + 1;
        }

        private scrollTo(parentElement: any, childElement: any): void {
            if (!parentElement || !childElement) { return; }

            setTimeout(() => {
                if (!$(childElement).position()) { return; }

                let modDiff: number = Math.abs($(parentElement).scrollTop() - $(childElement).position().top);
                if (modDiff < 20) { return; }

                let scrollTo: number = $(parentElement).scrollTop() + ($(childElement).position().top - 20);
                $(parentElement).animate({
                    scrollTop: scrollTo + 'px'
                }, 300);
            }, 100);
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

        private generateList(content: CompositeContent[]): void {
            if (!content || content.length < 1) {
                this.clearList();

                return;
            } else {
                this.compositeContent = [];
                _.each(content, (item: CompositeContent) => {
                    item.id = this.getId();
                    item.picIds = item.pic_ids ? this.getPicIds(item.pic_ids) : null;
                    this.compositeContent.push(item);
                });
                this.isFirst = false;
            }

            this.setToolbar();
        }

        private setToolbar(): void {
            if (this.compositeContent.length > 2) { return; }

            this.$rootScope.$emit(CompositeNotEmptyEvent, !this.isFirst);
        }

        private clearList(): void {
            this.compositeContent = [];

            this.compositeContent.push(this.getEmptyItem());
            this.isFirst = true;
        }

        private now(): number {
            return +new Date;
        }

        private updateContents(): void {
            this.selected.isChanged = true;
            this.pipContents = this.compositeContent;
        }

        private getParentIndex(el: any): number {
            if (el.length < 1) return null;
            let elParent = el.parent();
            if (elParent[0] && elParent[0].id && elParent[0].id.indexOf('composite-item-' + this.selected.id) > -1) {
                let strs = elParent[0].id.split('-');

                let parentIndex: number = parseInt(strs[strs.length - 1], 10);
                return parentIndex;
            } else {
                return this.getParentIndex(elParent);
            }
        }

        // ---------------- public

        public isActiveChecklist(obj: CompositeContent): boolean {
            // return obj.id == this.selected.index;
            return obj.id == this.selected.id;
        }

        public onKeyUp($event: KeyboardEvent): void {
            if ($event.keyCode == 9) {
                this.$timeout(() => {
                    let focusedElement = angular.element(this.$document[0].activeElement);
                    let parentIndex: number = this.getParentIndex(focusedElement);
                    if (parentIndex != null) {
                        this.selected.index = parentIndex;
                    }
                    // ??? index = id
                    this.selected.index = this.compositeContent[parentIndex].id;
                }, 50);
            }
        }

        public onKeyDown($event: KeyboardEvent, index: number, item: CompositeContent): void {
            if (this.ngDisabled) { return; }
            // delete item
            if (item && !item.empty && $event.keyCode == 46 && !$event.ctrlKey && $event.shiftKey) {
                if ($event) {
                    $event.stopPropagation();
                    $event.preventDefault();
                }
                if (index > -1) {
                    this.onDeleteItem(index);
                }
            }
        }

        public onCompositeChange(): void {
            this.updateContents();
            if (this.pipChanged) {
                this.pipChanged(this.pipContents);
            }
        }

        public onDeleteItem(index: number): void {
            if (index < 0 || this.compositeContent.length == 0) return;

            // delete last element in composite
            if (this.compositeContent.length == 1) {
                this.compositeContent[0] = this.getEmptyItem();
                this.selected.index = this.compositeContent[0].id;
                this.onSelect(0);
                this.isFirst = true;
                this.setToolbar();
            } else {
                if (index >= 0 && index < this.compositeContent.length) {
                    this.compositeContent.splice(index, 1);
                }
                if (index == this.compositeContent.length) {
                    this.selected.index = this.compositeContent[this.compositeContent.length - 1].id;
                } else {
                    this.selected.index = this.compositeContent[index].id;
                }
                this.onSelect();
            }

            this.setToolbar();
            this._debounceChange();
        }

        public onContentChange(obj: any): void { //CompositeContent
            if (obj && obj.empty && obj.text) {
                obj.empty = false;
                this.isFirst = false;
                this.setToolbar();
            }
            if (!this.ngDisabled) {
                this._debounceChange();
            }
        }

        public isSelectedSection(index: number, obj: CompositeContent): boolean {
            return this.selected.index == obj.id && !obj.empty;
        }

        public onDraggEnd(): void {
            this.selected.drag = true;
        }

        public onStart(id: number): void {
            if (id && id != this.selected.dragId) {
                this.selected.drag = false;
            }
        }

        public onStop(id: number): void {
            this.$timeout(() => {
                this.selected.drag = true;
                this.selected.dragId = 0;
            }, 500);
        }

        public onDownDragg($event: ng.IAngularEvent, obj: CompositeContent) {
            if (this.ngDisabled) return;
            this.selected.dragId = this.selected.id;
            this.selected.drag = true;
            this.selected.index = obj.id;
        }

        public onClick($event: JQueryEventObject, index: number, obj: CompositeContent): void {
            if (this.ngDisabled) { return; }

            this.selected.event = 'onClick';
            if ($event && $event.target && $event.target.tagName &&
                ($event.target.tagName == 'INPUT' || $event.target.tagName == 'TEXTAREA')) {
                this.selected.index = obj.id;

                return;
            }

            if ((this.selected.index == obj.id && obj.type == 'checklist' && obj.checklist.length > 0) ||
                (this.selected.index == obj.id && obj.type == 'location')) { return; }

            this.selected.index = obj.id;
            this.onSelect();
        }

        public onDropComplete(placeIndex: number, obj: CompositeContent, event: JQueryEventObject, componentId: number): void {
            if (componentId != this.selected.id || !obj || !obj.type) {
                this.compositeContent = _.cloneDeep(this.pipContents);

                return;
            }

            let index: number = placeIndex;
            let tmpIndex: number = _.findIndex(this.compositeContent, { id: obj.id }); //this.selected.index});
            let i: number;

            if (!(tmpIndex == 0 && placeIndex == 1)) {
                if (tmpIndex > index) {
                    if (index > this.compositeContent.length - 1) index = this.compositeContent.length - 1;
                    // move up
                    for (i = 0; i < tmpIndex - index; i++) {
                        this.compositeContent[tmpIndex - i] = this.compositeContent[tmpIndex - i - 1];
                    }
                    this.compositeContent[index] = obj;
                }
                if (tmpIndex < index) {
                    index -= 1;
                    //move down
                    for (i = 0; i < index - tmpIndex; i++) {
                        this.compositeContent[tmpIndex + i] = this.compositeContent[tmpIndex + i + 1];
                    }
                    this.compositeContent[index] = obj;
                }
                this.selected.index = this.compositeContent[index].id;
            }

            this.onSelect();
            this._debounceChange();
        }

        public onSelect(index?: number): void {
            if (!index) {
                index = _.findIndex(this.compositeContent, { id: this.selected.index });
            }
            if (index < 0) { return; }

            let item: CompositeContent = this.compositeContent[index];
            if (_.isEmpty(item)) { return; }

            let nextElement;
            switch (item.type) {
                //case 'text':
                //        setTimeout(() => {
                //            var nextElement = angular.element('#composite-item-text-' + this.selected.id + '-' + index);
                //            //var nextElement = angular.element('#composite-item-text-' + this.selected.id + '-' + this.selected.index);
                //            if (nextElement && !nextElement.is(':focus')) nextElement.focus();
                //            //this.selected.stopKey = false;
                //        },  50);
                //    break;
                case 'pictures':
                    setTimeout(() => {
                        nextElement = angular.element(
                            '#composite-item-' + this.selected.id + '-' + index + ' button.pip-picture-upload');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'documents':
                    setTimeout(() => {
                        nextElement = angular.element(
                            '#composite-item-' + this.selected.id + '-' + index + ' button.pip-document-upload');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                //case 'checklist':
                //        setTimeout(() => {
                //            var nextElement = angular.element(
                //                '#composite-item-' + this.selected.id + '-' + index + ' textarea[id^=\'empty-item-\'');
                //            if (nextElement && !nextElement.is(':focus')) nextElement.focus();
                //            //this.selected.stopKey = false;
                //        },  50);
                //    break;
                case 'location':
                    setTimeout(() => {
                        nextElement = angular.element(
                            '#composite-item-' + this.selected.id + '-' + index + ' .pip-location-empty  button');
                        if (nextElement && !nextElement.is(':focus')) {
                            nextElement.focus();
                        }
                    }, 50);
                    break;
                case 'time':
                    break;
            }
        }

        // set element responsive width when element places
        //public setWidth100(index: number): void {
        //    let element = angular.element('#composite-item-' + this.selected.id + '-' + index);
        //    element.css( "width", 'none');
        //    element.css( "max-width", 'none');
        //};
        //
        //// set draggable element width when your dragg
        //public setWidth(index: number): void {
        //    if (this.selected.isWidth) return;
        //    let elementEtalon = angular.element('#pip-composite-last-' + + this.selected.id);
        //    let value = elementEtalon.width();
        //    let element = angular.element('#composite-item-' + this.selected.id + '-' + index);
        //    if (element) {
        //        element.css("width", value + 'px');
        //        element.css("max-width", value + 'px');
        //    }
        //};

    }

    const CompositeEdit: ng.IComponentOptions = {
        bindings: CompositeEditBindings,
        templateUrl: 'composite_edit/CompositeEdit.html',
        controller: CompositeEditController
    }

    angular.module("pipCompositeEdit", ['pipDocuments', 'pipLocations', 'pipPictures', 'pipDates', 'pipComposite.Templates'])
        .run(ConfigTranslations)
        .component('pipCompositeEdit', CompositeEdit);

}


