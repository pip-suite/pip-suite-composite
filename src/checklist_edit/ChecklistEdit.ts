import { ChecklistItem } from '../data';
export const ChecklistDraggEvent: string = 'onChecklistDrag';

{

    class ChecklistSelected {
        public index: number = 0;
        public drag: boolean;
        public dragInit: boolean;
        public dragId: number = 0;
        public id: number;
        public isChanged: boolean = false;
    }

    interface IChecklistEditBindings {
        [key: string]: any;

        ngDisabled: any;
        pipChanged: any;
        pipDraggable: any;
        pipOptions: any;
        pipScrollContainer: any;
        pipRebind: any;
    }

    const ChecklistEditBindings: IChecklistEditBindings = {
        ngDisabled: '<?',
        pipChanged: '=?',
        pipDraggable: '<?',
        pipOptions: '=',
        pipScrollContainer: '<?',
        pipRebind: '<?'
    }

    class ChecklistEditBindingsChanges implements ng.IOnChangesObject, IChecklistEditBindings {
        [key: string]: ng.IChangesObject<any>;

        ngDisabled: ng.IChangesObject<boolean>;
        pipChanged: ng.IChangesObject<() => ng.IPromise<void>>;
        pipDraggable: ng.IChangesObject<boolean>;
        pipOptions: ng.IChangesObject<ChecklistItem[]>;
        pipScrollContainer: ng.IChangesObject<string>;
        pipRebind: ng.IChangesObject<boolean>;
    }

    class ChecklistEditController {
        public ngDisabled: boolean;
        public pipChanged: Function;
        public pipDraggable: boolean;
        public pipScrollContainer: string;
        public pipOptions: ChecklistItem[];
        public pipRebind: boolean;

        private _debounceChange: any;

        public selected: ChecklistSelected;

        public checklistContent: ChecklistItem[];
        public isWidth: boolean;


        constructor(
            private $element: JQuery,
            private $timeout: ng.ITimeoutService,
            private $document,
            private $rootScope: ng.IRootScopeService
        ) {
            "ngInject";

            $element.addClass('pip-checklist-edit');

            if (!this.pipOptions || !_.isArray(this.pipOptions)) {
                this.pipOptions = [];
            }

            this.selected = new ChecklistSelected();
            this.selected.drag = this.pipDraggable;
            this.selected.dragInit = this.pipDraggable;
            this.selected.id = this.now();

            this.generateList(this.pipOptions);

            this._debounceChange = _.debounce(() => {
                this.onChecklistChange();
            }, 200);

        }

        public $onChanges(changes: ChecklistEditBindingsChanges): void {
            if (this.toBoolean(this.pipRebind)) {
                if (changes.pipOptions && changes.pipOptions.currentValue) {
                    if (!angular.equals(this.pipOptions, changes.pipOptions.currentValue)) {
                        if (!this.selected.isChanged) {
                            this.generateList(changes.pipOptions.currentValue);
                            // this.pipOptions = changes.pipOptions.currentValue;
                        } else {
                            this.selected.isChanged = false;
                        }
                    }
                }
                if (changes.pipDraggable && changes.pipDraggable.currentValue) {
                    this.pipDraggable = changes.pipDraggable.currentValue;
                }
            }
        }

        private toBoolean(value: any): boolean {
            if (value == null) { return false; }
            if (!value) { return false; }
            value = value.toString().toLowerCase();

            return value == '1' || value == 'true';
        }

        private getCaret(el: any): number {
            if (el.selectionStart) {
                return el.selectionStart;
            } else if (this.$document.selection) {
                el.focus();

                let r = this.$document.selection.createRange();
                if (r == null) {
                    return 0;
                }

                var re = el.createTextRange(),
                    rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);

                return rc.text.length;
            }

            return 0;
        }

        private setSelectionRange(input, selectionStart, selectionEnd): void {
            if (input.setSelectionRange) {
                input.focus();
                input.setSelectionRange(selectionStart, selectionEnd);
            } else if (input.createTextRange) {
                var range = input.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        }

        private setCaretToPos(input, pos): void {
            this.setSelectionRange(input, pos, pos);
        }

        private addItem(text: string, index: number): void {
            let newItem: ChecklistItem = this.getNewItem(text, false);
            if (index > -1) {
                this.selected.index = index;
            }

            if (this.checklistContent.length < 2) {
                this.checklistContent.unshift(newItem);
            } else {
                this.checklistContent.splice(this.selected.index + 1, 0, newItem);
            }
            this.selected.index += 1;
            this.setFocus(this.selected.index);

            this._debounceChange();
        }

        private updateContents(): void {
            this.selected.isChanged = true;
            let content: ChecklistItem[] = [];
            _.each(this.checklistContent, (item: ChecklistItem) => {
                if (!item.empty) {
                    content.push({
                        checked: item.checked,
                        text: item.text
                    })
                }
            })

            this.pipOptions = content;
        }

        private setFocus(index: number, toPos?: any): void {
            if (index > -1) {
                setTimeout(() => {
                    let nextElement = angular.element('#check-item-text-' + this.selected.id + '-' + index);
                    if (nextElement) {
                        nextElement.focus();
                        if (toPos !== undefined && nextElement[0]) {
                            this.setCaretToPos(nextElement[0], toPos);
                        }
                    }
                }, 50);
            }
        }

        private getNewItem(text?: string, isEmpty?: boolean): ChecklistItem {
            let newItem: ChecklistItem = {
                checked: false,
                text: text || '',
                empty: isEmpty
            };

            return newItem;
        }

        private now(): number {
            return +new Date;
        }

        private clearList(): void {
            this.selected.index = 0;
            this.checklistContent = [];
            // push empty item
            this.checklistContent.push(this.getNewItem('', true));
        }

        private generateList(content: ChecklistItem[]): void {
            if (!content || content.length < 1) {
                this.clearList();
            } else {
                this.checklistContent = [];
                _.each(content, (item) => {
                    this.checklistContent.push(item);
                });
                // push empty item
                this.checklistContent.push(this.getNewItem('', true));
            }
        }

        private setWidth100(): void {
            let element = angular.element('#check-item-' + + this.selected.id + '-' + this.selected.index);
            element.css("width", 'none');
            element.css("max-width", 'none');
        }

        private setWidth(): void {
            if (this.isWidth) return;

            let elementEtalon = angular.element('#check-item-empty-' + this.selected.id);
            let value: number = elementEtalon.width();
            let element = angular.element('#check-item-' + this.selected.id + '-' + this.selected.index);
            if (element) {
                element.css("width", value + 'px');
                element.css("max-width", value + 'px');
            }
        }

        // public functions

        public onItemFocus(index: number): void {
            if (this.ngDisabled) return;
            this.selected.index = index;
        }

        public isSelectedItem(index: number): boolean {
            let empty: boolean;
            try {
                empty = this.checklistContent[index].empty;
            } catch (err) {
                empty = true;
            }

            return this.selected.index == index && this.pipDraggable && !empty;
        }

        public onAddItem(): void {
            this.addItem('', this.selected.index - 1);
        }

        public onChangeItem(index: number): void {
            if (index > -1 && this.checklistContent[index] && this.checklistContent[index].empty) {
                if (this.checklistContent[index].empty) {
                    this.checklistContent[index].empty = false;
                    this.checklistContent.push(this.getNewItem('', true));
                }
            }
            this._debounceChange();
        }

        public onClick($event: JQueryEventObject, index: number): void {
            if (this.ngDisabled) { return; }

            this.selected.index = index;
        }

        public onTextAreaClick($event: JQueryEventObject, index: number) {
            if (this.ngDisabled) { return; }

            this.selected.index = index;
        }

        public onDropComplete(placeIndex: number, obj: ChecklistItem, $event: JQueryEventObject, componentId: number) {
            if (this.selected.id != componentId) { return; }
            if (!this.selected.drag) { return; }

            let index: number = placeIndex;
            let tmpIndex: number = this.selected.index;
            let checklist: ChecklistItem[] = _.cloneDeep(this.checklistContent);

            if (!(tmpIndex == 0 && placeIndex == 1)) {
                if (tmpIndex > index) {
                    if (index > checklist.length - 1) {
                        index = checklist.length - 1;
                    }
                    // move up
                    for (let i = 0; i < tmpIndex - index; i++) {
                        checklist[tmpIndex - i] = checklist[tmpIndex - i - 1];
                    }
                    checklist[index] = obj;
                }
                if (tmpIndex < index) {
                    index -= 1;
                    //move down
                    for (var i = 0; i < index - tmpIndex; i++) {
                        checklist[tmpIndex + i] = checklist[tmpIndex + i + 1];
                    }
                    checklist[index] = obj;
                }

                this.selected.index = index;
            }

            this.checklistContent = checklist;
            this._debounceChange();
        }

        public onMove(): void {
            this.setWidth();
            this.isWidth = true;
        }


        public onStop(id: number): void {
            this.$timeout(() => {
                this.selected.drag = this.selected.dragInit;
                this.selected.dragId = 0;
            }, 50);

            if (this.isWidth) {
                this.setWidth100();
                this.isWidth = false;
            }
        }

        public onStart(id: number): void {
            this.selected.isChanged = true;
            if (id && id != this.selected.dragId) {
                this.selected.drag = false;
            }
        }

        public onDownDragg(item: ChecklistItem): void {
            if (this.pipDraggable && this.checklistContent.length > 2 && !item.empty) {
                this.$rootScope.$broadcast(ChecklistDraggEvent);
                this.selected.dragId = this.selected.id;
            }
        }

        public onDeleteItem(index: number, item: ChecklistItem): void {
            if (this.checklistContent.length == 1) {
                this.checklistContent[0].text = '';
                this.checklistContent[0].checked = false;
                this.checklistContent[0].empty = true;
                this.selected.index = 0;
            } else {
                if (index >= 0 && index <= this.checklistContent.length) {
                    this.checklistContent.splice(index, 1);
                } else {
                    return;
                }
            }

            if (this.selected.index >= this.checklistContent.length) {
                this.selected.index = this.checklistContent.length - 1;
            }

            this.setFocus(this.selected.index, 0);
            this._debounceChange();
        }

        public onChecked(item: ChecklistItem): void {
            this._debounceChange();
        }

        public onChecklistChange(): void {
            this.updateContents();

            if (this.pipChanged) {
                this.$timeout(() => {
                    this.pipChanged(this.pipOptions);
                }, 0);
            }
        }


        public onTextareaKeyDown($event: KeyboardEvent, index: number, item: ChecklistItem) {
            if (this.ngDisabled) return;
            if (this.selected.index == -1) return;
            let textareaLength: number;
            let posCaret: any;
            if ($event && $event.target) {
                // calculate caret position
                posCaret = this.getCaret($event.target);
                // calculate textarea length
                if ($event.target['value'] !== undefined) {
                    textareaLength = $event.target['value'].length;
                }

            }

            // delete empty item after backspace or del
            if (this.selected.index > 0 && item.text != '' && posCaret == 0 && $event.keyCode == 8 && !$event.ctrlKey && !$event.shiftKey) {
                if (!item.empty) {
                    var position = this.checklistContent[this.selected.index - 1].text.length;
                    this.checklistContent[this.selected.index - 1].text = this.checklistContent[this.selected.index - 1].text + item.text;
                    this.selected.index -= 1;
                    this.checklistContent.splice(this.selected.index + 1, 1);
                    this._debounceChange();

                    this.setFocus(this.selected.index, position);
                }
                if ($event) { $event.stopPropagation(); }

                return false;
            }

            if (item.text == '' && ($event.keyCode == 8 || $event.keyCode == 46) && !$event.ctrlKey && !$event.shiftKey) {
                if (!item.empty) {
                    this.onDeleteItem(index, item);
                }
                if ($event) { $event.stopPropagation(); }

                return false;
            }

            //press enter - create new item
            if (($event.keyCode == 13 || $event.keyCode == 45) && !$event.ctrlKey && !$event.shiftKey) {  // insert
                if (posCaret !== undefined && posCaret == 0) {
                    // add item before current item
                    if (this.selected.index > 0) {
                        this.addItem('', this.selected.index - 1);
                    } else {
                        this.selected.index = -1;
                        this.addItem('', -1);
                    }
                    if ($event) { $event.stopPropagation(); }
                    if ($event) { $event.preventDefault(); }

                    return false;
                }

                if (textareaLength && posCaret && textareaLength == posCaret) {
                    // add item after current item
                    if (!item.empty) {
                        this.addItem('', this.selected.index);
                    }
                    if ($event) { $event.stopPropagation(); }
                    if ($event) { $event.preventDefault(); }

                    return false;
                }

                if (textareaLength && posCaret && textareaLength > posCaret) {
                    // divide current item 
                    if (!item.empty) {
                        let valueCurrent: string;
                        let newItem: string;
                        valueCurrent = item.text.substring(0, posCaret);
                        newItem = item.text.substring(posCaret);
                        item.text = valueCurrent;
                        this.addItem(newItem, this.selected.index);

                        this.setFocus(this.selected.index, 0);
                    }
                    if ($event) { $event.stopPropagation(); }
                    if ($event) { $event.preventDefault(); }

                    return false;
                }

                if ($event) { $event.preventDefault(); }

                return false;
            }

            // move cursor up
            if ((posCaret === 0 || posCaret == textareaLength) && this.checklistContent.length > 1 && $event.keyCode == 38 && !$event.ctrlKey && !$event.shiftKey) {  // insert
                if ($event) { $event.stopPropagation(); }
                if ($event) { $event.preventDefault(); }

                if (posCaret !== undefined && textareaLength !== undefined && posCaret == 0) {
                    // move to new item
                    if (this.selected.index == 0) {
                        this.selected.index = this.checklistContent.length - 1;
                        var position = this.checklistContent[this.selected.index].text.length;
                        this.setFocus(this.selected.index, position);
                    } else {
                        this.selected.index -= 1;
                        var position = this.checklistContent[this.selected.index].text.length;
                        this.setFocus(this.selected.index, position);
                    }
                } else {
                    // move caret to text end
                    this.setFocus(this.selected.index, 0);
                }

                return false;
            }

            // move cursor down
            if ((posCaret === 0 || posCaret == textareaLength) && this.checklistContent.length > 1 && $event.keyCode == 40 && !$event.ctrlKey && !$event.shiftKey) {  // insert
                if ($event) { $event.stopPropagation(); }
                if ($event) { $event.preventDefault(); }

                if (posCaret !== undefined && textareaLength !== undefined && posCaret == textareaLength) {
                    // move to new item
                    if (this.selected.index >= this.checklistContent.length - 1) {
                        this.selected.index = 0;
                        this.setFocus(this.selected.index, 0);
                    } else {
                        this.selected.index += 1;
                        this.setFocus(this.selected.index, 0);
                    }
                } else {
                    // move caret to text end
                    this.setFocus(this.selected.index, textareaLength);
                }

                return false;
            }

            // delete item
            if (!item.empty && $event.keyCode == 46 && $event.ctrlKey && !$event.shiftKey) {
                if ($event) { $event.stopPropagation(); }
                if ($event) { $event.preventDefault(); }
                this.onDeleteItem(index, item);

                return false;
            }

            // check/uncheck item
            if ($event.keyCode == 32 && $event.ctrlKey && !$event.shiftKey) {
                if ($event) { $event.stopPropagation(); }
                if ($event) { $event.preventDefault(); }
                if (item) {
                    item.checked = !item.checked
                    this._debounceChange();
                }

                return false;
            }
        }
    }

    const ChecklistEdit: ng.IComponentOptions = {
        bindings: ChecklistEditBindings,
        templateUrl: 'checklist_edit/ChecklistEdit.html',
        controller: ChecklistEditController
    }

    angular.module("pipChecklistEdit", ['pipComposite.Templates', 'pipBehaviors'])
        .component('pipChecklistEdit', ChecklistEdit);

}
