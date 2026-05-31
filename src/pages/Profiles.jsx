import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressStore } from '../store/progressStore'
import './Progress.css'

export default function Profiles() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState(() => ProgressStore.getProfiles())
  const [adding, setAdding] = useState(profiles.length === 0)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(ProgressStore.icons[0])

  function select(id) {
    ProgressStore.select(id)
    navigate('/kids')
  }

  function create(event) {
    event.preventDefault()
    if (!name.trim()) return
    ProgressStore.create(name, icon)
    setProfiles(ProgressStore.getProfiles())
    navigate('/kids')
  }

  return (
    <main className="profile-page">
      <button className="profile-back" onClick={() => navigate('/')}>← もどる</button>
      <section className="profile-panel">
        <p className="profile-kicker">🌈 ぼうけんの じゅんび</p>
        <h1>だれが あそぶ？</h1>
        <div className="profile-list">
          {profiles.map((profile) => (
            <button className="profile-card" key={profile.id} onClick={() => select(profile.id)}>
              <span>{profile.icon}</span>
              <strong>{profile.name}</strong>
              <small>👣 {profile.footprints}こ</small>
            </button>
          ))}
          {!adding && <button className="profile-card profile-add" onClick={() => setAdding(true)}><span>＋</span><strong>あたらしく つくる</strong></button>}
        </div>
        {adding && (
          <form className="profile-form" onSubmit={create}>
            <h2>なまえを おしえてね</h2>
            <div className="profile-icons">{ProgressStore.icons.map((value) => <button type="button" className={icon === value ? 'selected' : ''} key={value} onClick={() => setIcon(value)}>{value}</button>)}</div>
            <input value={name} maxLength={10} onChange={(event) => setName(event.target.value)} placeholder="なまえ" autoFocus />
            <div className="profile-form-buttons">
              {profiles.length > 0 && <button type="button" onClick={() => setAdding(false)}>やめる</button>}
              <button className="primary" type="submit" disabled={!name.trim()}>これで あそぶ</button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}
