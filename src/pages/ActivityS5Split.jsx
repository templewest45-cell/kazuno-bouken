import { useState } from 'react';
import { LogStore } from '../store/logStore';
import { Settings } from '../store/settings';
import { speak } from '../utils/speak';
import BalanceScale from '../components/BalanceScale';
import { OrchardLayout } from './ActivityS5Common';
import CompletionActions from './CompletionActions';

const TARGETS = [2, 3, 4, 2, 3, 4];

export default function ActivityS5Split() {
  const maxQ = Settings.get().questionsPerRound;
  const [round, setRound] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [phase, setPhase] = useState('play');
  const target = TARGETS[round % TARGETS.length];

  const resetCounts = () => { setLeftCount(0); setRightCount(0); setPhase('play'); };
  const reset = () => { setRound(0); resetCounts(); };
  const add = (side) => {
    if (phase !== 'play') return;
    const current = side === 'left' ? leftCount : rightCount;
    if (current >= target) return;
    const nextLeft = leftCount + (side === 'left' ? 1 : 0);
    const nextRight = rightCount + (side === 'right' ? 1 : 0);
    setLeftCount(nextLeft);
    setRightCount(nextRight);
    speak(`${current + 1}こ`);
    if (nextLeft === target && nextRight === target) {
      setPhase('correct');
      setTimeout(() => speak(`できた！ ひだりも ${target}こ、みぎも ${target}こ。おなじ こすうだね！ あわせると ${target * 2}こ！`), 350);
      LogStore.addLog({ stage: 'S5', activity: 'same_count_on_pans', target, left: nextLeft, right: nextRight, total: target * 2, correct: true });
    }
  };
  const remove = (side) => {
    if (phase === 'complete') return;
    if (side === 'left' && leftCount > 0) setLeftCount((value) => value - 1);
    if (side === 'right' && rightCount > 0) setRightCount((value) => value - 1);
    if (phase === 'correct') setPhase('play');
  };
  const drop = (event, side) => { event.preventDefault(); if (event.dataTransfer.getData('text/plain') === side) add(side); };
  const next = () => {
    if (round + 1 >= maxQ) setPhase('complete');
    else { setRound((value) => value + 1); resetCounts(); }
  };
  const apples = (count, side) => Array.from({ length: count }, (_, index) => <button className="orchard-scale-apple apple-remove" key={index} onClick={() => remove(side)} aria-label="りんごをもどす">🍎</button>);
  const dropArea = (side, count) => <div className="orchard-pan-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, side)} onClick={() => add(side)}>{apples(count, side)}{count === 0 && <span>ここに のせる</span>}</div>;
  const box = (side, count) => <div className={`orchard-side-box box-${side}`}><strong>{side === 'left' ? 'ひだり' : 'みぎ'}の はこ あと {target - count}こ</strong><div>{Array.from({ length: target - count }, (_, index) => <span className="orchard-box-apple" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', side)} onClick={() => add(side)} key={index}>🍎</span>)}</div></div>;

  return <OrchardLayout title="おなじ こすうに しよう" onReset={reset} footer={phase === 'correct' ? <button className="btn btn-primary" onClick={next}>{round + 1 >= maxQ ? 'けっかを みる' : 'つぎへ！'}</button> : phase === 'complete' ? <CompletionActions activityId="S5_split" onRestart={reset} stagePath="/kids" /> : null}>
    {phase === 'complete' ? <div className="orchard-feedback">🎉 {maxQ}もん おなじ こすうに できたね！</div> : <>
      <div className="orchard-question">ひだりと みぎに、りんごを {target}こずつ のせよう！</div>
      {phase === 'correct' && <div className="orchard-feedback">⭐ どちらも {target}こ。おなじ こすうだね！ あわせて {target * 2}こ ⭐</div>}
      <div className="orchard-scale-wrap"><BalanceScale leftCount={leftCount} rightCount={rightCount} leftArea={dropArea('left', leftCount)} rightArea={dropArea('right', rightCount)} /></div>
      <div className="orchard-side-boxes">{box('left', leftCount)}{box('right', rightCount)}</div>
      <div className="orchard-scale-guide">それぞれの はこから、うえの おさらに りんごを のせよう！</div>
    </>}
  </OrchardLayout>;
}
