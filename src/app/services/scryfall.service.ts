export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  colors: string[];
  color_identity: string[];
  legalities: Record<string, string>;
  set: string;
  set_name: string;
  collector_number: string;
  rarity: string;
  artist?: string;
  oracle_id: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    power?: string;
    toughness?: string;
    image_uris?: {
      small: string;
      normal: string;
      large: string;
      png: string;
      art_crop: string;
      border_crop: string;
    };
  }>;
  prices?: {
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
    tix?: string;
  };
}

export interface ScryfallSearchResult {
  object: "list";
  total_cards: number;
  has_more: boolean;
  data: ScryfallCard[];
}

export interface ScryfallError {
  object: "error";
  code: string;
  status: number;
  details: string;
}

export class ScryfallService {
  private readonly baseUrl = "https://api.scryfall.com";
  private readonly userAgent = "MTG-Peddler/1.0";

  async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ScryfallError;
      throw new Error(`Scryfall API Error: ${errorData.details}`);
    }

    return response.json();
  }

  async getCardByName(
    cardName: string,
    exact: boolean = false
  ): Promise<ScryfallCard> {
    const searchType = exact ? "exact" : "fuzzy";
    const encodedName = encodeURIComponent(cardName);
    const endpoint = `/cards/named?${searchType}=${encodedName}`;

    return this.makeRequest<ScryfallCard>(endpoint);
  }

  async getCardByExactName(cardName: string): Promise<ScryfallCard> {
    return this.getCardByName(cardName, true);
  }

  async getCardByFuzzyName(cardName: string): Promise<ScryfallCard> {
    return this.getCardByName(cardName, false);
  }

  async getCardVersions(oracleId: string): Promise<ScryfallCard[]> {
    const encodedOracleId = encodeURIComponent(oracleId);
    const endpoint = `/cards/search?q=oracleid:${encodedOracleId}&unique=prints`;

    const result = await this.makeRequest<ScryfallSearchResult>(endpoint);
    return result.data;
  }
}
