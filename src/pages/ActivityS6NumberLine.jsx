import { useState } from 'react'
import { CastleFeedback, CastleFooter, CastleLayout } from './ActivityS6Common'
import { randomInt } from './activityS6Utils'
import { speak } from '../utils/speak'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'

export default function ActivityS6NumberLine({ maxNumber = 10, activityId = 'S6_numberline', logActivity = 'numberline' }) {
  const [target, setTarget] = useState(() => randomInt(1, maxNumber))
  const [feedback, setFeedback] = useState('')
  const [placedSlot, setPlacedSlot] = useState(null)
  const [count, setCount] = useState(0)
  const [complete, setComplete] = useState(false)

  function place(value) {
    if (feedback === 'correct') return
    setPlacedSlot(value)
    setFeedback('')
  }

  function check() {
    if (placedSlot === null || feedback === 'correct') return
    if (placedSlot !== target) {
      setFeedback('wrong')
      speak('おしい。ばしょを もういちど みてみよう')
      return
    }
    setFeedback('correct')
    LogStore.addLog({ stage: 6, activity: logActivity, target, max: maxNumber, correct: true })
    speak(`${target}の ばしょ、せいかい！`)
  }

  function reset() {
    setPlacedSlot(null)
    setFeedback('')
    speak('もういちど おいてみよう')
  }

  function next() {
    const nextCount = count + 1
    if (nextCount >= Settings.get().questionsPerRound) {
      setComplete(true)
      speak('かずの みち、クリア！')
      return
    }
    setCount(nextCount)
    setTarget(randomInt(1, maxNumber))
    setFeedback('')
    setPlacedSlot(null)
  }

  return (
    <CastleLayout title="かずの みちに おこう" instruction={`${target} の カードは どこかな？`}>
      <div className="castle-line-wrap">
        <div className={`castle-drag-card castle-line-card ${placedSlot !== null ? 'placed' : ''}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(target))}>{placedSlot === null ? target : '\u00a0'}</div>
        <div className="castle-numberline" style={{ gridTemplateColumns: `repeat(${maxNumber}, 64px)` }}>
          {Array.from({ length: maxNumber }, (_, index) => index + 1).map((value) => (
            <button
              className={`castle-slot ${feedback === 'correct' && value === target ? 'correct' : ''} ${feedback === 'wrong' && placedSlot === value ? 'wrong' : ''}`}
              key={value}
              onClick={() => place(value)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); place(value) }}
            >
              {feedback === 'correct' ? value : placedSlot === value ? target : ''}
            </button>
          ))}
        </div>
        <div className="castle-line-labels" style={{ gridTemplateColumns: `repeat(${maxNumber}, 64px)` }}>
          {Array.from({ length: maxNumber }, (_, index) => <span key={index}>{index + 1}</span>)}
        </div>
      </div>
      <CastleFeedback state={feedback} correctText={`${target}の ばしょに おけたね！`} />
      {feedback === 'wrong' && <button className="castle-reset" onClick={reset}>↻ もういちど おく</button>}
      {feedback !== 'correct' && <button className="castle-ok" disabled={placedSlot === null} onClick={check}>ここで いい？ OK</button>}
      {feedback === 'correct' && <CastleFooter activityId={activityId} complete={complete} onNext={next} />}
    </CastleLayout>
  )
}
