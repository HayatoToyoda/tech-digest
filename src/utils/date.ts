/**
 * JST（Asia/Tokyo）基準の今日の日付を YYYY-MM-DD 形式で返す。
 * `new Date().toISOString()` は UTC を返すため、JST との日付ズレを防ぐためにこちらを使う。
 * `formatToParts` で年・月・日を個別抽出し、ロケール依存の区切り文字問題を回避する。
 */
export function jstToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find(p => p.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
