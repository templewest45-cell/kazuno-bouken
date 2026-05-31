import { useState } from 'react';
import { LogStore } from '../store/logStore';
import { Settings } from '../store/settings';
import { speak } from '../utils/speak';
import { Complete, S3Layout } from './ActivityS3Common';
import { JP_NUMS, makeChoices } from './activityS3Utils';

function makeProblem() {
  const center = Math.floor(Math.random() * 8) + 2;
  const direction = Math.random() < 0.5 ? 'before' : 'after';
  const answer = direction === 'before' ? center - 1 : center + 1;
  return { center, direction, answer, choices: makeChoices(answer) };
}

export default function ActivityS3BeforeAfter() {
  const maxQ = Settings.get().questionsPerRound;
  const [problem, setProblem] = useState(makeProblem);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('play');
  const [wrong, setWrong] = useState(null);
  const reset = () => { setProblem(makeProblem()); setRound(0); setPhase('play'); setWrong(null); };
  const choose = (number) => {
    if (phase !== 'play') return;
    if (number !== problem.answer) { setWrong(number); speak('おしい！ もういちど みてみよう'); setTimeout(() => setWrong(null), 500); return; }
    speak(`せいかい！ ${JP_NUMS[problem.center]} の ${problem.direction === 'before' ? 'まえ' : 'あと'} は ${JP_NUMS[number]}`);
    LogStore.addLog({ stage: 'S3', activity: 'before_after', ...problem, selected: number, correct: true });
    setRound((value) => value + 1); setPhase('done');
  };
  const drop = (event) => {
    event.preventDefault();
    choose(Number(event.dataTransfer.getData('text/plain')));
  };
  const drag = (event, number) => event.dataTransfer.setData('text/plain', String(number));
  const next = () => { if (round >= maxQ) setPhase('complete'); else { setProblem(makeProblem()); setPhase('play'); } };
  const values = problem.direction === 'before'
    ? [null, problem.center, problem.center + 1]
    : [problem.center - 1, problem.center, null];

  return <S3Layout title="まえと あとの かず" subtitle="ほしの ならびを かんがえよう" onReset={reset}
    footer={phase === 'done' ? <button className="btn btn-primary" onClick={next}>{round >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button> : null}>
    {phase === 'complete' ? <Complete activityId="S3_before_after" onRestart={reset} /> : <>
      {phase === 'done' ? <div className="s3-feedback">せいかい！ {problem.answer} だね</div> : <div className="s3-question">{problem.center} の {problem.direction === 'before' ? 'まえ' : 'あと'} は なに？</div>}
      <div className="s3-position-row">{values.map((value, index) => <div className="s3-position-cell" key={index}>
        <span className="s3-position-label">{index === 0 ? 'まえ' : index === 1 ? 'いま' : 'あと'}</span>
        {value === null
          ? <span className={`s3-planet is-blank is-drop-target${phase === 'done' ? ' is-filled' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={drop}>{phase === 'done' ? problem.answer : '?'}</span>
          : <span className="s3-planet">{value}</span>}
      </div>)}</div>
      <div className="s3-drag-guide">カードを ？ の ほしへ はこぼう！ タップでも えらべるよ</div>
      <div className="s3-card-row">{problem.choices.map((number) => <button key={number} draggable={phase === 'play'} onDragStart={(event) => drag(event, number)} className={`s3-choice${wrong === number ? ' is-wrong' : ''}${phase === 'done' && number === problem.answer ? ' is-correct' : ''}`} onClick={() => choose(number)}>{number}</button>)}</div>
    </>}
  </S3Layout>;
}
