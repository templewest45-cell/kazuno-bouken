import { STAGES } from '../store/stageData'
import { WORKSHEET_TEMPLATES } from '../store/worksheetTemplates'
import './TeacherGuide.css'

const CURRICULUM_LINK = 'https://www.mext.go.jp/a_menu/shotou/tokubetu/main/1386427.htm'
const ASSESSMENT_LINK = 'https://www.mext.go.jp/content/20200515-mxt_tokubetu01-1386427.pdf'

const STAGE_GUIDE = {
  1: {
    aim: '具体物を1つずつ対応させて数え、同じ数や多少に気付く。',
    curriculum: '1段階「A 数量の基礎」を中心に、具体物への対応や数えることの基礎。',
    worksheetNote: 'タップ・ドラッグ操作そのものはプリントでは扱いません。',
  },
  2: {
    aim: '1から順番に数え、数字の並びを捉える。',
    curriculum: '1段階「A 数量の基礎」を中心に、5までの数唱と数の系列。',
    worksheetNote: '順唱の音声活動、マイク活動、カード並べ替えはプリントでは扱いません。',
  },
  3: {
    aim: '5までの数を10までに広げ、続き、逆順、前後の数を考える。',
    curriculum: '2段階「A 数と計算」。10までの数の系列、順序や位置。',
    worksheetNote: '10までの穴あき数列と前後の数に対応。続き唱え、逆唱、複数穴の数列はプリントでは扱いません。',
  },
  4: {
    aim: '数字記号と具体物の数量を結び付ける。',
    curriculum: '2段階「A 数と計算」。10までの数の数え方や表し方。',
    worksheetNote: '数字と数量の対応に対応。音読、カード並べ替えはプリントでは扱いません。',
  },
  5: {
    aim: '数を合わせたり分けたりし、数の構成を捉える。',
    curriculum: '2段階「A 数と計算」。10までの数の構成。',
    worksheetNote: '合成と不足分に対応。左右を同じ個数にする活動、複数の分け方はプリントでは扱いません。',
  },
  6: {
    aim: '数の大小、順序、位置、間にある数を捉える。',
    curriculum: '2段階「A 数と計算」。10までの数の大小比較、系列、順序や位置。',
    worksheetNote: '大小、数の道、間の数に対応。条件に合う数字探しはプリントでは扱いません。',
  },
}

const stageWorksheets = (stageId) => WORKSHEET_TEMPLATES.filter((template) => template.stage === stageId)
const stageActivities = (stage) => [...stage.activities.basic, ...stage.activities.advanced]

export default function TeacherGuide() {
  return <main className="teacher-guide">
    <section className="teacher-guide-intro">
      <h2>📘 教材について</h2>
      <p>「かずのぼうけん」は、アプリでの操作や音声を使った活動と、紙で取り組むプリントを組み合わせて使う教材です。</p>
      <p>知的障害のある児童に対する特別支援学校小学部算数科の内容を参考に構成しています。学習指導要領への完全準拠や、算数科全体の網羅を示すものではありません。児童の実態に応じて、具体物を使った活動と組み合わせてください。</p>
      <div className="teacher-guide-note">
        <strong>プリントメーカーについて</strong>
        <span>先生モードの「🖨️ プリントメーカー」から使えます。アプリの全活動がプリント化されているわけではありません。対応していない活動は、各面の表に明記しています。</span>
      </div>
    </section>

    <section className="teacher-guide-section">
      <h2>面の構成とプリントの対応</h2>
      <p>各面には、学習内容に応じた数のアプリ活動があります。プリントは、紙で取り組みやすい内容を選んで実装しています。</p>
      <div className="teacher-guide-table-wrap">
        <table className="teacher-guide-table">
          <thead><tr><th>面</th><th>ねらい</th><th>アプリの活動</th><th>実装済みプリント</th><th>プリント未対応の内容</th></tr></thead>
          <tbody>
            {STAGES.map((stage) => {
              const guide = STAGE_GUIDE[stage.id]
              const worksheets = stageWorksheets(stage.id)
              return <tr key={stage.id}>
                <th><b>{stage.id}</b><span>{stage.title}</span></th>
                <td>{guide.aim}</td>
                <td><ul>{stageActivities(stage).map((activity) => <li key={activity.id}>{activity.title}</li>)}</ul></td>
                <td>{worksheets.length ? <ul>{worksheets.map((template) => <li key={template.id}>{template.title}</li>)}</ul> : <span className="is-none">なし</span>}</td>
                <td>{guide.worksheetNote}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </section>

    <section className="teacher-guide-section">
      <h2>学習指導要領との関連</h2>
      <p>面の順番は、具体物への対応から始め、10までの数の系列、表し方、構成、大小や位置へ進む流れです。</p>
      <div className="teacher-guide-table-wrap">
        <table className="teacher-guide-table curriculum-table">
          <thead><tr><th>面</th><th>主な学習内容</th><th>関連する内容</th></tr></thead>
          <tbody>{STAGES.map((stage) => <tr key={stage.id}><th>{stage.id}. {stage.title}</th><td>{STAGE_GUIDE[stage.id].aim}</td><td>{STAGE_GUIDE[stage.id].curriculum}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="teacher-guide-sources">
        参考資料:
        <a href={CURRICULUM_LINK} target="_blank" rel="noreferrer"> 文部科学省「特別支援学校学習指導要領等」</a>
        <a href={ASSESSMENT_LINK} target="_blank" rel="noreferrer"> 「特別支援学校小学部・中学部学習評価参考資料」</a>
      </p>
    </section>
  </main>
}
