import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import { Settings } from '../store/settings';
import './ActivityS1Which.css';
import CompletionActions from './CompletionActions';

const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく'];

const ANIMALS = [
  { key: 'bear',  name: 'クマ',    img: '/animals/animal_happy.png' },
  { key: 'cat',   name: 'ネコ',    img: '/animals/cat_happy.png'    },
  { key: 'dog',   name: 'イヌ',    img: '/animals/dog_happy.png'    },
  { key: 'lion',  name: 'ライオン', img: '/animals/lion_happy.png'  },
  { key: 'panda', name: 'パンダ',  img: '/animals/panda_happy.png'  },
];

// 問題生成: 2匹・異なる個数（1〜5）
function makeProblem() {
  const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5);
  const left  = shuffled[0];
  const right = shuffled[1];
  let countL, countR;
  do {
    countL = Math.floor(Math.random() * 5) + 1;
    countR = Math.floor(Math.random() * 5) + 1;
  } while (countL === countR);
  return { left, right, countL, countR };
}

const CHEER = ['すごい！', 'やったね！', 'せいかい！', 'かんぺき！'];
const ENCOURAGE = ['もういちど！', 'おしい！ もうちょっと！', 'がんばれ！'];

function AnimalCard({ animal, count, side, selected, phase, correctSide, onSelect }) {
  const isSelected = selected === side;
  const isCorrect = correctSide === side;
  const showResult = phase !== 'quiz';
  const resultClass = showResult && isCorrect
    ? ' is-correct'
    : showResult && isSelected
      ? ' is-wrong'
      : '';

  return (
    <div
      onClick={() => onSelect(side)}
      className={`which-animal-card${isSelected ? ' is-selected' : ''}${resultClass}`}
    >
      {showResult && isSelected && (
        <div className="which-result-badge animate-pop-in">
          {isCorrect ? '⭐' : '💦'}
        </div>
      )}

      <img
        src={animal.img} alt={animal.name} draggable={false}
        className="which-animal"
        style={{
          transition: 'transform 0.3s',
          transform: isSelected && isCorrect ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
        }}
      />
      <div className="which-animal-name">{animal.name}</div>

      {/* 同じ基準線から縦に積み、余っている分が見えるようにする */}
      <div className="which-stack">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="which-apple" style={{
            transition: `all 0.3s ${i * 0.06}s`,
            transform: showResult && isCorrect ? 'scale(1.15)' : 'scale(1)',
          }}>🍎</span>
        ))}
      </div>

      <div className={`which-number${showResult ? '' : ' is-hidden'}`}>
        {count}こ
      </div>
    </div>
  );
}

export default function ActivityS1Which() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  const [problem, setProblem] = useState(() => makeProblem());
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('quiz');      // quiz → correct | wrong | finished
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (startTimeRef.current === null) startTimeRef.current = Date.now();
    setTimeout(() => speak(`${problem.left.name}と ${problem.right.name}、どっちが おおく たべた？`, true), 300);
  }, [problem]);

  const handleSelect = useCallback((side) => {
    if (phase !== 'quiz') return;
    const { countL, countR, left, right } = problem;
    const correctSide = countL > countR ? 'left' : 'right';
    const isCorrect = side === correctSide;
    const winner = correctSide === 'left' ? left : right;
    const loser = correctSide === 'left' ? right : left;
    const winCount = Math.max(countL, countR);
    const loseCount = Math.min(countL, countR);
    const difference = winCount - loseCount;

    setSelected(side);
    setTotalCount(t => t + 1);

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setPhase('correct');
      const cheer = CHEER[Math.floor(Math.random() * CHEER.length)];
      speak(`${cheer} ${winner.name}さんは ${JP_NUMS[winCount]}こ、${loser.name}さんは ${JP_NUMS[loseCount]}こ。${winner.name}さんの ほうが ${JP_NUMS[difference]}こ おおいね！`, false);
    } else {
      setPhase('wrong');
      speak(`${ENCOURAGE[Math.floor(Math.random() * ENCOURAGE.length)]}`, false);
    }

    LogStore.addLog({
      stage: 'S1', activity: 'which_more',
      countL, countR, selected: side, correct: isCorrect,
      response_time_ms: Date.now() - (startTimeRef.current ?? Date.now()),
    });
  }, [phase, problem]);

  const handleNext = () => {
    if (totalCount >= maxQ) {
      setPhase('finished');
      speak(`おわり！ ${maxQ}もん中 ${correctCount}もん せいかい！ すごい！`);
      return;
    }
    setProblem(makeProblem());
    setSelected(null);
    setPhase('quiz');
    startTimeRef.current = Date.now();
  };

  const handleRestart = () => {
    setProblem(makeProblem());
    setSelected(null);
    setPhase('quiz');
    setCorrectCount(0);
    setTotalCount(0);
    startTimeRef.current = Date.now();
  };

  const { left, right, countL, countR } = problem;
  const correctSide = countL > countR ? 'left' : 'right';
  const isFinished = phase === 'finished';

  return (
    <div className="which-page">
      <div className="which-scenery" aria-hidden="true">
        <div className="which-cloud">☁️</div>
        <div className="which-stars">★ ★ ★</div>
        <div className="which-tree which-tree-left">🌳</div>
        <div className="which-tree which-tree-right">🌳</div>
        <div className="which-candy">🍭</div>
      </div>

      {/* ヘッダー */}
      <div className="which-header which-content">
        <button className="btn" onClick={() => navigate('/kids/stage/1')}>
          <ArrowLeft size={20} /> <span>もどる</span>
        </button>
        <div className="which-title">
          <strong>くらべっこの おか</strong>
          <span>1たい1 たいおう</span>
        </div>
        <button className="btn" onClick={handleRestart} aria-label="さいしょから">
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="which-content">
        {/* スコア */}
        <div className="which-score">
          {totalCount > 0 ? `${totalCount} / ${maxQ}もん せいかい ${correctCount}もん` : 'りんごを くらべよう'}
        </div>

        {/* 問いかけ */}
        <div
          className="which-question"
          onClick={() => speak(`${left.name}と ${right.name}、どっちが おおく たべた？`, false)}
        >
          {phase === 'quiz'     && 'おおく たべたのは どっち？'}
          {phase === 'correct'  && `⭐ ${correctSide === 'left' ? left.name : right.name}が ${Math.abs(countL - countR)}こ おおい！`}
          {phase === 'wrong'    && '💦 おしい！ もういちど みてみよう'}
          {phase === 'finished' && '🎉 ぜんぶ おわったよ！'}
        </div>

        {/* 動物カード 横並び（終了画面では非表示） */}
        {!isFinished && (
          <div className="which-cards">
            <AnimalCard animal={left} count={countL} side="left" selected={selected} phase={phase} correctSide={correctSide} onSelect={handleSelect} />
            <AnimalCard animal={right} count={countR} side="right" selected={selected} phase={phase} correctSide={correctSide} onSelect={handleSelect} />
          </div>
        )}

        {/* 終了画面 */}
        {isFinished && (
          <div className="which-finish animate-pop-in">
            <div style={{ fontSize: '80px' }}>🏆</div>
            <div style={{ fontSize: '30px', fontWeight: 'bold' }}>
              {maxQ}もん おわったよ！
            </div>
            <div style={{ fontSize: '23px' }}>
              せいかい {correctCount} / {maxQ} もん
            </div>
            <div style={{ fontSize: '34px', fontWeight: 'bold' }}>
              {correctCount === maxQ ? 'パーフェクト！' : correctCount >= maxQ / 2 ? '⭐ よくできました！' : 'また やってみよう！'}
            </div>
          </div>
        )}
      </div>

      {/* ボトムバー */}
      <div className="which-bottom">
        {!isFinished && phase === 'correct' && (
          <button
            className="btn btn-primary animate-pop-in"
            style={{ fontSize: '20px', padding: '16px 48px' }}
            onClick={handleNext}
          >
            {totalCount >= maxQ ? 'けっかを みる' : 'つぎの もんだい！'}
          </button>
        )}
        {!isFinished && phase === 'wrong' && (
          <button
            className="btn animate-pop-in"
            style={{ fontSize: '18px', padding: '16px 32px', background: '#EF5350', color: 'white' }}
            onClick={() => { setSelected(null); setPhase('quiz'); startTimeRef.current = Date.now(); }}
          >
            もう いちど！
          </button>
        )}
        {isFinished && (
          <CompletionActions activityId="S1_which_more" onRestart={handleRestart} stagePath="/kids" />
        )}
      </div>
    </div>
  );
}
