import { useNavigate } from 'react-router-dom';
import { Settings, Play } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <h1 className="title" style={{ fontSize: '48px', marginBottom: '60px' }}>かずのぼうけん</h1>
      
      <div style={{ display: 'flex', gap: '40px', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
        <button 
          className="btn btn-primary animate-pop-in" 
          style={{ padding: '24px', fontSize: '28px', borderRadius: '24px' }}
          onClick={() => navigate('/profiles')}
        >
          <Play size={32} />
          こどもモード
        </button>

        <button 
          className="btn" 
          style={{ padding: '16px', color: '#777' }}
          onClick={() => navigate('/teacher')}
        >
          <Settings size={24} />
          せんせいモード
        </button>
        <p style={{ marginTop: '-28px', color: '#777', fontSize: '14px', textAlign: 'center', lineHeight: 1.6 }}>学習記録・プリントメーカー・教材解説</p>
      </div>
    </div>
  );
}
