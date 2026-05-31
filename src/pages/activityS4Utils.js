export const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'];

export const CANDIES = [
  { name: 'ドーナツ', icon: '🍩', count: 1 },
  { name: 'キャンディ', icon: '🍬', count: 2 },
  { name: 'クッキー', icon: '🍪', count: 3 },
  { name: 'プリン', icon: '🍮', count: 4 },
  { name: 'カップケーキ', icon: '🧁', count: 5 },
  { name: 'チョコレート', icon: '🍫', count: 6 },
  { name: 'アイスクリーム', icon: '🍦', count: 7 },
  { name: 'ロリポップ', icon: '🍭', count: 8 },
  { name: 'ショートケーキ', icon: '🍰', count: 9 },
  { name: 'キャンディ', icon: '🍬', count: 10 },
];

export function shuffledCandies() {
  return [...CANDIES].sort(() => Math.random() - 0.5);
}

export function makeChoices(answer, count = 3) {
  const choices = new Set([answer]);
  while (choices.size < count) choices.add(Math.floor(Math.random() * 10) + 1);
  return [...choices].sort(() => Math.random() - 0.5);
}
