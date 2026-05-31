import { useState } from 'react'
import { CastleFeedback, CastleFooter, CastleLayout } from './ActivityS6Common'
import { randomInt, shuffle } from './activityS6Utils'
import { speak } from '../utils/speak'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'

function makeProblem() {
  const start = randomInt(1, 7)
  const sequence = Array.from({ length: 4 }, (_, index) => start + index)
  return { sequence, cards: shuffle(sequence) }
}

export default function ActivityS6Sort() {
  const [problem, setProblem] = useState(makeProblem)
  const [placed, setPlaced] = useState([null, null, null, null])
  const [feedback, setFeedback] = useState('')
  const [count, setCount] = useState(0)
  const [complete, setComplete] = useState(false)

  function place(value, index = placed.findIndex((item) => item === null)) {
    if (feedback === 'correct') return
    if (index < 0) return
    const nextPlaced = placed.map((item) => item === value ? null : item)
    nextPlaced[index] = value
    setPlaced(nextPlaced)
    setFeedback('')
  }

  function check() {
    if (placed.some((value) => value === null) || feedback === 'correct') return
    if (!placed.every((value, index) => value === problem.sequence[index])) {
      setFeedback('wrong')
      speak('おしい。ちいさい かずから えらぼう')
      return
    }
    setFeedback('correct')
    LogStore.addLog({ stage: 6, activity: 'sort', correct: true })
    speak('せいかい！ じゅんばんに ならんだね')
  }

  function reset() {
    setPlaced([null, null, null, null])
    setFeedback('')
    speak('もういちど ならべてみよう')
  }

  function next() {
    const nextCount = count + 1
    if (nextCount >= Settings.get().questionsPerRound) {
      setComplete(true)
      speak('かいだんの しれん、クリア！')
      return
    }
    setCount(nextCount)
    setProblem(makeProblem())
    setPlaced([null, null, null, null])
    setFeedback('')
  }

  return (
    <CastleLayout title="かいだんを つくろう" instruction="ちいさい かずから じゅんばんに おこう">
      <div className="castle-steps">
        {problem.sequence.map((_, index) => (
          <button
            className="castle-step"
            key={index}
            onClick={() => { if (feedback !== 'correct') setPlaced(placed.map((value, placedIndex) => placedIndex === index ? null : value)) }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => { event.preventDefault(); place(Number(event.dataTransfer.getData('text/plain')), index) }}
          >
            {placed[index] ?? '？'}
          </button>
        ))}
      </div>
      <div className="castle-cards">
        {problem.cards.map((value) => (
          <button className="castle-card" disabled={placed.includes(value)} draggable key={value} onClick={() => place(value)} onDragStart={(event) => event.dataTransfer.setData('text/plain', String(value))}>{value}</button>
        ))}
      </div>
      <CastleFeedback state={feedback} correctText="じゅんばんに ならんだね！" />
      {feedback === 'wrong' && <button className="castle-reset" onClick={reset}>↻ もういちど ならべる</button>}
      {feedback !== 'correct' && <button className="castle-ok" disabled={placed.some((value) => value === null)} onClick={check}>ここで いい？ OK</button>}
      {feedback === 'correct' && <CastleFooter activityId="S6_sort" complete={complete} onNext={next} />}
    </CastleLayout>
  )
}
