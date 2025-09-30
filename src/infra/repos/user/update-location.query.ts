import { Location, UpdateLocation } from "@/src/domain/tcg/location.model";
import { DB } from "@/src/infra/db/db";
import { locations } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updateLocationQuery(
  db: DB,
  updateLocation: UpdateLocation
): Promise<Location> {
  const result = await db
    .update(locations)
    .set({
      ...updateLocation,
      updatedAt: new Date(),
    })
    .where(eq(locations.id, updateLocation.id))
    .returning();

  return result[0];
}
