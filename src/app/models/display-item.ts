export type DisplayItem = {
    name: string;
    comment: string;
    article_id: string;
    preferred_list: string;
    vat: string;
    vat_type: string;
    price_per_unit: string;
    quantity: string;
    price_total: string | number;
    tooltips?: { [K in keyof Omit<DisplayItem, 'tooltips'>]: string };
}
