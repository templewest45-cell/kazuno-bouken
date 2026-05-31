import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import CompletionActions from './CompletionActions';

const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご'];

const SCENES = [
  { count: 1, name: 'かに', emoji: '🦀', unit: 'ひき', text: 'かにが、いっぴき', color: '#FF7043', bg: '#FFCCBC' },
  { count: 2, name: 'やしのき', emoji: '🌴', unit: 'ほん', text: 'やしのきが、にほん', color: '#66BB6A', bg: '#C8E6C9' },
  { count: 3, name: 'わに', emoji: '🐊', unit: 'ひき', text: 'わにが、さんびき', color: '#4CAF50', bg: '#A5D6A7' },
  { count: 4, name: 'いわ', emoji: '🪨', unit: 'こ', text: 'いわが、よんこ', color: '#78909C', bg: '#CFD8DC' },
  { count: 5, name: 'かもめ', emoji: '🕊️', unit: 'わ', text: 'かもめが、ごわ', color: '#42A5F5', bg: '#BBDEFB' },
];

export default function ActivityS2() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 to 4 for scenes, 5 for treasure
  const [tappedItems, setTappedItems] = useState(new Set());
  const startTime = useRef(Date.now());

  const currentScene = SCENES[step];
  const isCompleted = currentScene && tappedItems.size >= currentScene.count;

  // シーンが切り替わった時の処理
  useEffect(() => {
    if (step < SCENES.length) {
      setTappedItems(new Set());
      setTimeout(() => speak(`${currentScene.name}を かぞえてみよう！ タップしてね！`), 400);
    } else {
      setTimeout(() => speak('たからばこ はっけん！ やったー！'), 300);
      LogStore.addLog({
        stage: 'S2', activity: 'count_up_island_interactive',
        completed: true,
        response_time_ms: Date.now() - startTime.current,
      });
    }
  }, [step]);

  // 全てタップし終わった時の処理
  useEffect(() => {
    if (step < SCENES.length && isCompleted) {
      setTimeout(() => speak(`ぜんぶで、${currentScene.text}！`), 500);
    }
  }, [isCompleted, step]);

  const handleTapItem = (index) => {
    if (isCompleted || tappedItems.has(index)) return;

    const newSet = new Set(tappedItems);
    newSet.add(index);
    setTappedItems(newSet);
    
    speak(JP_NUMS[newSet.size]);
  };

  const handleNext = () => {
    if (step < SCENES.length) {
      setStep(s => s + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setTappedItems(new Set());
    startTime.current = Date.now();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      
      {/* ヘッダー */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #EEE' }}>
        <button className="btn" onClick={() => navigate('/kids/stage/2')} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <ArrowLeft size={20} /> もどる
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#444' }}>
          じゅんばんに かぞえよう
        </div>
        <button className="btn" onClick={handleReset} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* 問いかけテキスト */}
      {step < SCENES.length && (
        <div style={{ textAlign: 'center', padding: '20px 16px 8px', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
          {isCompleted ? 'ぜんぶ かぞえられたね！' : `${currentScene.name}を タップして かぞえよう！`}
        </div>
      )}

      {/* メインコンテンツ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
        
        {step < SCENES.length ? (
          // 道中（カニ〜カモメ）
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
            
            {/* 数字とテキスト（完了時のみ表示） */}
            <div style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {isCompleted ? (
                <div className="animate-pop-in" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '80px', fontWeight: 'bold', color: currentScene.color, lineHeight: 1, marginBottom: '8px' }}>
                    {currentScene.count}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#555' }}>
                    {currentScene.name}が、{currentScene.count}{currentScene.unit}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '60px', color: '#CCC', fontWeight: 'bold' }}>?</div>
              )}
            </div>

            {/* イラスト（絵文字）エリア */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px',
              backgroundColor: currentScene.bg, padding: '32px', borderRadius: '32px',
              border: `4px solid ${currentScene.color}`, minWidth: '280px', maxWidth: '500px'
            }}>
              {Array.from({ length: currentScene.count }).map((_, i) => {
                const isTapped = tappedItems.has(i);
                return (
                  <div
                    key={i}
                    className="animate-drop-in"
                    onClick={() => handleTapItem(i)}
                    style={{
                      position: 'relative',
                      fontSize: '72px',
                      lineHeight: 1,
                      animationDelay: `${i * 0.1}s`,
                      cursor: isTapped ? 'default' : 'pointer',
                      transform: isTapped ? 'scale(1.1)' : 'scale(1)',
                      transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      opacity: isTapped ? 0.6 : 1,
                      filter: isTapped ? 'grayscale(0%)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                    }}
                  >
                    {currentScene.emoji}
                    {isTapped && (
                      <div className="animate-pop-in" style={{
                        position: 'absolute', top: '-10px', right: '-10px',
                        fontSize: '32px', zIndex: 10
                      }}>
                        ✅
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 次へボタン（完了時のみ表示） */}
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCompleted && (
                <button
                  className="btn btn-primary animate-pop-in"
                  onClick={handleNext}
                  style={{ padding: '16px 48px', fontSize: '24px' }}
                >
                  つぎへ！
                </button>
              )}
            </div>

          </div>
        ) : (
          // ゴール（宝箱）
          <div className="animate-pop-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
            <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#FFB300', textAlign: 'center' }}>
              たからばこ はっけん！<br />やったー！
            </div>
            
            <div style={{
              position: 'relative',
              backgroundColor: '#FFF8E1', padding: '40px', borderRadius: '40px',
              border: '6px solid #FFCA28', boxShadow: '0 0 40px #FFCA2866'
            }}>
              <img src="/treasure_chest.png" alt="たからばこ" style={{ width: '240px', height: 'auto', objectFit: 'contain', display: 'block' }} />
              <div style={{ position: 'absolute', top: -20, left: -20, fontSize: '40px' }} className="animate-drop-in">✨</div>
              <div style={{ position: 'absolute', top: 20, right: -30, fontSize: '50px' }} className="animate-drop-in">✨</div>
              <div style={{ position: 'absolute', bottom: -10, left: 20, fontSize: '40px' }} className="animate-drop-in">✨</div>
            </div>

            <CompletionActions activityId="S2_together" onRestart={handleReset} stagePath="/kids" />
          </div>
        )}

      </div>
    </div>
  );
}
