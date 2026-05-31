export const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'];

export function makeChoices(answer, min = 1, max = 10) {
  const choices = new Set([answer]);
  while (choices.size < 3) choices.add(Math.floor(Math.random() * (max - min + 1)) + min);
  return [...choices].sort(() => Math.random() - 0.5);
}
