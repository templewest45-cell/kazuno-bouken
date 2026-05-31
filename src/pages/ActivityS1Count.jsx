import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import { Settings } from '../store/settings';
import CompletionActions from './CompletionActions';

const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく'];

const ANIMALS = [
  { key: 'bear',  name: 'クマ',    open: '/animals/animal_open.png', happy: '/animals/animal_happy.png' },
  { key: 'cat',   name: 'ネコ',    open: '/animals/cat_open.png',    happy: '/animals/cat_happy.png'    },
  { key: 'dog',   name: 'イヌ',    open: '/animals/dog_open.png',    happy: '/animals/dog_happy.png'    },
  { key: 'lion',  name: 'ライオン', open: '/animals/lion_open.png',  happy: '/animals/lion_happy.png'  },
  { key: 'panda', name: 'パンダ',  open: '/animals/panda_open.png',  happy: '/animals/panda_happy.png'  },
];

const FOOD = { src: '/animals/apple.svg', name: 'りんご' };

// 問題セット: [目標個数]（トレイはtargetと同数）
const PROBLEMS = [
  { target: 2 },
  { target: 3 },
  { target: 4 },
  { target: 5 },
];

export default function ActivityS1Count() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  const [problemIdx, setProblemIdx] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [animal, setAnimal] = useState(null);
  const [given, setGiven]   = useState(0);       // あげた数
  const [phase, setPhase]   = useState('feed');  // feed → done
  const [popNum, setPopNum]  = useState(null);   // タップ時に数字をポップ表示
  const startTimeRef = useRef(Date.now());

  const dragFoodRef = useRef(null);
  const ghostRef    = useRef(null);
  const doneRef     = useRef(false);             // 二重完了防止

  const target = PROBLEMS[problemIdx].target;

  // 問題初期化
  const initProblem = useCallback((idx) => {
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setAnimal(randomAnimal);
    setGiven(0);
    setPhase('feed');
    setPopNum(null);
    doneRef.current = false;
    startTimeRef.current = Date.now();
    const t = PROBLEMS[idx].target;
    setTimeout(() => speak(`${randomAnimal.name}に ${JP_NUMS[t]}こ あげよう`), 300);
  }, []);

  useEffect(() => { initProblem(problemIdx); }, [problemIdx]);

  // ── あげる処理 ──────────────────────────────────
  const giveFood = useCallback(() => {
    if (doneRef.current) return;
    setGiven(prev => {
      if (prev >= target) return prev; // 上限でブロック
      const next = prev + 1;
      speak(JP_NUMS[next]);

      // 数字ポップアニメ
      setPopNum(next);
      setTimeout(() => setPopNum(null), 700);

      // 目標達成
      if (next >= target) {
        doneRef.current = true;
        setTimeout(() => {
          setPhase('done');
          const next = roundCount + 1;
          setRoundCount(next);
          speak(`できた！ ${JP_NUMS[target]}こ あげたね！ すごい！`);
          LogStore.addLog({
            stage: 'S1', activity: 'count_mark',
            target, given: next,
            response_time_ms: Date.now() - startTimeRef.current,
          });
        }, 500);
      }
      return next;
    });
  }, [target]);

  // ── ドラッグ (PC) ──────────────────────────────
  const handleDragStart = (e, idx) => {
    dragFoodRef.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDrop = (e) => {
    e.preventDefault();
    if (dragFoodRef.current !== null && phase === 'feed') {
      giveFood();
      dragFoodRef.current = null;
    }
  };

  // ── タッチ (スマホ) ──────────────────────────────
  const handleTouchStart = (e, idx) => {
    if (phase !== 'feed') return;
    e.preventDefault();
    dragFoodRef.current = idx;
    const t = e.touches[0];
    const ghost = document.createElement('img');
    ghost.src = FOOD.src;
    ghost.style.cssText = `position:fixed;width:90px;height:90px;pointer-events:none;z-index:9999;opacity:0.85;transform:translate(-50%,-50%);`;
    ghost.style.left = t.clientX + 'px';
    ghost.style.top  = t.clientY + 'px';
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!ghostRef.current) return;
    const t = e.touches[0];
    ghostRef.current.style.left = t.clientX + 'px';
    ghostRef.current.style.top  = t.clientY + 'px';
  };
  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (ghostRef.current) { document.body.removeChild(ghostRef.current); ghostRef.current = null; }
    if (dragFoodRef.current === null || phase !== 'feed') return;
    const t = e.changedTouches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    if (el?.closest('[data-animal-drop]')) giveFood();
    dragFoodRef.current = null;
  };

  if (!animal) return null;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', backgroundColor: '#FAFAFA' }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ヘッダー */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #EEE' }}>
        <button className="btn" onClick={() => navigate('/kids/stage/1')} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <ArrowLeft size={20} /> もどる
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#444' }}>
          かずを かぞえながら あげよう
        </div>
        <button className="btn" onClick={() => initProblem(problemIdx)} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* ── 目標表示 ── */}
      <div style={{ textAlign: 'center', padding: '24px 16px 8px' }}>
        <div style={{ fontSize: '22px', color: '#555', marginBottom: '8px' }}>
          {animal.name}に
        </div>
        {/* 目標数を大きく表示 */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          backgroundColor: '#FFF8E1', border: '3px solid #FFD54F',
          borderRadius: '20px', padding: '12px 32px',
        }}>
          <div style={{ fontSize: '72px', fontWeight: 'bold', color: '#E65100', lineHeight: 1 }}>
            {target}
          </div>
          <div style={{ fontSize: '28px', color: '#555' }}>こ<br/>あげよう！</div>
        </div>
      </div>

      {/* ── カウンター ── */}
      <div style={{ textAlign: 'center', padding: '12px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {Array.from({ length: target }).map((_, i) => (
            <div key={i} style={{
              width: '48px', height: '48px',
              borderRadius: '50%',
              backgroundColor: i < given ? '#66BB6A' : '#E0E0E0',
              border: `3px solid ${i < given ? '#43A047' : '#BDBDBD'}`,
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: i === given - 1 ? 'scale(1.2)' : 'scale(1)',
              boxShadow: i < given ? '0 0 12px #66BB6A88' : 'none',
            }} />
          ))}
        </div>
        <div style={{ fontSize: '20px', color: '#888', marginTop: '8px' }}>
          {given} / {target}
        </div>
      </div>

      {/* ── 動物ゾーン（ドロップ先） ── */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 24px' }}>
        <div
          data-animal-drop="true"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            width: '220px', padding: '20px',
            backgroundColor: phase === 'done' ? '#E8F5E9' : 'white',
            border: `3px solid ${phase === 'done' ? '#66BB6A' : '#E0E0E0'}`,
            borderRadius: '24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            boxShadow: phase === 'done' ? '0 0 24px #66BB6A44' : '0 4px 16px rgba(0,0,0,0.06)',
            transition: 'all 0.3s',
          }}
        >
          {/* 数字ポップ */}
          {popNum !== null && (
            <div className="animate-pop-in" style={{
              position: 'absolute', top: '-20px', right: '10px',
              fontSize: '56px', fontWeight: 'bold', color: '#FF8F00',
              pointerEvents: 'none', zIndex: 10,
            }}>
              {popNum}
            </div>
          )}

          <img
            src={phase === 'done' ? animal.happy : animal.open}
            alt={animal.name}
            draggable={false}
            style={{ width: '160px', height: '160px', objectFit: 'contain', transition: 'all 0.4s' }}
          />
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: phase === 'done' ? '#2E7D32' : '#555' }}>
            {phase === 'done' ? 'ありがとう！ 🎉' : animal.name}
          </div>
        </div>
      </div>

      {/* ── 食べ物トレイ ── */}
      {phase === 'feed' && (
        <div style={{
          margin: '12px auto', padding: '16px 28px',
          backgroundColor: 'white', border: '2px solid #E0E0E0',
          borderRadius: '20px', display: 'flex', gap: '12px',
          flexWrap: 'wrap', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          maxWidth: '480px', width: '90%',
        }}>
          <div style={{ width: '100%', textAlign: 'center', fontSize: '15px', color: '#999' }}>
            ↑ ひとつずつ ドラッグして あげてね
          </div>
          {/* 残りのりんごだけ表示（食べた分は消える） */}
          {Array.from({ length: target - given }).map((_, i) => (
            <div
              key={i}
              draggable
              onDragStart={e => handleDragStart(e, i)}
              onTouchStart={e => handleTouchStart(e, i)}
              style={{
                width: '90px', height: '90px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab',
              }}
            >
              <img src={FOOD.src} alt={FOOD.name} draggable={false}
                style={{ width: '80px', height: '80px', objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.18))' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── ボトムバー ── */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #EEE', display: 'flex', justifyContent: 'center', gap: '16px', marginTop: 'auto' }}>
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
            <CompletionActions activityId="S1_count_mark" onRestart={() => { setRoundCount(0); setProblemIdx(0); }} stagePath="/kids" />
          </div>
        )}
      </div>
    </div>
  );
}
