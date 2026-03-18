import { CommandHandler, UserCommandHandler } from "./commands";
import { createFeed, getFeeds } from "../lib/db/queries/feeds";
import { createFeedFollow } from "../lib/db/queries/feed_follows";
import { Feed, User } from "../lib/db/schema";

export const handlerAddFeed: UserCommandHandler = async (
  cmdName,
  user,
  ...args
) => {
  if (args.length < 2) {
    throw new Error("usage: addfeed <name> <url>");
  }

  const [name, url] = args;

  try {
    const feed = await createFeed(name, url, user.id);
    console.log("Feed added successfully:");
    printFeed(feed, user);

    const follow = await createFeedFollow(user.id, feed.id);
    console.log(
      `User '${follow.userName}' is now following feed '${follow.feedName}'`
    );
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`error adding feed: ${err.message}`);
    } else {
      throw new Error(`error adding feed: ${err}`);
    }
  }
};

export const handlerListFeeds: CommandHandler = async (cmdName, ...args) => {
  if (args.length > 0) {
    throw new Error("usage: feeds");
  }

  try {
    const allFeeds = await getFeeds();
    if (allFeeds.length === 0) {
      console.log("No feeds found.");
      return;
    }

    allFeeds.forEach((feed) => {
      console.log(`* Name:          ${feed.name}`);
      console.log(`* URL:           ${feed.url}`);
      console.log(`* User:          ${feed.userName}`);
      console.log("");
    });
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`error listing feeds: ${err.message}`);
    } else {
      throw new Error(`error listing feeds: ${err}`);
    }
  }
};

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* Name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}
