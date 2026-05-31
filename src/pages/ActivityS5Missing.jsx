import { useState } from 'react'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'
import { speak } from '../utils/speak'
import { OrchardLayout } from './ActivityS5Common'
import { apples } from './activityS5Utils'
import CompletionActions from './CompletionActions'

const make = () => { const total = Math.floor(Math.random() * 4) + 4; const have = Math.floor(Math.random() * (total - 1)) + 1; return { total, have, answer: total - have } }
export default function ActivityS5Missing() {
  const max = Settings.get().questionsPerRound; const [problem, setProblem] = useState(make); const [round, setRound] = useState(0); const [phase, setPhase] = useState('play'); const [wrong, setWrong] = useState(null)
  const reset = () => { setProblem(make()); setRound(0); setPhase('play') }
  const choose = (number) => { if (number !== problem.answer) { setWrong(number); speak('おしい！ あと いくつ いるかな'); setTimeout(() => setWrong(null), 500); return } setPhase('correct'); LogStore.addLog({ stage: 'S5', activity: 'missing_apples', correct: true }); speak(`せいかい！ あと ${number}こ`) }
  const next = () => round + 1 >= max ? setPhase('complete') : (setRound((value) => value + 1), setProblem(make()), setPhase('play'))
  return <OrchardLayout title="あと いくつ？" onReset={reset} footer={phase === 'correct' ? <button className="btn btn-primary" onClick={next}>つぎへ！</button> : phase === 'complete' ? <CompletionActions activityId="S5_missing_part" onRestart={reset} stagePath="/kids" /> : null}>{phase === 'complete' ? <div className="orchard-feedback">🎉 {max}もん できたね！</div> : <><div className="orchard-question">ぜんぶで {problem.total}こ。あと いくつ いるかな？</div><div className="orchard-row"><div><div className="orchard-basket">{apples(problem.have)}</div><div className="orchard-label">いま {problem.have}こ</div></div><div className="orchard-plus">＋</div><div><div className="orchard-basket is-target">{phase === 'correct' ? apples(problem.answer) : '？'}</div><div className="orchard-label">あと なんこ？</div></div><div className="orchard-total">{problem.total}</div></div>{phase === 'correct' && <div className="orchard-feedback">⭐ あと {problem.answer}こで {problem.total}こ！ ⭐</div>}<div className="orchard-choice-row">{[...new Set([problem.answer, Math.max(1, problem.answer - 1), Math.min(9, problem.answer + 1)])].map((number) => <button key={number} className={`orchard-choice${wrong === number ? ' is-wrong' : ''}${phase === 'correct' && number === problem.answer ? ' is-correct' : ''}`} onClick={() => choose(number)}>{number}</button>)}</div></>}</OrchardLayout>
}
