import { useState } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LogStore } from '../store/logStore'
import { Settings } from '../store/settings'
import { speak } from '../utils/speak'
import { randomInt, shuffle } from './activityS6Utils'
import CompletionActions from './CompletionActions'
import './ActivityS4Match.css'

function makeProblem() {
  const start = randomInt(1, 7)
  const sequence = Array.from({ length: 4 }, (_, index) => start + index)
  return { sequence, cards: shuffle(sequence) }
}

export default function ActivityS4Sort() {
  const navigate = useNavigate()
  const maxQ = Settings.get().questionsPerRound
  const [problem, setProblem] = useState(makeProblem)
  const [placed, setPlaced] = useState([])
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState('play')
  const [wrong, setWrong] = useState(null)
  const reset = () => { setProblem(makeProblem()); setPlaced([]); setRound(0); setPhase('play'); setWrong(null) }
  const choose = (number) => {
    if (phase !== 'play' || placed.includes(number)) return
    const expected = problem.sequence[placed.length]
    if (number !== expected) { setWrong(number); speak('おしい！ ちいさい かずから えらぼう'); setTimeout(() => setWrong(null), 500); return }
    const next = [...placed, number]
    setPlaced(next)
    speak(String(number))
    if (next.length === problem.sequence.length) {
      LogStore.addLog({ stage: 'S4', activity: 'sort_number_cards', correct: true })
      setPhase('correct')
      speak('せいかい！ じゅんばんに ならんだね')
    }
  }
  const next = () => {
    if (round + 1 >= maxQ) setPhase('complete')
    else { setRound((value) => value + 1); setProblem(makeProblem()); setPlaced([]); setPhase('play') }
  }
  return <div className="candy-count-page"><header className="candy-count-header"><button className="btn" onClick={() => navigate('/kids/stage/4')}><ArrowLeft size={20} /> <span>もどる</span></button><div className="candy-count-title">🃏 すうじカードを ならべよう</div><button className="btn" onClick={reset}><RotateCcw size={19} /></button></header>
    <main className="candy-count-main">{phase === 'complete' ? <><div style={{ fontSize: '95px' }}>🎉</div><div className="candy-count-question">{maxQ}もん ならべたね！</div></> : <>
      <div className="candy-count-question">ちいさい じゅんばんに タップしよう！</div>
      <div className="candy-sort-slots">{problem.sequence.map((_, index) => <span className={placed[index] ? 'is-filled' : ''} key={index}>{placed[index] ?? '?'}</span>)}</div>
      <div className="candy-number-tray">{problem.cards.map((number) => <button className={`candy-number-card${placed.includes(number) ? ' is-active' : ''}${wrong === number ? ' is-wrong' : ''}`} disabled={placed.includes(number)} key={number} onClick={() => choose(number)}>{number}</button>)}</div>
    </>}</main><footer className="candy-count-footer">{phase === 'correct' && <button className="btn btn-primary" onClick={next}>{round + 1 >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button>}{phase === 'complete' && <CompletionActions activityId="S4_sort" onRestart={reset} stagePath="/kids" />}</footer></div>
}
