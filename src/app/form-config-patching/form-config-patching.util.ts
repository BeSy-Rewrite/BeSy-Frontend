import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, Observable } from 'rxjs';
import { FormConfig } from '../components/form-component/form-component.component';

export type OptionsMap = Record<string, Observable<unknown[]>>;

/**
 * Subscribes to all given option sources in parallel and patches
 * the matching fields in the form config signal immutably.
 */
export function patchAutocompleteOptions<T extends FormConfig>(
  configSignal: WritableSignal<T>,
  sources: OptionsMap,
  destroyRef: DestroyRef
): void {
  if (Object.keys(sources).length === 0) return;

  combineLatest(sources)
    .pipe(takeUntilDestroyed(destroyRef))
    .subscribe(optionsByFieldName => {
      configSignal.update(config => ({
        ...config,
        fields: config.fields.map(field =>
          field.name in optionsByFieldName
            ? { ...field, options: optionsByFieldName[field.name] }
            : field
        ),
      }));
    });
}

export type DefaultValuesMap = Record<string, unknown>;

/**
 * Immutably patches `defaultValue` onto the matching fields of a form config signal.
 * Only fields present as keys in `values` are touched; others are left untouched.
 */
export function patchFormDefaultValues<T extends FormConfig>(
  configSignal: WritableSignal<T>,
  values: DefaultValuesMap
): void {
  if (!values || Object.keys(values).length === 0) return;

  configSignal.update(config => ({
    ...config,
    fields: config.fields.map(field =>
      field.name in values ? { ...field, defaultValue: values[field.name] } : field
    ),
  }));
}
