import { useState } from 'react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import { Complete, S3Layout } from './ActivityS3Common';
import { JP_NUMS } from './activityS3Utils';

export default function ActivityS3Reverse({ startNumber = 10, activityId = 'S3_reverse', logActivity = 'reverse' }) {
  const [next, setNext] = useState(startNumber);
  const [wrong, setWrong] = useState(null);
  const [complete, setComplete] = useState(false);
  const [launching, setLaunching] = useState(false);
  const reset = () => { setNext(startNumber); setWrong(null); setComplete(false); setLaunching(false); };
  const choose = (number) => {
    if (number !== next) {
      setWrong(number); speak('おしい！ おおきい かずから みてみよう'); setTimeout(() => setWrong(null), 500); return;
    }
    speak(JP_NUMS[number]);
    if (number === 1) {
      LogStore.addLog({ stage: 'S3', activity: logActivity, start: startNumber, reached: 1, correct: true });
      setLaunching(true);
      speak('ゼロ！ はっしゃ！');
      setTimeout(() => { speak('だいせいかい！ ロケットが とんだね！'); setComplete(true); }, 1700);
    } else setNext(number - 1);
  };

  return <S3Layout title="ぎゃくから かぞえよう" subtitle={`${startNumber}から いちまで ロケットを とばそう`} onReset={reset}>
    {complete ? <Complete activityId={activityId} onRestart={reset} /> : <>
      <div className="s3-question">{launching ? 'ゼロ！ はっしゃ！' : next === startNumber ? 'いちばん おおきい かずから タップ！' : `${next} を タップしよう！`}</div>
      <div className="s3-launchpad"><span className={`s3-launch-rocket${launching ? ' is-flying' : ' is-ready'}`}>🚀</span>{launching && <span className="s3-launch-fire">🔥</span>}</div>
      <div className="s3-orbit">{Array.from({ length: startNumber }, (_, index) => startNumber - index).map((number) =>
        <button key={number} className={`s3-planet${number > next || launching ? ' is-filled' : ''}${wrong === number ? ' is-wrong' : ''}`} onClick={() => !launching && choose(number)}>{number > next || launching ? '★' : number}</button>)}</div>
    </>}
  </S3Layout>;
}
