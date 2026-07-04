import { eq, like, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, mods, Mod, InsertMod, favorites, reviews, Review, InsertReview, screenshots, Screenshot, InsertScreenshot } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Mod queries
export async function getAllMods(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mods).limit(limit).offset(offset).orderBy(desc(mods.downloads));
}

export async function searchMods(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mods)
    .where(like(mods.name, `%${query}%`))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(mods.downloads));
}

export async function getModsByCategory(category: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mods)
    .where(eq(mods.category, category))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(mods.downloads));
}

export async function getModById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(mods).where(eq(mods.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMod(mod: InsertMod) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(mods).values(mod);
  return result;
}

export async function updateMod(id: number, updates: Partial<Mod>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(mods).set(updates).where(eq(mods.id, id));
}

// Favorites queries
export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    mod: mods,
    favoriteId: favorites.id,
  })
    .from(favorites)
    .innerJoin(mods, eq(favorites.modId, mods.id))
    .where(eq(favorites.userId, userId));
}

export async function addFavorite(userId: number, modId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.insert(favorites).values({ userId, modId });
  } catch (error: any) {
    // Handle duplicate favorite gracefully
    if (error?.code === 'ER_DUP_ENTRY' || error?.message?.includes('UNIQUE')) {
      // Already favorited, return success
      return { success: true, message: 'Already favorited' };
    }
    throw error;
  }
}

export async function removeFavorite(userId: number, modId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.modId, modId)));
}

// Reviews queries
export async function getModReviews(modId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.modId, modId)).orderBy(desc(reviews.createdAt));
}

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reviews).values(review);
}

export async function updateReview(id: number, updates: Partial<Review>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(reviews).set(updates).where(eq(reviews.id, id));
}

// Screenshots queries
export async function getModScreenshots(modId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(screenshots)
    .where(eq(screenshots.modId, modId))
    .orderBy(screenshots.order);
}

export async function addScreenshot(screenshot: InsertScreenshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(screenshots).values(screenshot);
}

export async function deleteScreenshot(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(screenshots).where(eq(screenshots.id, id));
}

export async function updateScreenshot(id: number, updates: Partial<Screenshot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(screenshots).set(updates).where(eq(screenshots.id, id));
}
