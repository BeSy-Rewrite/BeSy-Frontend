export type DisplayQuotation = {
    index: number;
    quote_date: string;
    price: string;
    company_name: string;
    company_city: string;
    // Optional tooltips for each field
    tooltips?: { [K in keyof Partial<Omit<DisplayQuotation, 'tooltips'>>]: string };
}
