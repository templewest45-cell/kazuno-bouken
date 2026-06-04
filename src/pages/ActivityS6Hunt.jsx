import { useMemo, useState } from 'react'
import { CastleFeedback, CastleFooter, CastleLayout } from './ActivityS6Common'
import { randomInt, shuffle } from './activityS6Utils'
import { speak } from '../utils/speak'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'

function makeProblem(maxNumber) {
  const low = randomInt(1, maxNumber - 1)
  const answer = randomInt(low + 1, maxNumber)
  const distractors = shuffle(Array.from({ length: low }, (_, index) => index + 1)).slice(0, 2)
  return { low, choices: shuffle([answer, ...distractors]) }
}

export default function ActivityS6Hunt({ maxNumber = 10, activityId = 'S6_hunt', logActivity = 'condition_hunt' }) {
  const [problem, setProblem] = useState(() => makeProblem(maxNumber))
  const [feedback, setFeedback] = useState('')
  const [selected, setSelected] = useState(null)
  const [count, setCount] = useState(0)
  const [complete, setComplete] = useState(false)
  const cards = useMemo(() => problem.choices, [problem])
  const choose = (number) => {
    if (feedback === 'correct') return
    setSelected(number)
    if (number <= problem.low) { setFeedback('wrong'); speak(`${problem.low} より おおきい かずを さがそう`); return }
    setFeedback('correct')
    LogStore.addLog({ stage: 'S6', activity: logActivity, low: problem.low, answer: number, max: maxNumber, correct: true })
    speak(`せいかい！ ${number} は ${problem.low} より おおきいね`)
  }
  const next = () => {
    const nextCount = count + 1
    if (nextCount >= Settings.get().questionsPerRound) { setComplete(true); return }
    setCount(nextCount); setProblem(makeProblem(maxNumber)); setFeedback(''); setSelected(null)
  }
  return <CastleLayout title="じょうけんに あう かずを さがそう" instruction={`${problem.low} より おおきい かずを ひとつ えらぼう`}>
    <div className="castle-cards">{cards.map((number) => <button className={`castle-card${selected === number && feedback === 'wrong' ? ' is-wrong' : ''}`} key={number} onClick={() => choose(number)}>{number}</button>)}</div>
    <CastleFeedback state={feedback} correctText="じょうけんに あう かずを みつけたね！" />
    {feedback === 'correct' && <CastleFooter activityId={activityId} complete={complete} onNext={next} />}
  </CastleLayout>
}
