import { ChecklistItem } from './ChecklistItem';

export class ContentBlock {
    public id?: number;
    public type: string;
    public text?: string;
    public docs?: pip.documents.Attachment[];
    public picIds?: pip.documents.Attachment[];
    public pic_ids?: string[];
    public loc_pos?: any; 
    public loc_name?: string;
    public start?: string;
    public end?: string;
    public all_day?: boolean;
    public checklist?: ChecklistItem[];
    public embed_type?: string;
    public embed_uri?: string;
    public custom?: any;
}