import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <div className="header" style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
        <button className="btn" onClick={() => navigate('/kids')}>
          <ArrowLeft size={24} />
          もどる
        </button>
      </div>

      <div className="glass-panel animate-pop-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '60px', maxWidth: '500px' }}>
        <Clock size={64} color="#FF9800" />
        <h2 style={{ fontSize: '32px' }}>じゅんびちゅう</h2>
        <p style={{ fontSize: '20px', color: '#666', textAlign: 'center' }}>
          このステージは まだ あそべません。<br />
          つぎの アップデートを まっててね！
        </p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/kids')}>
          もどる
        </button>
      </div>
    </div>
  );
}
