export default interface BlogFeed {
  name: string;
  slug: string;
}

export interface BlogFeeds {
  [slug: string]: { id: string; name: string };
}
