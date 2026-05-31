import { useRef, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogStore } from '../store/logStore';
import { speak } from '../utils/speak';
import './ActivityS4Match.css';

export default function ActivityS4Trace() {
  const navigate = useNavigate(); const canvasRef = useRef(null); const drawingRef = useRef(false); const [number, setNumber] = useState(1); const [strokes, setStrokes] = useState(0);
  const clear = () => { const canvas = canvasRef.current; canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); setStrokes(0); };
  const point = (event) => { const canvas = canvasRef.current; const rect = canvas.getBoundingClientRect(); const source = event.touches?.[0] || event; return { x: (source.clientX - rect.left) * canvas.width / rect.width, y: (source.clientY - rect.top) * canvas.height / rect.height }; };
  const start = (event) => { event.preventDefault(); drawingRef.current = true; const ctx = canvasRef.current.getContext('2d'); const p = point(event); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = (event) => { if (!drawingRef.current) return; event.preventDefault(); const ctx = canvasRef.current.getContext('2d'); const p = point(event); ctx.lineWidth = 20; ctx.lineCap = 'round'; ctx.strokeStyle = '#f08b48'; ctx.lineTo(p.x, p.y); ctx.stroke(); };
  const end = () => { if (!drawingRef.current) return; drawingRef.current = false; setStrokes((value) => value + 1); };
  const next = () => { LogStore.addLog({ stage: 'S4', activity: 'trace_number', number, strokes }); speak(`${number}、じょうずに なぞれたね！`); setNumber(number === 10 ? 1 : number + 1); setTimeout(clear, 0); };
  return <div className="candy-count-page"><header className="candy-count-header"><button className="btn" onClick={() => navigate('/kids/stage/4')}><ArrowLeft size={20} /> <span>もどる</span></button><div className="candy-count-title">✏️ すうじを なぞろう</div><button className="btn" onClick={clear}><RotateCcw size={19} /></button></header>
    <main className="candy-count-main"><div className="candy-count-question">ゆびで {number} を なぞってみよう！</div><div className="candy-trace-board"><div className="candy-trace-guide">{number}</div><canvas ref={canvasRef} width="420" height="330" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} /></div></main>
    <footer className="candy-count-footer"><button className="btn btn-primary" onClick={next}>できた！ つぎへ</button></footer></div>;
}
