/**
 * Interface representing a filter chip's data structure.
 */
export interface FilterChipData {
    /** Unique identifier for the chip, can be a number or string. */
    id?: number | string;
    /** Display label for the chip. */
    label: string;
    /** Tooltip text for the chip. */
    tooltip?: string;
    /** Flag indicating if the chip is selected. */
    isSelected?: boolean;
    /** Optional color for the chip. */
    color?: string;
}
