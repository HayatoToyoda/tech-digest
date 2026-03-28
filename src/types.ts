export interface RawArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO 8601
  score?: number;       // HN スコア
  commentCount?: number; // HN コメント数
}

export interface ArticleCandidate extends RawArticle {
  bodyText?: string; // 抽出本文 (最大 3000 文字)
  preScore: number;  // ルールベーススコア
}

export type Category = 'AI' | 'Web' | 'Security' | 'OSS' | 'Platform';

export interface DigestItem {
  rank: number;
  title: string;
  url: string;
  source: string;
  category: Category;
  summary: string;       // 日本語ダイジェスト
  importance: string;    // なぜ重要か (日本語)
  targetReaders: string; // 読むべき人 (日本語)
}

export interface DailyDigest {
  date: string;        // YYYY-MM-DD
  generatedAt: string; // ISO 8601
  items: DigestItem[];
}
