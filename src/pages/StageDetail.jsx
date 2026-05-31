import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getStageById } from '../store/stageData';
import { ProgressStore } from '../store/progressStore';
import './StageDetail.css';

const STAGE_THEMES = {
  1: { world: 'forest', symbol: '🌳', course: 'もりの あそびば', scenery: ['🌳', '🍄', '🦋', '🌲', '🍎'] },
  2: { world: 'sea', symbol: '🐳', course: 'うみの あそびば', scenery: ['🐠', '🫧', '🐚', '🪸', '🐬'] },
  3: { world: 'sky', symbol: '☁️', course: 'そらの あそびば', scenery: ['☁️', '⭐', '🚀', '🌈', '🪁'] },
  4: { world: 'candy', symbol: '🃏', course: 'おかしの まち', scenery: ['🍭', '🍬', '🃏', '⭐', '🍩'] },
  5: { world: 'garden', symbol: '🍎', course: 'みのりの はたけ', scenery: ['🍎', '🧺', '🌼', '🍇', '🐿️'] },
  6: { world: 'castle', symbol: '⚖️', course: 'かずの おしろ', scenery: ['🏰', '⚖️', '⭐', '👑', '🚩'] },
};

const ACTIVITY_PREVIEWS = {
  S1_tap_move: ['🍎', '➡️', '🧺'],
  S1_count_mark: ['🍓', '⭐', '2️⃣'],
  S1_arrange: ['🍪', '⭐', '🌙'],
  S1_which_more: ['🐱', '🍎', '🐻'],
  S2_together: ['🐠', '1️⃣', '2️⃣'],
  S2_fill_blank: ['⛵', '❓', '4️⃣'],
  S2_self: ['🎤', '🐬', '🫧'],
  S2_arrange_cards: ['3️⃣', '1️⃣', '2️⃣'],
  S3_continue: ['🚀', '4️⃣', '❓'],
  S3_fill_blank_10: ['6️⃣', '❓', '🔟'],
  S3_reverse: ['🔟', '🚀', '1️⃣'],
  S3_before_after: ['⭐', '5️⃣', '❓'],
  S3_multi_blank: ['2️⃣', '❓', '4️⃣'],
  S4_match: ['5️⃣', '➡️', '🍩'],
  S4_flash: ['🃏', '⭐', '7️⃣'],
  S4_how_many: ['4️⃣', '➡️', '🍬'],
  S4_sort: ['3️⃣', '1️⃣', '2️⃣'],
  S5_split: ['📦', '⚖️', '🍎'],
  S5_join: ['🧺', '➕', '🧺'],
  S5_missing_part: ['🍎', '❓', '5️⃣'],
  S5_number_bonds: ['2️⃣', '➕', '3️⃣'],
  S6_compare: ['3️⃣', '⚖️', '5️⃣'],
  S6_hunt: ['🔎', '5️⃣', '🔟'],
  S6_numberline: ['1️⃣', '➡️', '🔟'],
  S6_sort: ['3️⃣', '1️⃣', '2️⃣'],
  S6_between: ['5️⃣', '❓', '8️⃣'],
};

function ActivityCard({ activity }) {
  const navigate = useNavigate();
  const preview = ACTIVITY_PREVIEWS[activity.id] || ['⭐', '❓', '⭐'];
  const stars = ProgressStore.getActivity(activity.id).stars;

  return (
    <button className={`stage-menu-card${activity.implemented ? '' : ' is-coming'}`} onClick={() => navigate(activity.path)}>
      <span className="stage-menu-cookie">{activity.implemented ? 'アプリ◎' : '準備中'}</span>
      <span className="stage-menu-stars" aria-label={`${stars}つぼし`}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</span>
      <span className="stage-menu-preview" aria-hidden="true">
        {preview.map((icon, index) => <span key={`${icon}-${index}`}>{icon}</span>)}
      </span>
      <span className="stage-menu-card-copy">
        <strong>{activity.title}</strong>
        <small>{activity.desc}</small>
      </span>
    </button>
  );
}

export default function StageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const stage = getStageById(id);

  if (!stage) {
    return <div className="stage-menu-missing"><p>ステージが みつかりません</p><button className="btn" onClick={() => navigate('/kids')}>もどる</button></div>;
  }

  const theme = STAGE_THEMES[stage.id];

  return (
    <div className={`stage-menu-page stage-menu-${theme.world}`}>
      <div className="stage-menu-scenery" aria-hidden="true">
        {theme.scenery.map((icon, index) => <span key={`${icon}-${index}`} className={`scenery-${index + 1}`}>{icon}</span>)}
      </div>

      <header className="stage-menu-header">
        <button className="btn" onClick={() => navigate('/kids')}><ArrowLeft size={22} /> もどる</button>
        <h1><span>{theme.symbol}</span> {stage.id}. {stage.title} <span>{theme.symbol}</span></h1>
        <span className="stage-menu-header-spacer" />
      </header>

      <main className="stage-menu-main">
        <div className="stage-menu-course">{theme.course}</div>
        <section className="stage-menu-section">
          <h2 className="stage-menu-ribbon">⭐ すきな あそびを えらぼう ⭐</h2>
          <div className="stage-menu-grid">
            {[...stage.activities.basic, ...stage.activities.advanced].map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
