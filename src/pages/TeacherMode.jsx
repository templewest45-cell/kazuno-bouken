import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { LogStore } from '../store/logStore';
import TeacherGuide from './TeacherGuide';
import WorksheetMaker from './WorksheetMaker';

export default function TeacherMode() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState(() => LogStore.getLogs().reverse());
  const [tab, setTab] = useState('worksheets');

  const handleClear = () => {
    if (window.confirm('すべての記録を消去しますか？')) {
      LogStore.clearLogs();
      setLogs([]);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="header">
        <button className="btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
          もどる
        </button>
        <h2 className="title" style={{ fontSize: '28px' }}>せんせいモード</h2>
        <button className="btn" onClick={handleClear} style={{ color: 'red' }}>
          <Trash2 size={24} />
          消去
        </button>
      </div>

      <div className="teacher-tabs" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className={`btn${tab === 'records' ? ' btn-primary' : ''}`} onClick={() => setTab('records')}>📊 学習記録</button>
        <button className={`btn${tab === 'worksheets' ? ' btn-primary' : ''}`} onClick={() => setTab('worksheets')}>🖨️ プリントメーカー</button>
        <button className={`btn${tab === 'guide' ? ' btn-primary' : ''}`} onClick={() => setTab('guide')}>📘 教材について</button>
      </div>

      {tab === 'guide' ? <TeacherGuide /> : tab === 'worksheets' ? <WorksheetMaker /> : <div className="glass-panel" style={{ flex: 1, margin: '20px', overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777', marginTop: '40px' }}>記録がありません</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>日時</th>
                <th style={{ padding: '12px' }}>ステージ</th>
                <th style={{ padding: '12px' }}>活動内容</th>
                <th style={{ padding: '12px' }}>結果/詳細</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(log.timestamp).toLocaleString('ja-JP')}</td>
                  <td style={{ padding: '12px' }}>{log.stage}</td>
                  <td style={{ padding: '12px' }}>{log.activity}</td>
                  <td style={{ padding: '12px' }}>
                    <pre style={{ margin: 0, fontSize: '14px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                      {JSON.stringify(log.details || log, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>}
    </div>
  );
}
