import { useNavigate } from 'react-router-dom'
import './ActivityS6.css'
import CompletionActions from './CompletionActions'

export function CastleLayout({ title, instruction, children, footer }) {
  const navigate = useNavigate()

  return (
    <main className="castle-page">
      <div className="castle-sky">
        <span>✨</span>
        <span>⭐</span>
        <span>✨</span>
      </div>
      <header className="castle-header">
        <button className="castle-back" onClick={() => navigate('/kids/stage/6')}>← もどる</button>
        <div>
          <p className="castle-eyebrow">🏰 おしろの しれん</p>
          <h1>{title}</h1>
        </div>
        <span className="castle-crown">👑</span>
      </header>
      <section className="castle-board">
        <p className="castle-instruction">{instruction}</p>
        {children}
      </section>
      {footer}
    </main>
  )
}

export function CastleFeedback({ state, correctText }) {
  if (state === 'correct') return <p className="castle-feedback correct">⭐ {correctText} ⭐</p>
  if (state === 'wrong') return <p className="castle-feedback wrong">おしい！ もういちど かんがえよう</p>
  return <p className="castle-feedback">&nbsp;</p>
}

export function CastleFooter({ complete, onNext, activityId }) {
  return (
    <footer className="castle-footer">
      {complete
        ? <CompletionActions activityId={activityId} onRestart={() => window.location.reload()} stagePath="/kids" />
        : <button className="castle-next" onClick={onNext}>つぎの もんだい ➜</button>}
    </footer>
  )
}
