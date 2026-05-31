import { useState } from 'react'
import { LogStore } from '../store/logStore'
import { Settings } from '../store/settings'
import { speak } from '../utils/speak'
import { Complete, S3Layout } from './ActivityS3Common'
import { makeChoices } from './activityS3Utils'

function makeProblem() {
  const length = 5
  const start = Math.floor(Math.random() * 6) + 1
  const values = Array.from({ length }, (_, index) => start + index)
  const blank = Math.floor(Math.random() * length)
  const answer = values[blank]
  values[blank] = null
  return { values, answer, choices: makeChoices(answer) }
}

export default function ActivityS3FillBlank() {
  const maxQ = Settings.get().questionsPerRound
  const [problem, setProblem] = useState(makeProblem)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState('play')
  const [wrong, setWrong] = useState(null)
  const reset = () => { setProblem(makeProblem()); setRound(0); setPhase('play'); setWrong(null) }
  const choose = (number) => {
    if (phase !== 'play') return
    if (number !== problem.answer) { setWrong(number); speak('おしい！ ならびを みてみよう'); setTimeout(() => setWrong(null), 500); return }
    LogStore.addLog({ stage: 'S3', activity: 'fill_blank_10', answer: number, correct: true })
    speak(`せいかい！ ${number}`)
    setPhase('correct')
  }
  const next = () => {
    if (round + 1 >= maxQ) setPhase('complete')
    else { setRound((value) => value + 1); setProblem(makeProblem()); setPhase('play') }
  }
  return <S3Layout title="10までの あなあき すうれつ" subtitle="うみの つづきから、そらへ すすもう" onReset={reset}
    footer={phase === 'correct' ? <button className="btn btn-primary" onClick={next}>{round + 1 >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button> : null}>
    {phase === 'complete' ? <Complete activityId="S3_fill_blank_10" onRestart={reset} /> : <>
      <div className="s3-question">？ に はいる かずは なに？</div>
      <div className="s3-orbit">{problem.values.map((number, index) => <span className={`s3-planet${number === null ? ' is-blank is-drop-target' : ' is-filled'}`} key={index}>{number ?? (phase === 'correct' ? problem.answer : '?')}</span>)}</div>
      <div className="s3-card-row">{problem.choices.map((number) => <button className={`s3-choice${wrong === number ? ' is-wrong' : ''}${phase === 'correct' && number === problem.answer ? ' is-correct' : ''}`} key={number} onClick={() => choose(number)}>{number}</button>)}</div>
    </>}
  </S3Layout>
}
