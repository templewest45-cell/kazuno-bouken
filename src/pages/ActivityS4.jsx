import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, RotateCcw } from 'lucide-react';
import BalanceScale from '../components/BalanceScale';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';

export default function ActivityS4() {
  const navigate = useNavigate();
  
  // State
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);
  const [phase, setPhase] = useState('place'); // place -> count -> total -> finish
  const [countedItems, setCountedItems] = useState([]);
  const [showTotal, setShowTotal] = useState(false);

  const THEME = { left: '🍎', right: '🐟' };
  const MAX_ITEMS = 5;

  const heavySide = leftCount > rightCount ? 'left' : rightCount > leftCount ? 'right' : 'equal';
  const targetCount = heavySide === 'left' ? leftCount : heavySide === 'right' ? rightCount : leftCount;

  useEffect(() => {
    if (phase === 'place') {
      speak('さらに のせてみよう');
    } else if (phase === 'count') {
      speak('おおい ほうを かぞえよう');
    }
  }, [phase]);

  const handleAddLeft = () => {
    if (leftCount < MAX_ITEMS && phase === 'place') setLeftCount(prev => prev + 1);
  };

  const handleAddRight = () => {
    if (rightCount < MAX_ITEMS && phase === 'place') setRightCount(prev => prev + 1);
  };

  const handleCompareDone = () => {
    if (leftCount === 0 && rightCount === 0) return;
    setPhase('count');
    LogStore.addLog({
      stage: 'S1',
      activity: 'dochiga_ooi',
      left_count: leftCount,
      right_count: rightCount,
      correct: true
    });
  };

  const handleItemTap = (side, index) => {
    if (phase !== 'count') return;
    if (side !== heavySide && heavySide !== 'equal') return; // Only count heavy side

    const itemId = `${side}-${index}`;
    if (!countedItems.includes(itemId)) {
      const newCounted = [...countedItems, itemId];
      setCountedItems(newCounted);
      speak(newCounted.length.toString());

      if (newCounted.length === targetCount) {
        setTimeout(() => {
          setPhase('total');
          setShowTotal(true);
          speak(`ぜんぶで ${targetCount}こ！`);
          
          LogStore.addLog({
            stage: 'S4',
            activity: 'zenbude_ikutsu',
            counted_number: targetCount,
            answer_correct: true
          });
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    setLeftCount(0);
    setRightCount(0);
    setPhase('place');
    setCountedItems([]);
    setShowTotal(false);
  };

  const renderItems = (count, side) => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const isCounted = countedItems.includes(`${side}-${i}`);
      items.push(
        <div 
          key={i} 
          className="item animate-drop-in"
          style={{ opacity: isCounted ? 0.5 : 1, transform: isCounted ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.3s' }}
          onClick={() => handleItemTap(side, i)}
        >
          {side === 'left' ? THEME.left : THEME.right}
        </div>
      );
    }
    return items;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px' }}>
      <div className="header">
        <button className="btn" onClick={() => navigate('/kids')}>
          <ArrowLeft size={24} />
          もどる
        </button>
        <button className="btn" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0 }}>
          <Lightbulb size={24} color="#FF9800" />
        </button>
      </div>

      <h2 className="question-text" onClick={() => speak(phase === 'place' ? 'さらに のせてみよう' : 'おおい ほうを かぞえよう')}>
        {phase === 'place' ? 'さらに のせてみよう' : 
         phase === 'count' ? 'おおい ほうを かぞえよう' : 'ぜんぶで いくつ？'}
      </h2>

      <div style={{ flex: 1, position: 'relative' }}>
        <BalanceScale 
          leftCount={leftCount} 
          rightCount={rightCount}
          leftArea={renderItems(leftCount, 'left')}
          rightArea={renderItems(rightCount, 'right')}
        />

        {showTotal && (
          <div className="animate-pop-in" style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%) scale(2)',
            fontSize: '120px', fontWeight: 'bold', color: 'var(--primary-color)',
            textShadow: '0 4px 20px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.8)',
            zIndex: 100
          }}>
            {targetCount}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {/* 結果バー */}
        <div style={{ 
          textAlign: 'center', fontSize: '24px', fontWeight: 'bold', padding: '10px', borderRadius: '8px',
          backgroundColor: leftCount === 0 && rightCount === 0 ? '#eee' :
                           heavySide === 'left' ? '#E8F5E9' : 
                           heavySide === 'right' ? '#FFF3E0' : '#F3E5F5',
          color: leftCount === 0 && rightCount === 0 ? '#999' :
                 heavySide === 'left' ? '#2E7D32' : 
                 heavySide === 'right' ? '#E65100' : '#6A1B9A'
        }}>
          {leftCount === 0 && rightCount === 0 ? 'さらに のせてみよう' :
           heavySide === 'left' ? 'りんごのほうが おおい！' :
           heavySide === 'right' ? 'さかなのほうが おおい！' : 'おなじ かず！ ぴったり！'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="btn btn-primary" style={{ fontSize: '24px' }} onClick={handleAddLeft} disabled={phase !== 'place' || leftCount >= MAX_ITEMS}>
              🍎 のせる ({leftCount})
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '24px' }} onClick={handleAddRight} disabled={phase !== 'place' || rightCount >= MAX_ITEMS}>
              🐟 のせる ({rightCount})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {phase === 'place' && (leftCount > 0 || rightCount > 0) && (
              <button className="btn" style={{ background: '#2196F3', color: 'white' }} onClick={handleCompareDone}>
                くらべる！
              </button>
            )}
            <button className="btn" onClick={handleReset}>
              <RotateCcw size={24} />
              やりなおす
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
