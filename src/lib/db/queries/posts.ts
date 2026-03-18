import { db } from "..";
import { posts, feedFollows } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function createPost(post: {
  title: string;
  url: string;
  description?: string;
  publishedAt?: Date;
  feedId: string;
}) {
  const [result] = await db
    .insert(posts)
    .values(post)
    .onConflictDoNothing({ target: posts.url })
    .returning();
  return result;
}

export async function getPostsForUser(userId: string, limit: number = 2) {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}
