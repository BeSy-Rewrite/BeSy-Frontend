import { MatButtonAppearance } from "@angular/material/button";


export interface TableColumn {
    id: string;
    label: string;
    isUnsortable?: boolean;
    action?: (row: any) => void; // Optional action for the column
}

export interface TableActionButton {
    id: string;
    label: string;
    buttonType?: MatButtonAppearance;
    color?: ButtonColor;
    action?: (row: any) => void;
}

export enum ButtonColor {
    PRIMARY = 'primary',
    ACCENT = 'accent',
    WARN = 'warn',
    DEFAULT = 'default'
}
