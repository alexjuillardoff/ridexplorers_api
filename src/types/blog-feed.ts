export interface BlogFeedItem {
  [key: string]: any;
}

export default interface BlogFeed {
  schema: any;
  items: BlogFeedItem[];
}

export interface BlogFeeds {
  [name: string]: BlogFeed;
}
