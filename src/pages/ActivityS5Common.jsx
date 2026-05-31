import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ActivityS5.css';

export function OrchardLayout({ title, onReset, children, footer }) {
  const navigate = useNavigate();
  return <div className="orchard-page"><header className="orchard-header"><button className="btn" onClick={() => navigate('/kids/stage/5')}><ArrowLeft size={20}/><span>もどる</span></button><div className="orchard-title">🍎 {title} 🌳</div><button className="btn" onClick={onReset}><RotateCcw size={19}/></button></header><main className="orchard-main">{children}</main><footer className="orchard-footer">{footer}</footer></div>;
}
