/**
 * Represents an option for an autocomplete field.
 *
 * @template T The type of the value associated with the option.
 * @property {string} label - The display label for the option.
 * @property {T} value - The underlying value associated with the option.
 */
export type AutocompleteOption<T> = {
  label: string;
  value: T;
};

/**
 * Creates an AutocompleteOption object from a given value and an optional formatter function.
 *
 * @template T The type of the value associated with the option.
 * @param {T} option - The value to be wrapped in the AutocompleteOption.
 * @param {(option: T) => string} [formatter] - An optional function to format the label for the option.
 * @returns {AutocompleteOption<T> | undefined} An AutocompleteOption object or undefined if the input is invalid.
 */
export function createAutocompleteOption<T>(
  option: T,
  formatter?: (option: T) => string
): AutocompleteOption<T> | undefined {
  if (!option) return undefined;

  return {
    label: formatter ? formatter(option) : option.toString(),
    value: option,
  };
}
