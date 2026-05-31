// アプリ全体の設定をlocalStorageで管理するシンプルなストア

const STORAGE_KEY = 'kazu_settings';

const DEFAULTS = {
  questionsPerRound: 3,   // 1ラウンドの問題数
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const Settings = {
  get: load,
  set(key, value) {
    const current = load();
    const next = { ...current, [key]: value };
    save(next);
    return next;
  },
};
