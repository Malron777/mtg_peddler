import { User } from "@/src/domain/auth/user.model";
import { DB } from "@/src/infra/db/db";
import { user } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export interface GetUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function getUserQuery(
  db: DB,
  userId: string
): Promise<GetUserResult> {
  try {
    const result = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (result) {
      return {
        success: true,
        user: result,
      };
    } else {
      return {
        success: false,
        error: "User not found",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
