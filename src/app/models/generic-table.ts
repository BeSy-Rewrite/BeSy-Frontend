import { Signal } from '@angular/core';
import { MatButtonAppearance } from '@angular/material/button';

/**
 * Interface representing a column in a generic table.
 * @template T - The type of data represented by each row.
 */
export interface TableColumn<T = any> {
  /** Unique identifier for the column. */
  id: string;
  /** Display label for the column header. */
  label: string;
  /** When true, the column is hidden from display. */
  isInvisible?: boolean;
  /** When true, the column cannot be sorted. */
  isUnsortable?: boolean;
  /** Optional action to perform for this column, given a row. */
  action?: (row: T) => void;
  /** Optional footer content for the column, as a signal. */
  footerContent?: Signal<string | number>;
}

/**
 * Interface representing an action button for a table row.
 * @template T - The type of data represented by each row.
 */
export interface TableActionButton<T = any> {
  /** Unique identifier for the action button. */
  id: string;
  /** Display label for the button. */
  label: string;
  /** Appearance style for the button. */
  buttonType?: MatButtonAppearance;
  /** Color theme for the button. */
  color?: ButtonColor;
  /** Optional action to perform when the button is clicked, given a row. */
  action?: (row: T) => void;
  /** Whether the button is disabled. Can be a boolean or a Signal<boolean>. */
  disabled?: boolean | Signal<boolean>;
  /** Optional condition to determine if the button should be shown for a given row. */
  showCondition?: (row: T) => boolean;
}

/**
 * Enum representing available button color themes.
 */
export enum ButtonColor {
  PRIMARY = 'primary',
  ACCENT = 'accent',
  WARN = 'warn',
  DEFAULT = 'default',
}
