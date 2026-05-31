import { useState } from 'react'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'
import { speak } from '../utils/speak'
import { OrchardLayout } from './ActivityS5Common'
import { apples } from './activityS5Utils'
import CompletionActions from './CompletionActions'

const make = () => {
  const left = Math.floor(Math.random() * 4) + 1
  const right = Math.floor(Math.random() * 4) + 1
  return { left, right, total: left + right }
}

export default function ActivityS5Join() {
  const max = Settings.get().questionsPerRound
  const [problem, setProblem] = useState(make)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState('play')
  const [wrong, setWrong] = useState(null)
  const reset = () => { setProblem(make()); setRound(0); setPhase('play') }
  const choose = (number) => {
    if (number !== problem.total) { setWrong(number); speak('おしい！ ぜんぶの りんごを かぞえよう'); setTimeout(() => setWrong(null), 500); return }
    setPhase('correct'); LogStore.addLog({ stage: 'S5', activity: 'join_apples', correct: true }); speak(`せいかい！ あわせると ${number}こ`)
  }
  const next = () => round + 1 >= max ? setPhase('complete') : (setRound((value) => value + 1), setProblem(make()), setPhase('play'))
  return <OrchardLayout title="あわせると いくつ？" onReset={reset} footer={phase === 'correct' ? <button className="btn btn-primary" onClick={next}>つぎへ！</button> : phase === 'complete' ? <CompletionActions activityId="S5_join" onRestart={reset} stagePath="/kids" /> : null}>
    {phase === 'complete' ? <div className="orchard-feedback">🎉 {max}もん できたね！</div> : <><div className="orchard-question">ふたつの かごを あわせると いくつ？</div><div className="orchard-row"><div className="orchard-basket">{apples(problem.left)}</div><div className="orchard-plus">＋</div><div className="orchard-basket">{apples(problem.right)}</div></div>{phase === 'correct' && <><div className="orchard-feedback">⭐ せいかい！ あわせて {problem.total}こ ⭐</div><div className="orchard-total-apples">{apples(problem.total)}<strong>{problem.total}こ</strong></div></>}<div className="orchard-choice-row">{[problem.total - 1, problem.total, problem.total + 1].map((number) => <button key={number} className={`orchard-choice${wrong === number ? ' is-wrong' : ''}${phase === 'correct' && number === problem.total ? ' is-correct' : ''}`} onClick={() => choose(number)}>{number}</button>)}</div></>}
  </OrchardLayout>
}
