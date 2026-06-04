import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import { Settings } from '../store/settings';
import { lockKidsScroll, unlockKidsScroll } from '../utils/scrollLock';
import CompletionActions from './CompletionActions';
import './ActivityS1.css';

const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'];

// ── 動物定義 ─────────────────────────────────────
const ANIMALS = [
  { key: 'bear',  name: 'クマ',   open: '/animals/animal_open.png', happy: '/animals/animal_happy.png' },
  { key: 'cat',   name: 'ネコ',   open: '/animals/cat_open.png',    happy: '/animals/cat_happy.png'    },
  { key: 'dog',   name: 'イヌ',   open: '/animals/dog_open.png',    happy: '/animals/dog_happy.png'    },
  { key: 'lion',  name: 'ライオン', open: '/animals/lion_open.png',  happy: '/animals/lion_happy.png'  },
  { key: 'panda', name: 'パンダ', open: '/animals/panda_open.png',  happy: '/animals/panda_happy.png'  },
];

const FOOD = { src: '/animals/apple.svg', name: 'りんご' };

// 問題セット: 何匹の動物に食べさせるか
const PROBLEMS = [2, 3, 4, 5];

export default function ActivityS1() {
  const navigate = useNavigate();
  const maxQ = Settings.get().questionsPerRound;
  const [problemIdx, setProblemIdx] = useState(0);
  const [roundCount, setRoundCount] = useState(0);  // 完了したラウンド数
  const animalCount = PROBLEMS[problemIdx % PROBLEMS.length];

  // 問題ごとに使う動物をシャッフルして選ぶ
  const [animals, setAnimals] = useState([]);
  const [fedSet, setFedSet] = useState(new Set());       // fed animal keys
  const [phase, setPhase] = useState('feed');             // feed → counting → done
  const [countDisplay, setCountDisplay] = useState([]);   // 数え上げ表示
  const [countNum, setCountNum] = useState(0);
  const startTimeRef = useRef(Date.now());
  const countingStarted = useRef(false);

  // ── ドラッグ & タッチ状態 ──
  const dragFoodRef = useRef(null);
  const ghostRef = useRef(null);          // touch ghost element

  useEffect(() => {
    return () => unlockKidsScroll();
  }, []);

  // 問題初期化
  const initProblem = useCallback((idx) => {
    const count = PROBLEMS[idx % PROBLEMS.length];
    const shuffled = [...ANIMALS].sort(() => Math.random() - 0.5).slice(0, count);
    setAnimals(shuffled);
    setFedSet(new Set());
    setPhase('feed');
    setCountDisplay([]);
    setCountNum(0);
    countingStarted.current = false;
    startTimeRef.current = Date.now();
    setTimeout(() => speak('どうぶつさんに ごはんを あげよう'), 300);
  }, []);

  useEffect(() => { initProblem(problemIdx); }, [problemIdx]);

  // ── 食べさせる処理 ─────────────────────────────
  const feedAnimal = useCallback((animalKey) => {
    setFedSet(prev => {
      if (prev.has(animalKey)) return prev;
      speak('もぐもぐ');
      const next = new Set(prev);
      next.add(animalKey);
      return next;
    });
  }, []);

  // fedSet が全員分になったらカウントアップ開始
  useEffect(() => {
    if (phase !== 'feed') return;
    if (fedSet.size > 0 && fedSet.size >= animalCount && !countingStarted.current) {
      countingStarted.current = true;
      const t = setTimeout(() => startCounting(animalCount), 700);
      return () => clearTimeout(t);
    }
  }, [fedSet, phase, animalCount]);

  // ── カウントアップアニメーション ──────────────
  const startCounting = (total) => {
    setPhase('counting');
    speak('ぜんぶで いくつ？');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      speak(JP_NUMS[i]);
      setCountDisplay(prev => [...prev, i]);
      setCountNum(i);
      if (i >= total) {
        clearInterval(interval);
        setTimeout(() => {
          speak(`ぜんぶで ${JP_NUMS[total]}こ！ すごい！`);
          setPhase('done');
          const nextRound = roundCount + 1;
          setRoundCount(current => current + 1);
          LogStore.addLog({
            stage: 'S1', activity: 'feed_animal',
            count: total, round: nextRound,
            response_time_ms: Date.now() - startTimeRef.current,
          });
        }, 600);
      }
    }, 700);
  };

  // ── ドラッグ (PC) ─────────────────────────────
  const handleDragStart = (e, foodIdx) => {
    dragFoodRef.current = foodIdx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, animalKey) => {
    e.preventDefault();
    if (dragFoodRef.current !== null && phase === 'feed') {
      feedAnimal(animalKey);
      dragFoodRef.current = null;
    }
  };

  // ── タッチ (スマホ/タブレット) ─────────────────
  const handleTouchStart = (e, foodIdx) => {
    if (phase !== 'feed') return;
    e.preventDefault();
    lockKidsScroll();
    dragFoodRef.current = foodIdx;
    const t = e.touches[0];
    // ゴーストを作る
    const ghost = document.createElement('img');
    ghost.src = FOOD.src;
    ghost.style.cssText = `position:fixed;width:80px;height:80px;pointer-events:none;z-index:9999;opacity:0.85;transform:translate(-50%,-50%);transition:none;`;
    ghost.style.left = t.clientX + 'px';
    ghost.style.top  = t.clientY + 'px';
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e) => {
    if (!ghostRef.current) return;
    e.preventDefault();
    const t = e.touches[0];
    ghostRef.current.style.left = t.clientX + 'px';
    ghostRef.current.style.top  = t.clientY + 'px';
  };

  const handleTouchEnd = (e) => {
    if (dragFoodRef.current === null && !ghostRef.current) return;
    e.preventDefault();
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    if (dragFoodRef.current === null || phase !== 'feed') {
      unlockKidsScroll();
      return;
    }
    const t = e.changedTouches[0];
    // ドロップ先の動物を探す
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const animalEl = el?.closest('[data-animal-key]');
    if (animalEl) {
      feedAnimal(animalEl.dataset.animalKey);
    }
    dragFoodRef.current = null;
    unlockKidsScroll();
  };

  const handleTouchCancel = () => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    dragFoodRef.current = null;
    unlockKidsScroll();
  };

  // まだ食べていない食べ物の数
  const remainingFood = animalCount - fedSet.size;

  return (
    <div
      className="s1-feed-page"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', backgroundColor: '#FAFAFA' }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {/* ヘッダー */}
      <div className="s1-feed-header" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #EEE' }}>
        <button className="btn" onClick={() => navigate('/kids/stage/1')} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <ArrowLeft size={20} /> もどる
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#444' }}>
          ものと かずを あわせよう
        </div>
        <button className="btn" onClick={() => initProblem(problemIdx)} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* 問いかけ */}
      <div
        className="s1-feed-question"
        style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold', padding: '20px 16px 8px', cursor: 'pointer',
          color: phase === 'done' ? '#2E7D32' : '#333' }}
        onClick={() => speak(phase === 'feed' ? 'どうぶつさんに ごはんを あげよう' : `ぜんぶで ${JP_NUMS[animalCount]}こ！`)}
      >
        {phase === 'feed'     && 'どうぶつさんに ごはんを ひとつずつ あげよう'}
        {phase === 'counting' && 'ぜんぶで いくつ？'}
        {phase === 'done'     && `ぜんぶで ${JP_NUMS[animalCount]}こ あげたね！ 🎉`}
      </div>

      {/* ── 動物エリア ── */}
      <div className="s1-feed-animals" style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', padding: '16px 24px' }}>
        {animals.map(animal => {
          const fed = fedSet.has(animal.key);
          return (
            <div
              key={animal.key}
              className="s1-feed-animal-card"
              data-animal-key={animal.key}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => handleDrop(e, animal.key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                width: '180px',
                backgroundColor: fed ? '#E8F5E9' : 'white',
                border: `3px solid ${fed ? '#66BB6A' : '#E0E0E0'}`,
                borderRadius: '20px', padding: '20px 12px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: fed ? 'scale(1.05)' : 'scale(1)',
                boxShadow: fed ? '0 0 24px #66BB6A44' : '0 2px 8px rgba(0,0,0,0.06)',
                cursor: fed ? 'default' : 'copy',
              }}
            >
              <img
                className="s1-feed-animal-image"
                src={fed ? animal.happy : animal.open}
                alt={animal.name}
                draggable={false}
                style={{ width: '200px', height: '200px', objectFit: 'contain', transition: 'all 0.3s' }}
              />
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: fed ? '#2E7D32' : '#555' }}>
                {fed ? 'ありがとう！' : animal.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── カウントアップ表示（counting / done フェーズ） ── */}
      {(phase === 'counting' || phase === 'done') && (
        <div className="s1-feed-count" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px 24px', minHeight: '80px' }}>
          {countDisplay.map((n, i) => (
            <div key={i} className="animate-pop-in" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}>
              <img className="s1-feed-count-image" src={FOOD.src} alt="" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#FF8F00' }}>{n}</div>
            </div>
          ))}
          {phase === 'done' && (
            <img
              src="/animals/hanamaru.png"
              alt="はなまる"
              className="animate-pop-in"
              style={{ width: '72px', height: '72px', objectFit: 'contain', alignSelf: 'center' }}
            />
          )}
        </div>
      )}

      {/* ── 食べ物トレイ ── */}
      {phase === 'feed' && (
        <div className="s1-feed-tray" style={{
          margin: '0 auto 16px',
          padding: '20px 32px',
          backgroundColor: 'white',
          border: '2px solid #E0E0E0',
          borderRadius: '20px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={{ width: '100%', textAlign: 'center', fontSize: '16px', color: '#888', marginBottom: '4px' }}>
            ↑ ドラッグして どうぶつさんに あげてね
          </div>
          {Array.from({ length: animalCount }).map((_, i) => {
            const eaten = i >= remainingFood;
            return (
              <div
                key={i}
                draggable={!eaten}
                onDragStart={e => !eaten && handleDragStart(e, i)}
                onTouchStart={e => !eaten && handleTouchStart(e, i)}
                style={{
                  width: '110px', height: '110px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: eaten ? 0.1 : 1,
                  cursor: eaten ? 'default' : 'grab',
                  touchAction: eaten ? 'auto' : 'none',
                  transition: 'opacity 0.3s',
                }}
              >
                {!eaten && (
                  <img
                    src={FOOD.src}
                    alt={FOOD.name}
                    draggable={false}
                    style={{ width: '100px', height: '100px', objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.18))' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── ボトムバー ── */}
      <div className="s1-feed-footer" style={{ padding: '16px 24px', borderTop: '1px solid #EEE', display: 'flex', justifyContent: 'center', gap: '16px' }}>
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2E7D32' }}>
              {maxQ}かい ぜんぶ できたね！
            </div>
            <CompletionActions activityId="S1_tap_move" onRestart={() => { setRoundCount(0); setProblemIdx(0); }} stagePath="/kids" />
          </div>
        )}
      </div>
    </div>
  );
}
