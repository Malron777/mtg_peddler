import { StoreStaff } from "@/src/domain/auth/store-staff.model";
import { DB } from "@/src/infra/db/db";
import { storeStaff } from "@/src/infra/db/schema";
import { and, eq } from "drizzle-orm";

export interface GetStoreStaffResult {
  success: boolean;
  storeStaff?: StoreStaff;
  error?: string;
}

export async function getStoreStaffQuery(
  db: DB,
  storeId: string,
  userId: string
): Promise<GetStoreStaffResult> {
  try {
    const result = await db.query.storeStaff.findFirst({
      where: and(
        eq(storeStaff.storeId, storeId),
        eq(storeStaff.userId, userId)
      ),
    });

    if (result) {
      return {
        success: true,
        storeStaff: result,
      };
    } else {
      return {
        success: false,
        error: "Store staff not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
