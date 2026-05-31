import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, X } from 'lucide-react';
import { Settings } from '../store/settings';
import { STAGES } from '../store/stageData';
import { FOOTPRINT_DECORATIONS, ProgressStore } from '../store/progressStore';
import './KidsMode.css';

const MAP_STAGES = [
  { id: 1, x: 14, y: 79, color: 'green', label: 'ものと かずを\nあわせよう', note: '1たい1 たいおう', boardSide: 'right' },
  { id: 2, x: 29, y: 48, color: 'cyan', label: 'じゅんばんに\nかぞえよう', note: '1から じゅんばん', boardSide: 'right' },
  { id: 3, x: 31, y: 19, color: 'blue', label: 'つぎの かずは\nなに？', note: 'つづきの かず', boardSide: 'right' },
  { id: 4, x: 57, y: 78, color: 'purple', label: 'すうじと\nなかよし', note: 'すうじカード', boardSide: 'right' },
  { id: 5, x: 70, y: 57, color: 'orange', label: 'わけると\nあわせる', note: 'かずの しくみ', boardSide: 'right' },
  { id: 6, x: 66, y: 28, color: 'peach', label: 'おおきい かずは\nどっち？', note: 'かずの おおきさ', boardSide: 'right' },
];

export default function KidsMode() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => Settings.get());
  const profile = ProgressStore.getActive();
  useEffect(() => { if (!profile) navigate('/profiles'); }, [navigate, profile]);
  if (!profile) return null;
  const nextDecoration = FOOTPRINT_DECORATIONS.find(({ at }) => at > profile.footprints);
  const progressGoal = nextDecoration?.at || Math.max(50, profile.footprints);
  const progressWidth = Math.min(100, (profile.footprints / progressGoal) * 100);
  const goalCleared = STAGES.every((stage) => ProgressStore.getStageStatus(stage).cleared);

  const updateSetting = (key, value) => {
    const next = Settings.set(key, value);
    setSettings(next);
  };

  return (
    <div className="kids-map-page">
      <header className="kids-map-header">
        <button className="btn map-header-button" onClick={() => navigate('/')}>
          <ArrowLeft size={24} /> <span>もどる</span>
        </button>
        <div className="kids-map-logo">
          <span>⭐</span>
          <strong>かずの ぼうけん</strong>
        </div>
        <button className="btn map-header-button" onClick={() => setShowSettings(true)}>
          <SettingsIcon size={21} /> <span>せってい</span>
        </button>
      </header>

      <main className="kids-map-world">
        <button
          className={`kids-map-goal${goalCleared ? ' is-cleared' : ''}`}
          aria-label={goalCleared ? 'ぜんぶ クリア！ おしろへ いこう' : 'ぼうけんの おしろ'}
          onClick={() => navigate('/kids/castle')}
        >
          <span className="kids-map-goal-stone">{goalCleared ? '👑' : '🏰'}</span>
          <span className="kids-map-goal-board">
            <strong>これまでの<br />がんばり</strong>
            <small>{goalCleared ? 'ぜんぶ クリア！' : 'ゴールは ここ！'}</small>
          </span>
        </button>

        <svg className="kids-map-path" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden="true">
          <path d="M70 700 C135 625 235 600 285 520 C335 440 255 255 310 145 C390 15 530 665 575 605 C640 520 785 495 760 430 C735 355 635 280 690 190 C770 85 865 125 940 75" />
        </svg>
        <svg className="kids-map-path kids-map-path-ipad" viewBox="0 0 1000 760" preserveAspectRatio="none" aria-hidden="true">
          <path d="M80 700 C130 650 145 610 150 578 C180 500 210 430 220 357 C225 280 230 210 240 144 C350 270 470 520 670 593 C710 560 720 490 720 403 C720 320 725 260 730 205 C800 150 870 110 940 82" />
        </svg>

        {MAP_STAGES.map((mapStage) => {
          const stage = STAGES.find(({ id }) => id === mapStage.id);
          const status = ProgressStore.getStageStatus(stage);

          return (
            <button
              key={mapStage.id}
              className={`map-stage map-stage-${mapStage.color}${status.perfect ? ' is-perfect' : status.cleared ? ' is-cleared' : status.started ? ' is-started' : ''}`}
              style={{ left: `${mapStage.x}%`, top: `${mapStage.y}%` }}
              onClick={() => navigate(`/kids/stage/${mapStage.id}`)}
              aria-label={`${mapStage.id}. ${mapStage.label.replace('\n', ' ')}`}
            >
              <span className="map-stage-stone">{mapStage.id}</span>
              <span className={`map-stage-board board-${mapStage.boardSide}`}>
                <span className="map-stage-copy">
                  <strong>{mapStage.label.split('\n').map((line) => <span key={line}>{line}</span>)}</strong>
                  <small>{mapStage.note}</small>
                  {status.cleared && <b>{status.perfect ? '👑 かんぜんクリア' : '🚩 めんクリア'}</b>}
                </span>
              </span>
            </button>
          );
        })}

        <div className="map-progress">
          <div className="map-progress-meter">
            <strong>👣 {profile.name}の がんばりメーター</strong>
            <div className="map-progress-track"><span style={{ width: `${progressWidth}%` }} /></div>
            <small>
              {nextDecoration
                ? `あと ${nextDecoration.at - profile.footprints}こで ごほうび！`
                : `${profile.footprints}この あしあとを あつめたよ！`}
            </small>
          </div>
          <div className="map-progress-reward">
            {nextDecoration ? (
              <>
                <span aria-hidden="true">{nextDecoration.icon}</span>
                <strong>{nextDecoration.name}</strong>
              </>
            ) : (
              <>
                <span aria-hidden="true">✨</span>
                <strong>ごほうび コンプリート！</strong>
              </>
            )}
          </div>
          <p>クリアするたび ⭐ が ふえるよ。<br />くりかえし やってみよう！</p>
          <button className="map-profile-switch" onClick={() => navigate('/profiles')}>ひとを かえる</button>
        </div>
      </main>

      {showSettings && (
        <div className="map-settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="map-settings-panel animate-pop-in" onClick={(event) => event.stopPropagation()}>
            <div className="map-settings-title">
              <strong><SettingsIcon size={20} /> せってい</strong>
              <button onClick={() => setShowSettings(false)} aria-label="とじる"><X size={22} /></button>
            </div>
            <hr />
            <div>
              <strong>📝 1ラウンドの もんだいすう</strong>
              <div className="map-settings-numbers">
                {[2, 3, 5, 7, 10].map((number) => (
                  <button
                    key={number}
                    className={settings.questionsPerRound === number ? 'is-active' : ''}
                    onClick={() => updateSetting('questionsPerRound', number)}
                  >
                    {number}
                  </button>
                ))}
              </div>
              <small>いまは {settings.questionsPerRound}もん</small>
            </div>
            <button className="btn btn-primary" onClick={() => setShowSettings(false)}>とじる</button>
          </div>
        </div>
      )}
    </div>
  );
}
