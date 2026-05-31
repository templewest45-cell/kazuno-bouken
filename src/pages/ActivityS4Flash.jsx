import { useRef, useState } from 'react';
import { ArrowLeft, Mic, MicOff, RotateCcw, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogStore } from '../store/logStore';
import { Settings } from '../store/settings';
import { speak } from '../utils/speak';
import { JP_NUMS } from './activityS4Utils';
import CompletionActions from './CompletionActions';
import './ActivityS4Match.css';

const randomNumber = (previous = 0) => {
  const choices = Array.from({ length: 10 }, (_, index) => index + 1).filter((value) => value !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
};
const READINGS = [
  [],
  ['1', '一', 'いち'],
  ['2', '二', 'に'],
  ['3', '三', 'さん'],
  ['4', '四', 'よん', 'し'],
  ['5', '五', 'ご'],
  ['6', '六', 'ろく'],
  ['7', '七', 'なな', 'しち'],
  ['8', '八', 'はち'],
  ['9', '九', 'きゅう', 'く'],
  ['10', '十', 'じゅう'],
];

export default function ActivityS4Flash() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  const recognitionRef = useRef(null);
  const [micSupported] = useState(() => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [number, setNumber] = useState(() => randomNumber());
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('read');
  const [collected, setCollected] = useState([]);
  const [heard, setHeard] = useState('');

  const stopListening = () => { recognitionRef.current?.stop(); recognitionRef.current = null; };
  const collect = () => {
    stopListening();
    LogStore.addLog({ stage: 'S4', activity: 'flash_card_read', number, correct: true });
    setCollected((values) => [...values, number]);
    setPhase('correct');
    speak(`よめたね！ ${JP_NUMS[number]}`);
  };
  const listen = () => {
    speak(JP_NUMS[number]);
    setPhase('check');
  };
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    stopListening();
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results[0]).map((result) => result.transcript).join(' ');
      setHeard(transcript);
      if (READINGS[number].some((reading) => transcript.includes(reading))) collect();
      else { setPhase('read'); speak('もういちど よんでみよう'); }
    };
    recognition.onerror = () => { setPhase('read'); speak('マイクで ききとれなかったよ。もういちど よんでみよう'); };
    recognition.onend = () => { recognitionRef.current = null; };
    recognitionRef.current = recognition;
    setHeard('');
    setPhase('listening');
    recognition.start();
  };
  const retry = () => {
    stopListening();
    speak(`${JP_NUMS[number]}。もういちど よんでみよう`);
    setPhase('read');
  };
  const next = () => {
    if (round + 1 >= maxQ) {
      setPhase('complete');
      return;
    }
    setRound((value) => value + 1);
    setNumber((value) => randomNumber(value));
    setPhase('read');
  };
  const reset = () => {
    setNumber(randomNumber());
    setRound(0);
    setPhase('read');
    setCollected([]);
    setHeard('');
  };

  return <div className="candy-count-page">
    <header className="candy-count-header"><button className="btn" onClick={() => navigate('/kids/stage/4')}><ArrowLeft size={20} /> <span>もどる</span></button><div className="candy-count-title">🃏 すうじカードを よんで あつめよう</div><button className="btn" onClick={reset}><RotateCcw size={19} /></button></header>
    <main className="candy-count-main">
      {phase === 'complete' ? <><div style={{ fontSize: '95px' }}>🎉</div><div className="candy-count-question">{maxQ}まい よめたね！</div><div className="candy-flash-collection">{collected.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div></> : <>
        <div className="candy-flash-progress">{round + 1} / {maxQ}まいめ</div>
        <div className="candy-count-question">{phase === 'read' ? 'カードを こえに だして よもう！' : phase === 'listening' ? 'マイクに むかって よんでね！' : phase === 'check' ? 'おなじ よみかた だったかな？' : 'カードを ゲット！'}</div>
        <div className={`candy-flash-card${phase === 'correct' ? ' is-correct' : ''}`}><span>{number}</span></div>
        {phase === 'read' && <div className="candy-flash-actions">{micSupported && <button className="btn btn-primary" onClick={startListening}><Mic size={25} /> マイクで よむ</button>}<button className="btn btn-secondary candy-listen-button" onClick={listen}><Volume2 size={25} /> よんだら こたえを きく</button></div>}
        {phase === 'listening' && <button className="btn" onClick={retry}><MicOff size={22} /> やめる</button>}
        {phase === 'check' && <div className="candy-flash-actions"><button className="btn btn-primary" onClick={collect}>⭐ よめた！</button><button className="btn" onClick={retry}>↻ もういちど</button></div>}
        {heard && <div className="candy-flash-heard">マイク: {heard}</div>}
        {phase === 'correct' && <button className="btn btn-primary" onClick={next}>{round + 1 >= maxQ ? 'けっかを みる' : 'つぎの カード！'}</button>}
        <div className="candy-flash-collection">{collected.map((value, index) => <span key={`${value}-${index}`}>{value}</span>)}</div>
      </>}
    </main>
    <footer className="candy-count-footer">{phase === 'complete' && <CompletionActions activityId="S4_flash" onRestart={reset} stagePath="/kids" />}</footer>
  </div>;
}
