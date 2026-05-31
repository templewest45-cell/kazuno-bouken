import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import { Settings } from '../store/settings';
import CompletionActions from './CompletionActions';

const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'];

// 問題生成ユーティリティ
function generateProblem() {
  const length = Math.floor(Math.random() * 3) + 3; // 3 to 5
  const maxStart = 5 - length + 1;
  const startNum = Math.floor(Math.random() * maxStart) + 1;
  
  const seq = Array.from({ length }, (_, i) => startNum + i);
  const blankIdx = Math.floor(Math.random() * length);
  const targetNum = seq[blankIdx];
  
  seq[blankIdx] = null; // 空欄にする

  // 選択肢の生成（正解 + 2つの不正解）
  const choices = new Set([targetNum]);
  while (choices.size < 3) {
    // ステージ2は1から5の数に絞る
    const r = Math.floor(Math.random() * 5) + 1;
    choices.add(r);
  }

  return {
    seq,
    targetNum,
    blankIdx,
    choices: Array.from(choices).sort((a, b) => a - b) // 昇順で並べる
  };
}

export default function ActivityS2FillBlank() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  
  const [roundCount, setRoundCount] = useState(0);
  const [problem, setProblem] = useState(generateProblem);
  const [phase, setPhase] = useState('choose'); // 'choose', 'reading', 'done'
  const [wrongChoice, setWrongChoice] = useState(null);
  const [hasMistake, setHasMistake] = useState(false); // 間違えたかどうかを追跡
  
  const initProblem = useCallback(() => {
    setProblem(generateProblem());
    setPhase('choose');
    setWrongChoice(null);
    setHasMistake(false); // リセット
    setTimeout(() => speak('ここにはいる すうじは どれかな？'), 300);
  }, []);

  const handleChoice = (choice) => {
    if (phase !== 'choose') return;

    if (choice === problem.targetNum) {
      // 正解
      setPhase('reading');
      speak('せいかい！');
      LogStore.addLog({ stage: 'S2', activity: 'fill_blank_train', correct: true });
      
      const fullSeq = [...problem.seq];
      fullSeq[problem.blankIdx] = problem.targetNum;

      // 順番に読み上げる
      setTimeout(() => {
        let delay = 0;
        fullSeq.forEach((num) => {
          setTimeout(() => {
            speak(JP_NUMS[num]);
          }, delay);
          delay += 1000; // 1秒ごとに次の数字
        });
        
        setTimeout(() => {
          setPhase('done');
          setRoundCount(r => r + 1);
        }, delay + 500);

      }, 1000);

    } else {
      // 不正解
      setWrongChoice(choice);
      setHasMistake(true); // 間違えたフラグを立てる（ヒントを表示するため）
      speak('ちがうみたい。もういちど かんがえてみて');
      setTimeout(() => setWrongChoice(null), 600); // アニメーション時間後にリセット
    }
  };

  const nextProblem = () => {
    initProblem();
  };

  const resetAll = () => {
    setRoundCount(0);
    initProblem();
  };

  if (!problem) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      
      {/* ヘッダー */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #EEE' }}>
        <button className="btn" onClick={() => navigate('/kids/stage/2')} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <ArrowLeft size={20} /> もどる
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#444' }}>
          あなあき すうれつ
        </div>
        <button className="btn" onClick={resetAll} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* お手本の船団（1〜5の並び） */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', backgroundColor: '#E0F7FA', borderBottom: '2px solid #80DEEA' }}>
        <div style={{ fontSize: '30px', marginRight: '8px' }}>⛵</div>
        {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
          <div key={num} style={{
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'white', border: '2px solid #4FC3F7', borderRadius: '8px',
            margin: '0 2px', fontSize: '20px', fontWeight: 'bold', color: '#0277BD'
          }}>
            {num}
          </div>
        ))}
      </div>

      {/* 問いかけ */}
      <div style={{ textAlign: 'center', padding: '24px 16px 8px', fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
        {phase === 'choose' ? 'ここにはいる すうじは どれかな？' : '⭐ せいかい！ ⭐'}
      </div>

      {/* メインコンテンツ（船団） */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '60px', padding: '16px' }}>
        
        {/* 大きくなった船団コンテナ */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center',
          backgroundColor: '#E3F2FD', padding: '40px 48px', borderRadius: '48px',
          boxShadow: '0 8px 32px rgba(13, 71, 161, 0.1)', border: '6px solid #90CAF9'
        }}>
          {/* 先頭の船 */}
          <div className="animate-pop-in" style={{ fontSize: '120px', marginRight: '20px', lineHeight: 1 }}>⛵</div>

          {/* 数字を載せた船 */}
          {problem.seq.map((num, i) => {
            const isBlank = i === problem.blankIdx;
            const filled = isBlank && phase !== 'choose';
            const displayNum = filled ? problem.targetNum : num;

            // 失敗時のヒント表示（正解を薄く表示する）
            const showHint = isBlank && !filled && hasMistake;

            return (
              <div key={i} className="animate-drop-in" style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '120px', height: '120px', // ★ サイズを1.5倍に拡大
                backgroundColor: isBlank ? (filled ? '#66BB6A' : 'white') : '#42A5F5',
                border: isBlank ? (filled ? '6px solid #4CAF50' : '6px dashed #90CAF9') : '6px solid #1E88E5',
                borderRadius: '24px',
                color: isBlank && !filled ? (showHint ? '#90CAF9' : '#CCC') : 'white',
                fontSize: '72px', fontWeight: 'bold', // ★ フォントサイズを拡大
                boxShadow: isBlank && !filled ? 'inset 0 6px 12px rgba(0,0,0,0.05)' : '0 6px 16px rgba(0,0,0,0.1)',
                animationDelay: `${i * 0.1}s`,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                {/* 番号の表示（ヒント表示も兼ねる） */}
                {displayNum || (showHint ? problem.targetNum : '?')}
                
                {/* 海の上に並ぶ船として見せる */}
                <div style={{ position: 'absolute', bottom: '-31px', left: '50%', transform: 'translateX(-50%)', fontSize: '43px', lineHeight: 1 }}>🌊</div>
              </div>
            );
          })}
        </div>

        {/* 選択肢（ホーム） */}
        {phase === 'choose' && (
          <div className="animate-pop-in" style={{ display: 'flex', gap: '32px', marginTop: '16px' }}>
            {problem.choices.map((choice) => {
              const isWrong = wrongChoice === choice;
              return (
                <button
                  key={choice}
                  onClick={() => handleChoice(choice)}
                  className={isWrong ? 'animate-shake' : ''}
                  style={{
                    width: '140px', height: '140px', // ★ サイズを拡大
                    backgroundColor: isWrong ? '#FFEBEE' : 'white',
                    border: `6px solid ${isWrong ? '#EF5350' : '#FFCA28'}`,
                    borderRadius: '32px',
                    fontSize: '72px', fontWeight: 'bold', color: isWrong ? '#D32F2F' : '#F57C00', // ★ フォントサイズを拡大
                    boxShadow: '0 12px 24px rgba(255, 160, 0, 0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: isWrong ? 'scale(0.95)' : 'scale(1)',
                  }}
                  onMouseOver={e => { if(!isWrong) e.currentTarget.style.transform = 'translateY(-6px)'; }}
                  onMouseOut={e => { if(!isWrong) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        )}

        {/* 次へボタン / クリア */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {phase === 'done' && roundCount < maxQ && (
            <button
              className="btn btn-primary animate-pop-in"
              onClick={nextProblem}
              style={{ padding: '20px 64px', fontSize: '32px' }}
            >
              つぎへ！ ({roundCount + 1}/{maxQ})
            </button>
          )}

          {phase === 'done' && roundCount >= maxQ - 1 && (
            <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <img src="/animals/hanamaru.png" alt="はなまる" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E7D32' }}>{maxQ}かい ぜんぶ できたね！</div>
              <CompletionActions activityId="S2_fill_blank" onRestart={resetAll} stagePath="/kids" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
