import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressStore, FOOTPRINT_DECORATIONS, STAGE_DECORATIONS } from '../store/progressStore'
import { STAGES } from '../store/stageData'
import { speak } from '../utils/speak'
import './Progress.css'

export default function CastleCollection() {
  const navigate = useNavigate()
  const profile = ProgressStore.getActive()
  if (!profile) return <main className="collection-page"><button className="collection-back" onClick={() => navigate('/profiles')}>プロフィールを えらぶ</button></main>

  return <CastleContent navigate={navigate} profile={profile} />
}

function CastleContent({ navigate, profile }) {
  const stageDecorations = STAGES.flatMap((stage) => ProgressStore.getStageStatus(stage).cleared ? [STAGE_DECORATIONS[stage.id]] : [])
  const footprintDecorations = FOOTPRINT_DECORATIONS.filter((decoration) => profile.footprints >= decoration.at)
  const decorations = [...stageDecorations, ...footprintDecorations]
  const stageTreasure = STAGES.map((stage) => {
    const status = ProgressStore.getStageStatus(stage)
    const decoration = STAGE_DECORATIONS[stage.id]
    const clearedActivities = status.stars.filter((stars) => stars >= 1).length
    const activityCount = [...stage.activities.basic, ...stage.activities.advanced].length
    return { ...decoration, earned: status.cleared, condition: status.cleared ? 'ゲットしたよ！' : `ステージ${stage.id}の ゲームを あと ${activityCount - clearedActivities}こ クリア` }
  })
  const footprintTreasure = FOOTPRINT_DECORATIONS.map((decoration) => ({
    ...decoration,
    earned: profile.footprints >= decoration.at,
    condition: profile.footprints >= decoration.at ? 'ゲットしたよ！' : `あしあとを あと ${decoration.at - profile.footprints}こ あつめる`,
  }))
  const allTreasure = [...stageTreasure, ...footprintTreasure]
  const completed = allTreasure.every((treasure) => treasure.earned)

  useEffect(() => {
    if (completed && !profile.treasureCompletedAt) ProgressStore.markTreasureCompleted()
  }, [completed, profile.treasureCompletedAt])

  const completionDate = profile.treasureCompletedAt || profile.lastPlayedAt
  const completedOn = completionDate
    ? new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(completionDate))
    : ''

  return (
    <main className="collection-page">
      <header className="collection-header">
        <button className="collection-back" onClick={() => navigate('/kids')}>← ちずへ もどる</button>
        <div><p>🏰 {profile.name}の</p><h1>ぼうけんの おしろ</h1></div>
        <strong>👣 {profile.footprints}</strong>
      </header>
      <section className="collection-castle">
        <div className="collection-castle-picture">🏰</div>
        {decorations.map((decoration, index) => (
          <button className={`collection-decoration decoration-${index % 8}`} key={decoration.name} onClick={() => speak(`${decoration.name}！ ${decoration.text || `${decoration.at}この あしあとを あつめたね`}`)}>
            {decoration.icon}
          </button>
        ))}
      </section>
      <section className="collection-list">
        <h2>✨ あつめた かざり</h2>
        {decorations.length === 0 ? <p>あそぶと おしろに かざりが ふえるよ</p> : decorations.map((decoration) => <button key={decoration.name} onClick={() => speak(decoration.name)}><span>{decoration.icon}</span>{decoration.name}</button>)}
      </section>
      {completed ? (
        <section className="collection-certificate">
          <div className="collection-certificate-seal">👑</div>
          <p>かずの ぼうけん</p>
          <h2>クリアしょう</h2>
          <strong>{profile.name} さん</strong>
          <p className="collection-certificate-message">
            たくさん かんがえて、くりかえし ちょうせんして、<br />
            すべての おたからを あつめました。<br />
            さいごまで よく がんばりました！
          </p>
          <small>たっせいび {completedOn}</small>
        </section>
      ) : (
        <section className="collection-treasure">
          <h2>🎁 おしろの おたから</h2>
          <p>ゲームを クリアして、おたからを あつめよう！</p>
          <div className="collection-treasure-grid">
            {allTreasure.map((treasure) => <button className={treasure.earned ? 'is-earned' : 'is-locked'} key={treasure.name} onClick={() => speak(`${treasure.name}。${treasure.condition}`)}>
              <span>{treasure.earned ? treasure.icon : '❔'}</span>
              <strong>{treasure.name}</strong>
              <small>{treasure.condition}</small>
            </button>)}
          </div>
        </section>
      )}
    </main>
  )
}
