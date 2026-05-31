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
  
  const targetSeq = Array.from({ length }, (_, i) => startNum + i);
  
  // シャッフル（Fisher-Yates）
  const shuffledCards = [...targetSeq];
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }

  return {
    targetSeq,
    shuffledCards
  };
}

export default function ActivityS2Arrange() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  
  const [roundCount, setRoundCount] = useState(0);
  const [problem, setProblem] = useState(generateProblem);
  const [placedCount, setPlacedCount] = useState(0); // 0から始まり、正解するごとに増える
  const [phase, setPhase] = useState('play'); // 'play', 'reading', 'done'
  const [wrongTarget, setWrongTarget] = useState(null);
  
  const initProblem = useCallback(() => {
    setProblem(generateProblem());
    setPlacedCount(0);
    setPhase('play');
    setWrongTarget(null);
    setTimeout(() => speak('ちいさい じゅんばんに ならべてね！'), 300);
  }, []);

  const handleCardTap = (num) => {
    if (phase !== 'play') return;

    // すでに配置済みの数字なら何もしない
    const isAlreadyPlaced = problem.targetSeq.slice(0, placedCount).includes(num);
    if (isAlreadyPlaced) return;

    const expectedNum = problem.targetSeq[placedCount];

    if (num === expectedNum) {
      // 正解
      const nextCount = placedCount + 1;
      setPlacedCount(nextCount);
      speak(JP_NUMS[num]);
      
      if (nextCount === problem.targetSeq.length) {
        // 全部並べ終わった
        setPhase('reading');
        
        setTimeout(() => {
          speak('せいかい！');
          
          setTimeout(() => {
            let delay = 0;
            problem.targetSeq.forEach((n) => {
              setTimeout(() => {
                speak(JP_NUMS[n]);
              }, delay);
              delay += 800;
            });
            
            setTimeout(() => {
              setPhase('done');
              setRoundCount(r => r + 1);
              LogStore.addLog({ stage: 'S2', activity: 'arrange_cards', correct: true });
            }, delay + 500);
          }, 1000);

        }, 800);
      }
    } else {
      // 不正解
      setWrongTarget(num);
      speak('ちがうみたい。どれが さいしょに くるかな？');
      setTimeout(() => setWrongTarget(null), 600); // アニメーション時間後にリセット
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
          カードを ならべる
        </div>
        <button className="btn" onClick={resetAll} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* 問いかけ */}
      <div style={{ textAlign: 'center', padding: '24px 16px 8px', fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
        {phase === 'play' ? 'じゅんばんに タップして ならべてね！' : '⭐ せいかい！ じゅんばんに ならんだね！ ⭐'}
      </div>

      {/* メインコンテンツ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '80px', padding: '16px' }}>
        
        {/* 上部：スロット（カードが入る枠） */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center',
          backgroundColor: '#E3F2FD', padding: '40px', borderRadius: '48px',
          boxShadow: '0 8px 32px rgba(13, 71, 161, 0.1)', border: '6px solid #90CAF9'
        }}>
          {problem.targetSeq.map((num, i) => {
            const isFilled = i < placedCount;
            // readingフェーズでは少しピョンと跳ねるアニメーションをつけてもよい
            
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '130px', height: '130px',
                backgroundColor: isFilled ? 'white' : 'transparent',
                border: isFilled ? '6px solid #4CAF50' : '6px dashed #90CAF9',
                borderRadius: '32px',
                color: isFilled ? '#2E7D32' : 'transparent',
                fontSize: '72px', fontWeight: 'bold',
                boxShadow: isFilled ? '0 12px 24px rgba(76, 175, 80, 0.2)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: isFilled ? 'scale(1)' : 'scale(0.95)'
              }}>
                {isFilled && <div className="animate-pop-in">{num}</div>}
              </div>
            );
          })}
        </div>

        {/* 下部：シャッフルされたカード群 */}
        {phase === 'play' && (
          <div className="animate-drop-in" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {problem.shuffledCards.map((num, idx) => {
              const isAlreadyPlaced = problem.targetSeq.slice(0, placedCount).includes(num);
              const isWrong = wrongTarget === num;

              // 配置済みのカードは見えなくする（レイアウトは維持するためvisibility:hidden）
              if (isAlreadyPlaced) {
                return (
                  <div key={idx} style={{ width: '130px', height: '130px', visibility: 'hidden' }} />
                );
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleCardTap(num)}
                  className={isWrong ? 'animate-shake' : ''}
                  style={{
                    width: '130px', height: '130px',
                    backgroundColor: isWrong ? '#FFEBEE' : '#FFF9C4', // 黄色っぽいカード
                    border: `6px solid ${isWrong ? '#EF5350' : '#FBC02D'}`,
                    borderRadius: '32px',
                    fontSize: '72px', fontWeight: 'bold', color: isWrong ? '#D32F2F' : '#F57C00',
                    boxShadow: '0 12px 24px rgba(251, 192, 45, 0.25)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: isWrong ? 'scale(0.95)' : 'scale(1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  onMouseOver={e => { if(!isWrong) e.currentTarget.style.transform = 'translateY(-6px)'; }}
                  onMouseOut={e => { if(!isWrong) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {num}
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

          {phase === 'done' && roundCount >= maxQ && (
            <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <img src="/animals/hanamaru.png" alt="はなまる" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E7D32' }}>{maxQ}かい ぜんぶ できたね！</div>
              <CompletionActions activityId="S2_arrange_cards" onRestart={resetAll} stagePath="/kids" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
