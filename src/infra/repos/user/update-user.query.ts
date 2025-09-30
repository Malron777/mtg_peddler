import { UpdateUser, User } from "@/src/domain/auth/user.model";
import { DB } from "@/src/infra/db/db";
import { user } from "@/src/infra/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserQuery(
  db: DB,
  updateUser: UpdateUser
): Promise<User> {
  const result = await db
    .update(user)
    .set({
      ...updateUser,
      updatedAt: new Date(),
    })
    .where(eq(user.id, updateUser.id))
    .returning();

  return result[0];
}
