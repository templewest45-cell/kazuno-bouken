import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ActivityS3.css';
import CompletionActions from './CompletionActions';

export function S3Layout({ title, subtitle, onReset, children, footer }) {
  const navigate = useNavigate();
  return (
    <div className="s3-page">
      <header className="s3-header">
        <button className="btn" onClick={() => navigate('/kids/stage/3')}><ArrowLeft size={20} /> <span>もどる</span></button>
        <div className="s3-title">{title}</div>
        <button className="btn" onClick={onReset} aria-label="さいしょから"><RotateCcw size={19} /></button>
      </header>
      <div className="s3-subtitle">🚀 {subtitle}</div>
      <main className="s3-main">{children}</main>
      <footer className="s3-footer">{footer}</footer>
    </div>
  );
}

export function Complete({ onRestart, activityId }) {
  return <div className="s3-complete"><div style={{ fontSize: '82px' }}>🌟</div><div>ミッション クリア！</div><CompletionActions activityId={activityId} onRestart={onRestart} stagePath="/kids" /></div>;
}
