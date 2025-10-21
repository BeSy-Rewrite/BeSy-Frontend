/**
 * Interface representing a numeric or value range with a start and end.
 */
export interface FilterRange {
    start: number;
    end: number;
}


export function isNumericRange(value: any): value is FilterRange {
    return value
        && typeof value === 'object'
        && 'start' in value
        && 'end' in value
        && typeof value.start === 'number'
        && typeof value.end === 'number';
}
