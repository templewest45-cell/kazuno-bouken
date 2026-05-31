import { useMemo, useState } from 'react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import { Complete, S3Layout } from './ActivityS3Common';
import { JP_NUMS, makeChoices } from './activityS3Utils';

function makeProblem() {
  const start = Math.floor(Math.random() * 5) + 1;
  const sequence = Array.from({ length: 6 }, (_, index) => start + index);
  const blankIndexes = [1, 3, 5];
  return { sequence, blankIndexes };
}

export default function ActivityS3MultiBlank() {
  const [problem, setProblem] = useState(makeProblem);
  const [filled, setFilled] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [complete, setComplete] = useState(false);
  const currentIndex = problem.blankIndexes[filled.length];
  const answer = problem.sequence[currentIndex];
  const choices = useMemo(() => answer === undefined ? [] : makeChoices(answer), [answer]);
  const reset = () => { setProblem(makeProblem()); setFilled([]); setWrong(null); setComplete(false); };
  const choose = (number) => {
    if (complete) return;
    if (number !== answer) { setWrong(number); speak('おしい！ ならびを みてみよう'); setTimeout(() => setWrong(null), 500); return; }
    speak(JP_NUMS[number]); const nextFilled = [...filled, number]; setFilled(nextFilled);
    if (nextFilled.length === problem.blankIndexes.length) {
      LogStore.addLog({ stage: 'S3', activity: 'multi_blank', sequence: problem.sequence, correct: true });
      setTimeout(() => { speak('ぜんぶ うまったね！ せいかい！'); setComplete(true); }, 500);
    }
  };
  const drop = (event) => {
    event.preventDefault();
    choose(Number(event.dataTransfer.getData('text/plain')));
  };
  const drag = (event, number) => event.dataTransfer.setData('text/plain', String(number));

  return <S3Layout title="むしくい すうれつ" subtitle="あいている ほしを ぜんぶ うめよう" onReset={reset}>
    {complete ? <Complete activityId="S3_multi_blank" onRestart={reset} /> : <>
      <div className="s3-question">つぎの ？ に はいる かずは？</div>
      <div className="s3-orbit">{problem.sequence.map((number, index) => {
        const blankPosition = problem.blankIndexes.indexOf(index);
        const value = blankPosition >= 0 ? filled[blankPosition] : number;
        const isCurrentTarget = index === currentIndex;
        return <span key={index} className={`s3-planet${value ? ' is-filled' : ' is-blank'}${isCurrentTarget ? ' is-drop-target' : ''}`} onDragOver={isCurrentTarget ? (event) => event.preventDefault() : undefined} onDrop={isCurrentTarget ? drop : undefined}>{value || '?'}</span>;
      })}</div>
      <div className="s3-drag-guide">{filled.length > 0 ? `⭐ ${filled.length}こ せいかい！ つぎの ？ も うめよう` : 'カードを ひかっている ？ へ はこぼう！ タップでも えらべるよ'}</div>
      <div className="s3-card-row">{choices.map((number) => <button key={number} draggable onDragStart={(event) => drag(event, number)} className={`s3-choice${wrong === number ? ' is-wrong' : ''}`} onClick={() => choose(number)}>{number}</button>)}</div>
    </>}
  </S3Layout>;
}
