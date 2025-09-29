import { ScryfallCard, ScryfallService } from "../services/scryfall.service";

export interface GetCardUseCase {
  getCardByName(cardName: string, exact?: boolean): Promise<ScryfallCard>;
  getCardVersions(oracleId: string): Promise<ScryfallCard[]>;
}

export class GetCardUseCaseImpl implements GetCardUseCase {
  constructor(private scryfallService: ScryfallService) {}

  async getCardByName(
    cardName: string,
    exact: boolean = false
  ): Promise<ScryfallCard> {
    try {
      return await this.scryfallService.getCardByName(cardName, exact);
    } catch (error) {
      console.error("Error fetching card:", error);
      throw error;
    }
  }

  async getCardVersions(oracleId: string): Promise<ScryfallCard[]> {
    try {
      return await this.scryfallService.getCardVersions(oracleId);
    } catch (error) {
      console.error("Error fetching card versions:", error);
      throw error;
    }
  }
}

// Factory function to create the use case
export function createGetCardUseCase(): GetCardUseCase {
  const scryfallService = new ScryfallService();
  return new GetCardUseCaseImpl(scryfallService);
}
