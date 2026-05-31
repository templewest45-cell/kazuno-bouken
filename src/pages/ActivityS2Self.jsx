import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Mic, MicOff } from 'lucide-react';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import CompletionActions from './CompletionActions';

const JP_NUMS = ['', 'いち', 'に', 'さん', 'よん', 'ご'];

// 認識するキーワード（揺らぎ対応）
const NUM_WORDS = [
  ['1', '一', 'いち', 'いーち', 'いっ'],
  ['2', '二', 'に', 'にー', 'にっ'],
  ['3', '三', 'さん', 'さーん', 'さ'],
  ['4', '四', 'よん', 'し', 'よーん', 'よ'],
  ['5', '五', 'ご', 'ごー', 'こ']
];

const SCENES = [
  { count: 1, name: 'かに', emoji: '🦀', unit: 'ひき', text: 'かにが、いっぴき', color: '#FF7043', bg: '#FFCCBC' },
  { count: 2, name: 'やしのき', emoji: '🌴', unit: 'ほん', text: 'やしのきが、にほん', color: '#66BB6A', bg: '#C8E6C9' },
  { count: 3, name: 'わに', emoji: '🐊', unit: 'ひき', text: 'わにが、さんびき', color: '#4CAF50', bg: '#A5D6A7' },
  { count: 4, name: 'いわ', emoji: '🪨', unit: 'こ', text: 'いわが、よんこ', color: '#78909C', bg: '#CFD8DC' },
  { count: 5, name: 'かもめ', emoji: '🕊️', unit: 'わ', text: 'かもめが、ごわ', color: '#42A5F5', bg: '#BBDEFB' },
];

export default function ActivityS2Self() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [recognizedCount, setRecognizedCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [transcript, setTranscript] = useState('');

  const startTime = useRef(Date.now());
  const recognitionRef = useRef(null);

  const currentScene = SCENES[step];
  const isCompleted = currentScene && recognizedCount >= currentScene.count;

  // 初期化・音声認識セットアップ
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ja-JP';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error !== 'no-speech') {
          setErrorMsg('マイクのエラーです');
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setErrorMsg('お使いのブラウザはマイクに対応していません');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Transcriptを監視してカウントアップ
  useEffect(() => {
    if (!currentScene || isCompleted || !transcript) return;

    let newCount = recognizedCount;
    let found = false;

    // 次に言うべき数字から順番にチェック
    while (newCount < currentScene.count) {
      const keywords = NUM_WORDS[newCount];
      const match = keywords.some(kw => transcript.includes(kw));
      
      if (match) {
        newCount++;
        found = true;
      } else {
        break; // 順番通りに言えていない場合はストップ
      }
    }

    if (found && newCount > recognizedCount) {
      setRecognizedCount(newCount);
      // カウントアップのたびにピン！と音を鳴らしたい場合はここ
    }
  }, [transcript, recognizedCount, currentScene, isCompleted]);

  // シーン進行の制御
  useEffect(() => {
    if (step < SCENES.length) {
      setRecognizedCount(0);
      setTranscript('');
      setErrorMsg('');
      setTimeout(() => speak(`${currentScene.name}を マイクで かぞえてみよう！`), 400);
    } else {
      setTimeout(() => speak('たからばこ はっけん！ やったー！'), 300);
      LogStore.addLog({
        stage: 'S2', activity: 'count_up_island_voice',
        completed: true,
        response_time_ms: Date.now() - startTime.current,
      });
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [step]);

  // 全てカウントし終わった時の処理
  useEffect(() => {
    if (step < SCENES.length && isCompleted) {
      setTimeout(() => speak(`ぜんぶで、${currentScene.text}！`), 500);
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isCompleted, step]);

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
        setErrorMsg('');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleManualOk = () => {
    if (currentScene && recognizedCount < currentScene.count) {
      setRecognizedCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (step < SCENES.length) {
      setStep(s => s + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setRecognizedCount(0);
    setTranscript('');
    startTime.current = Date.now();
    if (isListening && recognitionRef.current) recognitionRef.current.stop();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', backgroundColor: '#FAFAFA' }}>
      
      {/* ヘッダー */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #EEE' }}>
        <button className="btn" onClick={() => navigate('/kids/stage/2')} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <ArrowLeft size={20} /> もどる
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#444' }}>
          じぶんで となえる（マイク）
        </div>
        <button className="btn" onClick={handleReset} style={{ padding: '8px 16px', minHeight: '40px' }}>
          <RotateCcw size={18} />
        </button>
      </div>

      {/* 問いかけテキスト */}
      {step < SCENES.length && (
        <div style={{ textAlign: 'center', padding: '20px 16px 8px', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
          {isCompleted ? 'ぜんぶ かぞえられたね！' : `${currentScene.name}を マイクで かぞえよう！`}
        </div>
      )}

      {/* メインコンテンツ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 24px' }}>
        
        {step < SCENES.length ? (
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
                const isTapped = i < recognizedCount;
                return (
                  <div
                    key={i}
                    className="animate-drop-in"
                    style={{
                      position: 'relative',
                      fontSize: '72px',
                      lineHeight: 1,
                      animationDelay: `${i * 0.1}s`,
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

            {/* マイク操作エリア / 次へボタン */}
            <div style={{ height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {isCompleted ? (
                <button
                  className="btn btn-primary animate-pop-in"
                  onClick={handleNext}
                  style={{ padding: '16px 48px', fontSize: '24px' }}
                >
                  つぎへ！
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button
                      onClick={toggleListen}
                      style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        backgroundColor: isListening ? '#EF5350' : '#E0E0E0',
                        color: 'white',
                        border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isListening ? '0 0 20px rgba(239, 83, 80, 0.6)' : '0 4px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        animation: isListening ? 'pulse 1.5s infinite' : 'none'
                      }}
                    >
                      {isListening ? <Mic size={40} /> : <MicOff size={40} color="#888" />}
                    </button>

                    {/* 手動OKボタン（大人が判断） */}
                    <button
                      onClick={handleManualOk}
                      className="btn"
                      style={{
                        height: '60px', padding: '0 20px', fontSize: '18px', 
                        color: '#4CAF50', border: '2px solid #A5D6A7',
                        backgroundColor: '#F1F8E9'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                        <span>👍 言えた！</span>
                        <span style={{ fontSize: '12px', color: '#666' }}>(手動で進む)</span>
                      </div>
                    </button>
                  </div>
                  <div style={{ fontSize: '14px', color: isListening ? '#E53935' : '#888', fontWeight: 'bold' }}>
                    {isListening ? 'きいています… かずをいってね！' : 'マイクをおして はじめる'}
                  </div>
                  {errorMsg && <div style={{ color: '#D32F2F', fontSize: '12px' }}>{errorMsg}</div>}
                  {/* デバッグ用：認識テキストの表示 
                  <div style={{ fontSize: '10px', color: '#CCC' }}>{transcript}</div>
                  */}
                </div>
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

            <CompletionActions activityId="S2_self" onRestart={handleReset} stagePath="/kids" />
          </div>
        )}

      </div>
    </div>
  );
}
