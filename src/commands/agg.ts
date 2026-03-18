import { CommandHandler } from "./commands";
import { fetchFeed } from "../rss";
import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds";
import { createPost } from "../lib/db/queries/posts";

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    throw new Error(`Invalid duration string: ${durationStr}`);
  }
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return value;
  }
}

function parsePublishedAt(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;

  // new Date() handles RFC 2822 (standard RSS) and ISO 8601 (Atom) natively
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // Some feeds use non-standard formats like "Mon, 02 Jan 2006 15:04:05 -0700"
  // with extra whitespace or unusual timezone offsets — try trimming and retrying
  const trimmed = dateStr.trim().replace(/\s+/g, " ");
  const d2 = new Date(trimmed);
  if (!isNaN(d2.getTime())) {
    return d2;
  }

  console.warn(`Could not parse date: "${dateStr}"`);
  return undefined;
}

async function scrapeFeeds() {
  const nextFeed = await getNextFeedToFetch();
  if (!nextFeed) {
    console.log("No feeds to fetch.");
    return;
  }

  await markFeedFetched(nextFeed.id);
  const feedContent = await fetchFeed(nextFeed.url);
  console.log(`Scraping ${feedContent.items.length} posts from ${nextFeed.name}`);
  for (const item of feedContent.items) {
    try {
      await createPost({
        title: item.title,
        url: item.link,
        description: item.description,
        publishedAt: parsePublishedAt(item.pubDate),
        feedId: nextFeed.id,
      });
    } catch (err) {
      // url unique constraint is handled by onConflictDoNothing in createPost
      // we only log unexpected errors
      console.error(`Error saving post ${item.title}:`, err);
    }
  }
}

export const handlerAgg: CommandHandler = async (cmdName, ...args) => {
  if (args.length !== 1) {
    throw new Error("usage: agg <time_between_reqs>");
  }

  const timeBetweenRequests = parseDuration(args[0]);
  console.log(`Collecting feeds every ${args[0]}`);

  const handleError = (err: any) => {
    console.error(
      "Error scraping feeds:",
      err instanceof Error ? err.message : err
    );
  };

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("\nShutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
};
