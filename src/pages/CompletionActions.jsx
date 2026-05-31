import { useNavigate } from 'react-router-dom'
import { ProgressStore } from '../store/progressStore'
import { speak } from '../utils/speak'

export default function CompletionActions({ onRestart, stagePath, activityId, className = '' }) {
  const navigate = useNavigate()
  const result = activityId ? ProgressStore.getResult(activityId) : null
  const nextActivity = activityId ? ProgressStore.getNextActivity(activityId) : null
  return (
    <section className={`completion-result ${className}`}>
      <div className="completion-result-title">🎉 クリア！</div>
      {result && <div className="completion-result-rewards">
        <strong>👣 あしあとを {result.footprints}こ ゲット！</strong>
        <span>{'⭐'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</span>
      </div>}
      {result?.decorations?.map((decoration) => <button className="completion-decoration" key={decoration.name} onClick={() => speak(`${decoration.name}を ゲットしたよ！`)}>
        <span>{decoration.icon}</span><strong>{decoration.name}を ゲットしたよ！</strong>
      </button>)}
      <div className="completion-actions">
        {nextActivity && <button className="btn btn-secondary" onClick={() => navigate(nextActivity.path)}>➡️ つぎの ゲームへ</button>}
        <button className="btn btn-primary" onClick={() => navigate(stagePath)}>🗺️ ちずへ もどる</button>
        <button className="btn" onClick={onRestart}>↻ もう いっかい！</button>
      </div>
    </section>
  )
}
