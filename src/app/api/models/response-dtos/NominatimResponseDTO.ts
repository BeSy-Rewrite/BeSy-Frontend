export interface NominatimAddress {
  house_number?: string;
  road?: string;
  town?: string;
  postcode?: string;
  county?: string;
  country?: string;
  [key: string]: string | undefined; // fallback für dynamische Keys
}

export interface NominatimResponseDTO {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  category: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype?: string;
  name?: string;
  display_name: string;
  address: NominatimAddress;
  boundingbox: [string, string, string, string];
}
