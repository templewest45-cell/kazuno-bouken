// ── 全ステージ共通の読み上げユーティリティ ──────────────────────
// 女性の Neural/Natural 音声を優先選択し、voiceschanged イベントでキャッシュする
// Web Speech API には gender がないため、音声名で女性音声を判定する。
const FEMALE_VOICE_NAMES = [
  'Nanami',
  'Haruka',
  'Ayumi',
  'Kyoko',
  'O-Ren',
];

const NEURAL_VOICE_LABELS = ['Neural', 'Natural', 'Online'];

let _cachedVoice = null;
let _isUnlocked = false;

function _loadVoice() {
  if (!('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoices = voices.filter((v) => v.lang.startsWith('ja'));
  const found =
    japaneseVoices.find(
      (v) =>
        FEMALE_VOICE_NAMES.some((n) => v.name.includes(n)) &&
        NEURAL_VOICE_LABELS.some((label) => v.name.includes(label))
    ) ||
    japaneseVoices.find((v) =>
      FEMALE_VOICE_NAMES.some((n) => v.name.includes(n))
    ) ||
    japaneseVoices.find((v) =>
      NEURAL_VOICE_LABELS.some((label) => v.name.includes(label))
    ) ||
    japaneseVoices[0];
  if (found) _cachedVoice = found;
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = _loadVoice;
  _loadVoice();
}

export function unlockSpeech() {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.resume();
  _loadVoice();
  if (_isUnlocked) return;

  const u = new SpeechSynthesisUtterance(' ');
  u.lang = 'ja-JP';
  u.volume = 0;
  synth.speak(u);
  _isUnlocked = true;
}

// 楽しい感嘆詞プレフィックス（短いものをランダムに付ける）
const FUN_PREFIX = ['', '', '', 'さあ、', 'いくよ！', 'やってみよう！', 'がんばれ！'];

/**
 * テキストを明るい高い声で読み上げる（全ステージ共通）
 * @param {string} text
 * @param {boolean} withPrefix - 楽しいプレフィックスを付けるか
 */
export function speak(text, withPrefix = false) {
  if (!('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.resume();
  _loadVoice();
  synth.cancel();
  const prefix = withPrefix
    ? FUN_PREFIX[Math.floor(Math.random() * FUN_PREFIX.length)]
    : '';
  const u = new SpeechSynthesisUtterance(prefix + text);
  u.lang = 'ja-JP';
  u.rate = 0.85; // もっとゆっくり
  u.pitch = 1.1; // 少し明るめに調整
  if (_cachedVoice) u.voice = _cachedVoice;
  synth.speak(u);
}
