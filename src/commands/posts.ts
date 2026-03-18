import { UserCommandHandler } from "./commands";
import { getPostsForUser } from "../lib/db/queries/posts";

export const handlerBrowse: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  let limit = 2;
  if (args.length > 0) {
    const parsedLimit = parseInt(args[0]);
    if (!isNaN(parsedLimit)) {
      limit = parsedLimit;
    }
  }

  try {
    const posts = await getPostsForUser(user.id, limit);
    if (posts.length === 0) {
      console.log("No posts found from your followed feeds.");
      return;
    }

    console.log(`Latest ${posts.length} posts for ${user.name}:`);
    for (const post of posts) {
      console.log(`--- ${post.title} ---`);
      console.log(`Source URL:  ${post.url}`);
      console.log(`Published:   ${post.publishedAt?.toLocaleString() || "N/A"}`);
      if (post.description) {
        // Clean up description if it's too long or has HTML (optional simple cleanup)
        const cleanDesc = post.description.replace(/<[^>]*>?/gm, "").substring(0, 200);
        console.log(`Description: ${cleanDesc}${post.description.length > 200 ? "..." : ""}`);
      }
      console.log("");
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`error fetching posts: ${err.message}`);
    } else {
      throw new Error(`error fetching posts: ${err}`);
    }
  }
};
