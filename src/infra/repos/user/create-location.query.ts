import { InsertLocation, Location } from "@/src/domain/tcg/location.model";
import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema";

export interface CreateLocationResult {
  success: boolean;
  location?: Location;
  error?: string;
}

export async function createLocationQuery(
  db: DB,
  insertLocation: InsertLocation
): Promise<CreateLocationResult> {
  try {
    const result = await db
      .insert(locations)
      .values(insertLocation)
      .returning();

    return {
      success: true,
      location: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
