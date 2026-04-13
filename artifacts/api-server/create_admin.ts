import { db, usersTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  const email = "phamlongh230@gmail.com";
  const username = "phamlongh230";
  const password = "Vutam@18102009";
  const hashed = await bcrypt.hash(password, 12);

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    await db.update(usersTable).set({ role: "admin", isActive: true, password: hashed }).where(eq(usersTable.email, email));
    console.log("Updated:", existing[0].username, "→ admin ✓");
  } else {
    const [user] = await db.insert(usersTable).values({ username, email, password: hashed, role: "admin", avatarColor: "#7c3aed" }).returning();
    console.log("Created:", user.username, user.email, "role:", user.role, "✓");
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
