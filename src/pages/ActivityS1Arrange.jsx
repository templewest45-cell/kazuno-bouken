import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import { Settings } from '../store/settings';
import CompletionActions from './CompletionActions';

const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく'];

// 問題セット（目標個数）
const PROBLEMS = [2, 3, 4, 5, 3, 2, 4, 5];
const BOX_TOTAL = 8; // 箱の中のりんご総数（多めに見せる）

export default function ActivityS1Arrange() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  const [problemIdx, setProblemIdx] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [phase, setPhase] = useState('arrange');
  const [popNum, setPopNum] = useState(null);
  const [bouncingIdx, setBouncingIdx] = useState(null); // 箱のどのりんごが動いたか
  const doneRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  const target = PROBLEMS[problemIdx];
  const remaining = BOX_TOTAL - placed; // 箱に残っているりんご数

  const initProblem = useCallback((idx) => {
    setPlaced(0);
    setPhase('arrange');
    setPopNum(null);
    setBouncingIdx(null);
    doneRef.current = false;
    startTimeRef.current = Date.now();
    setTimeout(() => speak(`${JP_NUMS[PROBLEMS[idx]]}こ いれよう`), 300);
  }, []);

  useEffect(() => { initProblem(problemIdx); }, [problemIdx]);

  // 箱のりんごをタップ → 皿に移動
  const handleBoxTap = useCallback((tapIdx) => {
    if (phase !== 'arrange' || doneRef.current) return;
    if (placed >= target) return;

    setBouncingIdx(tapIdx);
    setTimeout(() => setBouncingIdx(null), 400);

    const next = placed + 1;
    speak(JP_NUMS[next]);

    setPopNum(next);
    setTimeout(() => setPopNum(null), 700);

    setPlaced(next);

    if (next >= target) {
      doneRef.current = true;
      setTimeout(() => {
        setPhase('done');
        setRoundCount(r => r + 1);
        speak(`できた！ ${JP_NUMS[target]}こ はいったね！ すごい！`);
        LogStore.addLog({
          stage: 'S1', activity: 'arrange_same',
          target, placed: next,
          response_time_ms: Date.now() - startTimeRef.current,
        });
      }, 500);
    }
  }, [phase, placed, target]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', backgroundColor: '#FAFAFA' }}>

      {/* ヘッダー */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #EEE' }}>
        <button className="btn" onClick={() => navigate('/kids/stage/1')} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <ArrowLeft size={20} /> もどる
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#444' }}>
          おなじ かずだけ ならべよう
        </div>
        <button className="btn" onClick={() => initProblem(problemIdx)} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* 目標表示 */}
      <div style={{ textAlign: 'center', padding: '20px 16px 8px' }}>
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          backgroundColor: phase === 'done' ? '#E8F5E9' : '#FFF8E1',
          border: `3px solid ${phase === 'done' ? '#66BB6A' : '#FFD54F'}`,
          borderRadius: '20px', padding: '16px 32px',
          transition: 'all 0.4s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '64px', fontWeight: 'bold', color: phase === 'done' ? '#2E7D32' : '#E65100', lineHeight: 1 }}>
              {target}
            </span>
            <span style={{ fontSize: '24px', color: '#555' }}>
              {phase === 'done' ? 'こ はいったね！🎉' : 'こ いれよう！'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '8px 24px 16px' }}>

        {/* ── 上: りんごの箱（タップして取り出す） ── */}
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontSize: '15px', color: '#999', fontWeight: 'bold' }}>📦 りんごの はこ（タップしてとろう）</div>
          <div style={{
            width: '100%',
            backgroundColor: '#FFF3E0',
            border: '3px solid #FFCC80',
            borderRadius: '20px',
            padding: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            minHeight: '120px',
            boxShadow: '0 4px 16px rgba(255,152,0,0.1)',
          }}>
            {Array.from({ length: BOX_TOTAL }).map((_, i) => {
              const taken = i < placed; // 取られたりんご
              const isBouncing = bouncingIdx === i;
              return (
                <div
                  key={i}
                  onClick={() => !taken && handleBoxTap(i)}
                  style={{
                    width: '72px', height: '72px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '44px',
                    borderRadius: '14px',
                    cursor: taken || phase !== 'arrange' ? 'default' : 'pointer',
                    opacity: taken ? 0.12 : 1,
                    transform: isBouncing ? 'scale(0.7) translateY(-12px)' : 'scale(1)',
                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    backgroundColor: taken ? 'transparent' : 'white',
                    boxShadow: taken ? 'none' : '0 3px 10px rgba(0,0,0,0.08)',
                    border: taken ? '2px dashed #FFCC80' : '2px solid #FFE0B2',
                  }}
                >
                  {!taken && '🍎'}
                </div>
              );
            })}
          </div>
        </div>

        {/* 矢印（下向き） */}
        <div style={{ fontSize: '40px', color: '#BDBDBD', lineHeight: 1 }}>↓</div>

        {/* ── 下: 皿（入れた分が積まれる） ── */}
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          
          {/* みほん（Sample）表示（皿の真上） */}
          {phase === 'arrange' && (
            <div className="animate-drop-in" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: '#FFF8E1', padding: '8px 20px',
              borderRadius: '20px', border: '2px dashed #FFCA28',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '15px', color: '#F57C00', fontWeight: 'bold', marginRight: '4px' }}>みほん:</span>
              {Array.from({ length: target }).map((_, i) => (
                <span key={i} style={{ fontSize: '32px', lineHeight: 1 }}>🍎</span>
              ))}
            </div>
          )}

          <div style={{ fontSize: '15px', color: '#999', fontWeight: 'bold' }}>🍽️ おさら</div>
          <div style={{
            position: 'relative',
            width: '100%',
            backgroundColor: phase === 'done' ? '#E8F5E9' : 'white',
            border: `3px ${phase === 'done' ? 'solid #66BB6A' : 'dashed #90CAF9'}`,
            borderRadius: '20px',
            padding: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            minHeight: '100px',
            transition: 'all 0.4s',
            boxShadow: phase === 'done' ? '0 0 24px #66BB6A44' : '0 4px 16px rgba(0,0,0,0.03)',
          }}>
            {/* 数字ポップ */}
            {popNum !== null && (
              <div className="animate-pop-in" style={{
                position: 'absolute', top: '-28px', right: '16px',
                fontSize: '56px', fontWeight: 'bold', color: '#FF8F00',
                pointerEvents: 'none', zIndex: 10,
              }}>
                {popNum}
              </div>
            )}

            {placed === 0 && (
              <div style={{ color: '#BDBDBD', fontSize: '18px', alignSelf: 'center', padding: '12px' }}>
                ここに はいるよ
              </div>
            )}

            {Array.from({ length: placed }).map((_, i) => (
              <div
                key={i}
                className={i === placed - 1 ? 'animate-pop-in' : ''}
                style={{
                  width: '72px', height: '72px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '44px',
                  backgroundColor: phase === 'done' ? '#C8E6C9' : '#E3F2FD',
                  borderRadius: '14px',
                  border: `2px solid ${phase === 'done' ? '#66BB6A' : '#90CAF9'}`,
                }}
              >
                🍎
              </div>
            ))}
          </div>

          {/* 進捗インジケーター */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            {Array.from({ length: target }).map((_, i) => (
              <div key={i} style={{
                width: '36px', height: '10px',
                borderRadius: '5px',
                backgroundColor: i < placed ? '#66BB6A' : '#E0E0E0',
                transition: 'background-color 0.3s',
                boxShadow: i < placed ? '0 0 6px #66BB6A88' : 'none',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ボトムバー */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #EEE', display: 'flex', justifyContent: 'center' }}>
        {phase === 'done' && roundCount < maxQ && (
          <button
            className="btn btn-primary animate-pop-in"
            style={{ fontSize: '20px', padding: '16px 48px' }}
            onClick={() => setProblemIdx(i => i + 1)}
          >
            つぎへ！ ({roundCount}/{maxQ})
          </button>
        )}
        {phase === 'done' && roundCount >= maxQ && (
          <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '60px' }}>🎉</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2E7D32' }}>{maxQ}かい ぜんぶ できたね！</div>
            <CompletionActions activityId="S1_arrange" onRestart={() => { setRoundCount(0); setProblemIdx(0); }} stagePath="/kids" />
          </div>
        )}
      </div>
    </div>
  );
}
