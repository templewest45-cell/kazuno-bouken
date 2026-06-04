import { useState } from 'react'
import { CastleFeedback, CastleFooter, CastleLayout } from './ActivityS6Common'
import { randomInt } from './activityS6Utils'
import { speak } from '../utils/speak'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'

function makeProblem(maxNumber) {
  const left = randomInt(1, maxNumber)
  let right = randomInt(1, maxNumber)
  while (right === left) right = randomInt(1, maxNumber)
  return { left, right }
}

export default function ActivityS6Compare({ maxNumber = 10, activityId = 'S6_compare', logActivity = 'compare' }) {
  const [problem, setProblem] = useState(() => makeProblem(maxNumber))
  const [feedback, setFeedback] = useState('')
  const [count, setCount] = useState(0)
  const [complete, setComplete] = useState(false)
  const answer = problem.left > problem.right ? 'left' : 'right'

  function choose(side) {
    if (feedback === 'correct') return
    if (side !== answer) {
      setFeedback('wrong')
      speak('おしい。どちらが おおきいかな')
      return
    }
    setFeedback('correct')
    LogStore.addLog({ stage: 6, activity: logActivity, max: maxNumber, correct: true })
    speak(`${Math.max(problem.left, problem.right)}の ほうが おおきいね`)
  }

  function next() {
    const nextCount = count + 1
    if (nextCount >= Settings.get().questionsPerRound) {
      setComplete(true)
      speak('おしろの しれん、クリア！')
      return
    }
    setCount(nextCount)
    setProblem(makeProblem(maxNumber))
    setFeedback('')
  }

  return (
    <CastleLayout title="おおきい かずは どっち？" instruction="おおきい かずの とびらを ひらこう">
      <div className="castle-gates">
        {['left', 'right'].map((side) => {
          const value = problem[side]
          return (
            <button className={`castle-gate ${feedback === 'correct' && side === answer ? 'selected open' : ''}`} key={side} onClick={() => choose(side)}>
              <strong>{value}</strong>
              <span className="castle-gems">{'💎'.repeat(value)}</span>
            </button>
          )
        })}
      </div>
      <CastleFeedback state={feedback} correctText={`${Math.max(problem.left, problem.right)}の ほうが おおきいね！`} />
      {feedback === 'correct' && <CastleFooter activityId={activityId} complete={complete} onNext={next} />}
    </CastleLayout>
  )
}
