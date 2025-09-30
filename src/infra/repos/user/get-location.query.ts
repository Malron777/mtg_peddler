import { Location } from "@/src/domain/tcg/location.model";
import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetLocationResult {
  success: boolean;
  location?: Location;
  error?: string;
}

export async function getLocationQuery(
  db: DB,
  id: string
): Promise<GetLocationResult> {
  try {
    const result = await db.query.locations.findFirst({
      where: eq(locations.id, id),
    });

    if (result) {
      return {
        success: true,
        location: result,
      };
    } else {
      return {
        success: false,
        error: "Location not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
