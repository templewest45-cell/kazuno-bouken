import { useMemo, useState } from 'react'
import { CastleFeedback, CastleFooter, CastleLayout } from './ActivityS6Common'
import { randomInt, shuffle } from './activityS6Utils'
import { speak } from '../utils/speak'
import { Settings } from '../store/settings'
import { LogStore } from '../store/logStore'

function makeProblem() {
  const low = randomInt(1, 7)
  const answer = randomInt(low + 1, 10)
  const distractors = shuffle(Array.from({ length: low }, (_, index) => index + 1)).slice(0, 2)
  return { low, choices: shuffle([answer, ...distractors]) }
}

export default function ActivityS6Hunt() {
  const [problem, setProblem] = useState(makeProblem)
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
    LogStore.addLog({ stage: 'S6', activity: 'condition_hunt', low: problem.low, answer: number, correct: true })
    speak(`せいかい！ ${number} は ${problem.low} より おおきいね`)
  }
  const next = () => {
    const nextCount = count + 1
    if (nextCount >= Settings.get().questionsPerRound) { setComplete(true); return }
    setCount(nextCount); setProblem(makeProblem()); setFeedback(''); setSelected(null)
  }
  return <CastleLayout title="じょうけんに あう かずを さがそう" instruction={`${problem.low} より おおきい かずを ひとつ えらぼう`}>
    <div className="castle-cards">{cards.map((number) => <button className={`castle-card${selected === number && feedback === 'wrong' ? ' is-wrong' : ''}`} key={number} onClick={() => choose(number)}>{number}</button>)}</div>
    <CastleFeedback state={feedback} correctText="じょうけんに あう かずを みつけたね！" />
    {feedback === 'correct' && <CastleFooter activityId="S6_hunt" complete={complete} onNext={next} />}
  </CastleLayout>
}
