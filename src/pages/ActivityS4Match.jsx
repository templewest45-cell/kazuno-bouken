import { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogStore } from '../store/logStore';
import { Settings } from '../store/settings';
import { speak } from '../utils/speak';
import { shuffledCandies } from './activityS4Utils';
import './ActivityS4Match.css';
import CompletionActions from './CompletionActions';

export default function ActivityS4Match({ maxNumber = 10, activityId = 'S4_match', logActivity = 'snack_number_match' }) {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  const makeSnacks = () => shuffledCandies().filter((snack) => snack.count <= maxNumber);
  const [snacks, setSnacks] = useState(makeSnacks);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('play');
  const [wrong, setWrong] = useState(null);
  const snack = snacks[round % snacks.length];

  const reset = () => { setSnacks(makeSnacks()); setRound(0); setPhase('play'); setWrong(null); };
  const choose = (number) => {
    if (phase !== 'play') return;
    if (number !== snack.count) {
      setWrong(number); speak('おしい！ おかしを もういちど かぞえてみよう'); setTimeout(() => setWrong(null), 500); return;
    }
    setPhase('correct');
    speak(`せいかい！ ${snack.name}は ${number}こ`);
    LogStore.addLog({ stage: 'S4', activity: logActivity, snack: snack.name, count: number, max: maxNumber, correct: true });
  };
  const drop = (event) => { event.preventDefault(); choose(Number(event.dataTransfer.getData('text/plain'))); };
  const next = () => {
    if (round + 1 >= maxQ) setPhase('complete');
    else { setRound((value) => value + 1); setPhase('play'); }
  };

  return <div className="candy-count-page">
    <header className="candy-count-header">
      <button className="btn" onClick={() => navigate('/kids/stage/4')}><ArrowLeft size={20} /> <span>もどる</span></button>
      <div className="candy-count-title">🍭 おかしは なんこ？ 🍬</div>
      <button className="btn" onClick={reset} aria-label="さいしょから"><RotateCcw size={19} /></button>
    </header>
    <main className="candy-count-main">
      {phase === 'complete' ? <>
        <div style={{ fontSize: '95px' }}>🎉</div><div className="candy-count-question">{maxQ}もん できたね！</div>
      </> : <>
        <div className="candy-count-question">{snack.name}は なんこ あるかな？</div>
        <div className="candy-count-board">
          <div className="candy-count-items">{Array.from({ length: snack.count }, (_, index) => <span key={index}>{snack.icon}</span>)}</div>
          <div className={`candy-count-drop${phase === 'correct' ? ' is-correct' : ' is-target'}`} onDragOver={(event) => event.preventDefault()} onDrop={drop}>
            {phase === 'correct' ? snack.count : '?'}
          </div>
        </div>
        <div className="candy-count-guide">{phase === 'correct' ? <span className="candy-count-feedback">⭐ せいかい！ ⭐</span> : 'すうじカードを ？ へ はこぼう！ タップでも えらべるよ'}</div>
        <div className="candy-number-tray">{Array.from({ length: maxNumber }, (_, index) => index + 1).map((number) =>
          <button key={number} draggable={phase === 'play'} onDragStart={(event) => event.dataTransfer.setData('text/plain', String(number))}
            className={`candy-number-card${wrong === number ? ' is-wrong' : ''}`} onClick={() => choose(number)}>{number}</button>)}</div>
      </>}
    </main>
    <footer className="candy-count-footer">{phase === 'correct' && <button className="btn btn-primary" onClick={next}>{round + 1 >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button>}
      {phase === 'complete' && <CompletionActions activityId={activityId} onRestart={reset} stagePath="/kids" />}</footer>
  </div>;
}
