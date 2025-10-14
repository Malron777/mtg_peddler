import { DB } from "@/src/infra/db/db";
import {
  GetCollectionInformationOptions,
  getCollectionInformationQuery,
} from "@/src/infra/repos/collection/get-collection-information.query";

export interface GetCollectionInformationUseCaseOptions {
  includeFoil?: boolean;
  priceSource?: "tcg" | "scg" | "custom" | "mtggoldfish" | "cardmarket";
}

export interface GetCollectionInformationUseCaseResult {
  success: boolean;
  data?: {
    collections: Array<{
      id: string;
      name: string;
      description: string | null;
      isPublic: boolean;
      createdAt: Date;
      updatedAt: Date;
      cardCount: number;
      totalValue: number;
      dealCount: number;
      breakdown: {
        foilValue: number;
        nonFoilValue: number;
        customPriceValue: number;
        marketPriceValue: number;
      };
    }>;
    totalCards: number;
    totalValue: number;
    totalDeals: number;
  };
  error?: string;
}

export async function getCollectionInformationUseCase(
  db: DB,
  userId: string,
  options: GetCollectionInformationUseCaseOptions = {}
): Promise<GetCollectionInformationUseCaseResult> {
  try {
    // Validate input
    if (!userId || userId.trim() === "") {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    // Map use case options to query options
    const queryOptions: GetCollectionInformationOptions = {
      includeFoil: options.includeFoil ?? true,
      priceSource: options.priceSource ?? "tcg",
    };

    console.log("Executing getCollectionInformationQuery with:", {
      userId,
      queryOptions,
    });

    // Execute the query
    const result = await getCollectionInformationQuery(
      db,
      userId,
      queryOptions
    );

    console.log("Query result:", result);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error in getCollectionInformationUseCase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
