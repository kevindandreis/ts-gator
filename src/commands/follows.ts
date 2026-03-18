import { UserCommandHandler } from "./commands";
import { getFeedByUrl } from "../lib/db/queries/feeds";
import {
  createFeedFollow,
  getFeedFollowsForUser,
  deleteFeedFollow,
} from "../lib/db/queries/feed_follows";

export const handlerFollow: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  if (args.length < 1) {
    throw new Error("usage: follow <url>");
  }

  const url = args[0];

  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`Feed not found with URL: ${url}`);
  }

  try {
    const follow = await createFeedFollow(user.id, feed.id);
    console.log(
      `User '${follow.userName}' is now following feed '${follow.feedName}'`
    );
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`error following feed: ${err.message}`);
    } else {
      throw new Error(`error following feed: ${err}`);
    }
  }
};

export const handlerFollowing: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  try {
    const follows = await getFeedFollowsForUser(user.id);
    if (follows.length === 0) {
      console.log("Not following any feeds.");
      return;
    }

    console.log(`Feeds followed by ${user.name}:`);
    follows.forEach((f) => {
      console.log(`* ${f.feedName}`);
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`error listing following: ${err.message}`);
    } else {
      throw new Error(`error listing following: ${err}`);
    }
  }
};

export const handlerUnfollow: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  if (args.length < 1) {
    throw new Error("usage: unfollow <url>");
  }

  const url = args[0];

  try {
    await deleteFeedFollow(user.id, url);
    console.log(`Successfully unfollowed feed with URL: ${url}`);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`error unfollowing feed: ${err.message}`);
    } else {
      throw new Error(`error unfollowing feed: ${err}`);
    }
  }
};
