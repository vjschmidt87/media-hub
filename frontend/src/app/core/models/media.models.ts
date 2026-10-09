export type MediaType = 'anime' | 'series' | 'movies' | 'all';
export type WatchStatus = 'PLAN_TO_WATCH' | 'WATCHING' | 'COMPLETED';

export interface SearchResult {
  id: number;
  title: string;
  posterUrl: string | null;
  year: number | null;
  type: string;
  sourceName: string;
  sourceUrl: string;
  description: string | null;
}

export interface Episode {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  durationMinutes: number | null;
  sourceUrl: string | null;
}

export interface Series {
  id: number;
  title: string;
  description: string;
  type: string;
  year: number;
  genres: string[];
  posterUrl: string | null;
  episodes: Episode[];
}

export interface WatchlistEntry {
  id: number;
  seriesId: number;
  seriesTitle: string;
  posterUrl: string | null;
  status: WatchStatus;
  episodesWatched: number;
  totalEpisodes: number;
}

export interface CrawlerSource {
  id: number;
  name: string;
  url: string;
  category: string;
  active: boolean;
}

export interface SearchSettings {
  id: number;
  preferredQuality: string;
  audioLanguage: string;
  subtitleLanguage: string;
  maxResults: number;
  safeSearch: boolean;
  searchTimeoutSeconds: number;
}
