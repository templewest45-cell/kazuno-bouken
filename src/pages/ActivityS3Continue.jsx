import { useState } from 'react';
import { LogStore } from '../store/logStore';
import { Settings } from '../store/settings';
import { speak } from '../utils/speak';
import { Complete, S3Layout } from './ActivityS3Common';
import { JP_NUMS, makeChoices } from './activityS3Utils';

function makeProblem(maxNumber) {
  const start = Math.floor(Math.random() * (maxNumber - 1)) + 1;
  return { start, answer: start + 1, choices: makeChoices(start + 1, 1, maxNumber) };
}

export default function ActivityS3Continue({ maxNumber = 10, activityId = 'S3_continue', logActivity = 'continue' }) {
  const maxQ = Settings.get().questionsPerRound;
  const [problem, setProblem] = useState(() => makeProblem(maxNumber));
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState('play');
  const [wrong, setWrong] = useState(null);

  const reset = () => { setProblem(makeProblem(maxNumber)); setRound(0); setPhase('play'); setWrong(null); };
  const choose = (number) => {
    if (number !== problem.answer) {
      setWrong(number); speak('おしい！ つぎの かずは どれかな？'); setTimeout(() => setWrong(null), 500); return;
    }
    speak(`せいかい！ ${JP_NUMS[problem.start]} の つぎは ${JP_NUMS[number]}`);
    LogStore.addLog({ stage: 'S3', activity: logActivity, start: problem.start, answer: number, max: maxNumber, correct: true });
    setRound((value) => value + 1); setPhase('done');
  };
  const next = () => { if (round >= maxQ) setPhase('complete'); else { setProblem(makeProblem(maxNumber)); setPhase('play'); } };

  return <S3Layout title="つぎの かずは なに？" subtitle="ロケットを つぎの ほしへ すすめよう" onReset={reset}
    footer={phase === 'done' ? <button className="btn btn-primary" onClick={next}>{round >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button> : null}>
    {phase === 'complete' ? <Complete activityId={activityId} onRestart={reset} /> : <>
      {phase === 'done'
        ? <div className="s3-feedback">せいかい！ {problem.start} の つぎは {problem.answer}</div>
        : <div className="s3-question">{problem.start} の つぎは なに？</div>}
      <div className={`s3-rocket${phase === 'done' ? ' s3-rocket-hop' : ''}`}>🚀</div>
      <div className="s3-card-row">{problem.choices.map((number) => <button key={number} className={`s3-choice${wrong === number ? ' is-wrong' : ''}${phase === 'done' && number === problem.answer ? ' is-correct' : ''}`} onClick={() => choose(number)}>{number}</button>)}</div>
    </>}
  </S3Layout>;
}
