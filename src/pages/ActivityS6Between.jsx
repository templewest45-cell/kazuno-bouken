import { useState } from 'react'
import { CastleFeedback, CastleFooter, CastleLayout } from './ActivityS6Common'
import { makeChoices, randomInt } from './activityS6Utils'
import { speak } from '../utils/speak'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'

function makeProblem(maxNumber) {
  const low = randomInt(1, maxNumber - 2)
  const high = low + 2
  const answer = low + 1
  return { low, high, answer, choices: makeChoices(answer, 1, maxNumber) }
}

export default function ActivityS6Between({ maxNumber = 10, activityId = 'S6_between', logActivity = 'between' }) {
  const [problem, setProblem] = useState(() => makeProblem(maxNumber))
  const [feedback, setFeedback] = useState('')
  const [count, setCount] = useState(0)
  const [complete, setComplete] = useState(false)

  function choose(value) {
    if (feedback === 'correct') return
    if (value !== problem.answer) {
      setFeedback('wrong')
      speak('おしい。ふたつの かずの あいだは どれかな')
      return
    }
    setFeedback('correct')
    LogStore.addLog({ stage: 6, activity: logActivity, max: maxNumber, correct: true })
    speak(`せいかい！ あいだの かずは ${problem.answer}`)
  }

  function next() {
    const nextCount = count + 1
    if (nextCount >= Settings.get().questionsPerRound) {
      setComplete(true)
      speak('さいごの しれん、クリア！')
      return
    }
    setCount(nextCount)
    setProblem(makeProblem(maxNumber))
    setFeedback('')
  }

  return (
    <CastleLayout title="あいだの かずは？" instruction="？ に はいる かずを えらぼう">
      <div className="castle-between">
        <div className="castle-between-condition"><strong>{problem.low}</strong><span>より おおきい</span></div>
        <strong className="castle-between-question">？</strong>
        <div className="castle-between-condition"><strong>{problem.high}</strong><span>より ちいさい</span></div>
      </div>
      <div className="castle-choices">
        {problem.choices.map((value) => <button className="castle-choice" key={value} onClick={() => choose(value)}>{value}</button>)}
      </div>
      <CastleFeedback state={feedback} correctText={`あいだの かずは ${problem.answer}！`} />
      {feedback === 'correct' && <CastleFooter activityId={activityId} complete={complete} onNext={next} />}
    </CastleLayout>
  )
}
