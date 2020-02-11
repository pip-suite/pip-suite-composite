declare module pip.composite {

export const ChecklistDraggEvent: string;


export const CompositeEmptyEvent: string;
export const CompositeAddItemEvent: string;
export const CompositeNotEmptyEvent: string;
export class CompositeAddItem {
    id: number;
    type: string;
}
export class CompositeControl {
    save: (successCallback?: (data: CompositeContent[]) => void, errorCallback?: (error: any) => void) => void;
    abort: () => void;
    error?: any;
}
export class CompositeContent extends ContentBlock {
    empty?: boolean;
    documents?: pip.documents.DocumentListEditControl;
    pictures?: pip.pictures.PictureListEditControl;
}
export class CompositeBlockTypes {
    static Text: string;
    static Pictures: string;
    static Checklist: string;
    static Documents: string;
    static Location: string;
    static Time: string;
    static SecondaryBlock: string[];
    static PrimaryBlock: string[];
    static All: string[];
}


export class CompositeAddItemEventParams {
    type: string;
    id: string;
}
export class CompositeToolbarButton {
    picture: boolean;
    document: boolean;
    location: boolean;
    event: boolean;
    checklist: boolean;
    text: boolean;
}



export class ChecklistItem {
    checked: boolean;
    text: string;
    empty?: boolean;
}

export class ContentBlock {
    id?: number;
    type: string;
    text?: string;
    docs?: pip.documents.Attachment[];
    picIds?: pip.documents.Attachment[];
    pic_ids?: string[];
    loc_pos?: any;
    loc_name?: string;
    start?: string;
    end?: string;
    all_day?: boolean;
    checklist?: ChecklistItem[];
    embed_type?: string;
    embed_uri?: string;
    custom?: any;
}

export class ContentBlockType {
    static readonly Text: string;
    static readonly Checklist: string;
    static readonly Location: string;
    static readonly Time: string;
    static readonly Pictures: string;
    static readonly Documents: string;
    static readonly Embedded: string;
    static readonly Custom: string;
}

export class EmbeddedType {
    static readonly Youtube: string;
    static readonly Custom: string;
}







export const CompositeFocusedEvent: string;

}
