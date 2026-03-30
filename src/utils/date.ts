/**
 * JST（Asia/Tokyo）基準の今日の日付を YYYY-MM-DD 形式で返す。
 * `new Date().toISOString()` は UTC を返すため、JST との日付ズレを防ぐためにこちらを使う。
 */
export function jstToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
}
