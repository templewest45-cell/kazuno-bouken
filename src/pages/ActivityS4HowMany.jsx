import { useMemo, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogStore } from '../store/logStore';
import { Settings } from '../store/settings';
import { speak } from '../utils/speak';
import { CANDIES, makeChoices } from './activityS4Utils';
import './ActivityS4Match.css';
import CompletionActions from './CompletionActions';

function makeProblem() {
  const answer = Math.floor(Math.random() * 8) + 1;
  return { answer, choices: makeChoices(answer).map((count, index) => ({ count, icon: CANDIES[(answer + index) % CANDIES.length].icon })) };
}

export default function ActivityS4HowMany() {
  const navigate = useNavigate(); const maxQ = Settings.get().questionsPerRound;
  const [problem, setProblem] = useState(makeProblem); const [round, setRound] = useState(0); const [phase, setPhase] = useState('play'); const [wrong, setWrong] = useState(null);
  const reset = () => { setProblem(makeProblem()); setRound(0); setPhase('play'); setWrong(null); };
  const choose = (count) => { if (phase !== 'play') return; if (count !== problem.answer) { setWrong(count); speak('おしい！ もういちど かぞえてみよう'); setTimeout(() => setWrong(null), 500); return; } setPhase('correct'); speak(`せいかい！ ${count}こだね`); LogStore.addLog({ stage: 'S4', activity: 'number_to_quantity', number: problem.answer, correct: true }); };
  const next = () => { if (round + 1 >= maxQ) setPhase('complete'); else { setRound((value) => value + 1); setProblem(makeProblem()); setPhase('play'); } };
  const plates = useMemo(() => problem.choices, [problem]);
  return <div className="candy-count-page"><header className="candy-count-header"><button className="btn" onClick={() => navigate('/kids/stage/4')}><ArrowLeft size={20} /> <span>もどる</span></button><div className="candy-count-title">🍬 この すうじは いくつ？</div><button className="btn" onClick={reset}><RotateCcw size={19} /></button></header>
    <main className="candy-count-main">{phase === 'complete' ? <><div style={{ fontSize: '95px' }}>🎉</div><div className="candy-count-question">{maxQ}もん できたね！</div></> : <><div className="candy-big-number">{problem.answer}</div><div className="candy-count-question">{problem.answer}こ ある おさらは どれ？</div>{phase === 'correct' && <div className="candy-count-feedback">⭐ せいかい！ ⭐</div>}<div className="candy-plate-grid">{plates.map(({ count, icon }) => <button key={count} className={`candy-plate${wrong === count ? ' is-wrong' : ''}${phase === 'correct' && count === problem.answer ? ' is-correct' : ''}`} onClick={() => choose(count)}>{Array.from({ length: count }, (_, index) => <span key={index}>{icon}</span>)}</button>)}</div></>}</main>
    <footer className="candy-count-footer">{phase === 'correct' && <button className="btn btn-primary" onClick={next}>{round + 1 >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button>}{phase === 'complete' && <CompletionActions activityId="S4_how_many" onRestart={reset} stagePath="/kids" />}</footer></div>;
}
