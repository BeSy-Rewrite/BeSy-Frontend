import { FormConfig } from '../../components/form-component/form-component.component';

export const NOMINATIM_SEARCH_CONFIG: FormConfig = {
  fields: [
    {
      name: 'nominatim_search',
      label: 'Adresse suchen',
      type: 'search',
      required: false,
      nominatim_param: 'address',
      tooltip: 'Geben Sie eine Adresse ein, um nach passenden Treffern zu suchen.',
    },
  ],
};
