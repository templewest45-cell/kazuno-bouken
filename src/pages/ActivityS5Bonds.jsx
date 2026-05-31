import { useState } from 'react'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'
import { speak } from '../utils/speak'
import { OrchardLayout } from './ActivityS5Common'
import CompletionActions from './CompletionActions'

const make = () => { const target = Math.floor(Math.random() * 4) + 5; const answer = [2, target - 2]; return { target, choices: [answer, [1, target - 2], [3, target - 2]].sort(() => Math.random() - .5) } }
export default function ActivityS5Bonds() {
  const max = Settings.get().questionsPerRound; const [problem, setProblem] = useState(make); const [round, setRound] = useState(0); const [phase, setPhase] = useState('play'); const [wrong, setWrong] = useState(null)
  const reset = () => { setProblem(make()); setRound(0); setPhase('play') }
  const choose = (pair, index) => { if (pair[0] + pair[1] !== problem.target) { setWrong(index); speak('おしい！ ふたつを あわせて かぞえよう'); setTimeout(() => setWrong(null), 500); return } setPhase('correct'); LogStore.addLog({ stage: 'S5', activity: 'number_bonds', correct: true }); speak(`せいかい！ ${pair[0]}こと ${pair[1]}こで ${problem.target}こ`) }
  const next = () => round + 1 >= max ? setPhase('complete') : (setRound((value) => value + 1), setProblem(make()), setPhase('play'))
  return <OrchardLayout title="おなじ かずを つくろう" onReset={reset} footer={phase === 'correct' ? <button className="btn btn-primary" onClick={next}>つぎへ！</button> : phase === 'complete' ? <CompletionActions activityId="S5_number_bonds" onRestart={reset} stagePath="/kids" /> : null}>{phase === 'complete' ? <div className="orchard-feedback">🎉 {max}もん できたね！</div> : <><div className="orchard-question">あわせて {problem.target}こに なるのは どれ？</div>{phase === 'correct' && <div className="orchard-feedback">⭐ おなじ かずに なったね！ ⭐</div>}<div className="orchard-bond-grid">{problem.choices.map((pair, index) => <button key={`${pair[0]}-${pair[1]}-${index}`} className={`orchard-bond${wrong === index ? ' is-wrong' : ''}${phase === 'correct' && pair[0] + pair[1] === problem.target ? ' is-correct' : ''}`} onClick={() => choose(pair, index)}><div>{pair[0]}こ 🍎</div><div>＋</div><div>{pair[1]}こ 🍎</div></button>)}</div></>}</OrchardLayout>
}
