import { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogStore } from '../store/logStore';
import { Settings } from '../store/settings';
import { speak } from '../utils/speak';
import './ActivityS4Match.css';
import CompletionActions from './CompletionActions';

function makeProblem() {
  const target = Math.floor(Math.random() * 10) + 1;
  const numbers = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10) + 1);
  numbers[Math.floor(Math.random() * numbers.length)] = target;
  return { target, numbers: numbers.sort(() => Math.random() - 0.5) };
}

export default function ActivityS4Hunt() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  const [problem, setProblem] = useState(makeProblem);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('play');
  const [wrongIndex, setWrongIndex] = useState(null);
  const [correctIndex, setCorrectIndex] = useState(null);
  const cards = useMemo(() => problem.numbers, [problem]);

  const reset = () => { setProblem(makeProblem()); setRound(0); setPhase('play'); setWrongIndex(null); setCorrectIndex(null); };
  const choose = (number, index) => {
    if (phase !== 'play') return;
    if (number !== problem.target) {
      setWrongIndex(index); speak('おしい！ もういちど さがしてみよう'); setTimeout(() => setWrongIndex(null), 500); return;
    }
    setCorrectIndex(index); setPhase('correct'); speak(`みつけた！ ${number} だね`);
    LogStore.addLog({ stage: 'S4', activity: 'number_hunt', target: number, correct: true });
  };
  const next = () => {
    if (round + 1 >= maxQ) setPhase('complete');
    else { setRound((value) => value + 1); setProblem(makeProblem()); setPhase('play'); setCorrectIndex(null); }
  };

  return <div className="candy-count-page"><header className="candy-count-header"><button className="btn" onClick={() => navigate('/kids/stage/4')}><ArrowLeft size={20} /> <span>もどる</span></button><div className="candy-count-title">🔎 すうじを さがそう</div><button className="btn" onClick={reset}><RotateCcw size={19} /></button></header>
    <main className="candy-count-main">{phase === 'complete' ? <><div style={{ fontSize: '95px' }}>🎉</div><div className="candy-count-question">{maxQ}もん みつけたね！</div></> : <>
      <div className="candy-count-question"><strong>{problem.target}</strong> は どこに あるかな？</div>
      {phase === 'correct' && <div className="candy-count-feedback">⭐ みつけた！ ⭐</div>}
      <div className="candy-hunt-grid">{cards.map((number, index) => <button key={`${number}-${index}`} className={`candy-hunt-card${wrongIndex === index ? ' is-wrong' : ''}${correctIndex === index ? ' is-correct' : ''}`} onClick={() => choose(number, index)}>{number}</button>)}</div>
    </>}</main><footer className="candy-count-footer">{phase === 'correct' && <button className="btn btn-primary" onClick={next}>{round + 1 >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button>}{phase === 'complete' && <CompletionActions activityId="S4_hunt" onRestart={reset} stagePath="/kids" />}</footer></div>;
}
