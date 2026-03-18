import { XMLParser } from "fast-xml-parser";

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
}

export interface RSSFeed {
  title: string;
  link: string;
  description: string;
  items: RSSItem[];
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }

  const xmlString = await response.text();
  const parser = new XMLParser();
  const parsed = parser.parse(xmlString);

  const channel = parsed.rss?.channel;
  if (!channel) {
    throw new Error("Invalid RSS feed: missing channel field");
  }

  const title = channel.title;
  const link = channel.link;
  const description = channel.description;

  if (!title || !link || !description) {
    throw new Error("Invalid RSS feed: missing required channel metadata (title, link, or description)");
  }

  const items: RSSItem[] = [];
  const rawItems = channel.item;

  if (rawItems) {
    const itemArray = Array.isArray(rawItems) ? rawItems : [rawItems];
    for (const item of itemArray) {
      if (item.title && item.link) {
        items.push({
          title: String(item.title),
          link: String(item.link),
          description: item.description ? String(item.description) : "",
          pubDate: item.pubDate ? String(item.pubDate) : undefined,
        });
      }
    }
  }

  return {
    title: String(title),
    link: String(link),
    description: String(description),
    items,
  };
}
