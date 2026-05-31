import { useEffect, useState } from 'react'
import { Download, ExternalLink, Printer, RefreshCcw, Share2 } from 'lucide-react'
import { makeWorksheet, WORKSHEET_TEMPLATES } from '../store/worksheetTemplates'
import './WorksheetMaker.css'

const repeat = (item, count) => <span className="print-items">{Array.from({ length: count }, (_, index) => <span className="print-item" key={index}>{item}</span>)}</span>
const option = (children, key) => <span className="print-option-card" key={key}>{children}</span>
const answerBox = (key) => <span className="print-answer-box" key={key} aria-label="こたえを かく らん" />
const numberlinePosition = (answer, max) => {
  const width = max === 5 ? 62 : 100
  const offset = (100 - width) / 2
  return offset + (answer - .5) * (width / max)
}
function Question({ question, index }) {
  const q = question
  return <article className="print-question"><div className="print-question-heading"><b>{index + 1}.</b></div>
    {q.kind === 'objects-choice' && <><div>{repeat(q.item, q.answer)}</div><div className="print-options">{q.options.map((n) => option(n, n))}</div></>}
    {q.kind === 'group-choice' && <><div className="print-example">みほん {repeat(q.item, q.answer)}</div><div className="print-groups">{q.options.map((n) => option(repeat(q.item, n), n))}</div></>}
    {q.kind === 'more' && <div className="print-groups two-options">{option(repeat(q.item, q.left), 'left')}{option(repeat(q.item, q.right), 'right')}</div>}
    {q.kind === 'sequence' && <div className={`print-sequence${q.hints ? ' has-hints' : ''}`}>{q.values.map((n, i) => n === null ? answerBox(i) : <span className={q.hints && Math.abs(i - q.values.indexOf(null)) === 1 ? 'is-hint' : ''} key={i}>{n}</span>)}</div>}
    {q.kind === 'number-groups' && <><strong className="print-big-number">{q.number}</strong><div className="print-groups">{q.options.map((n) => option(repeat(q.item, n), n))}</div></>}
    {q.kind === 'join' && <><div className="print-equation"><span className={q.hints ? 'print-hint-group' : ''}>{repeat(q.item, q.left)}</span> ＋ <span className={q.hints ? 'print-hint-group' : ''}>{repeat(q.item, q.right)}</span> ＝ {answerBox('join')}</div>{q.hints && <small className="print-hint-note">りんごを ぜんぶ かぞえよう</small>}</>}
    {q.kind === 'missing' && <>{q.hints && <div className="print-target-group"><small>ぜんぶで</small>{repeat(q.item, q.total)}</div>}<div className="print-equation"><span className={q.hints ? 'print-hint-group' : ''}>{repeat(q.item, q.have)}</span> ＋ {answerBox('missing')} ＝ {q.total}</div></>}
    {q.kind === 'number-choice' && <div className="print-options two-options">{q.options.map((n) => option(<span className="print-number-option"><strong>{n}</strong>{q.hints && repeat('🍎', n)}</span>, n))}</div>}
    {q.kind === 'numberline' && <div className={`print-numberline-problem slots-${q.max}`}>
      <div className="print-numberline-cards">{q.options.map((number) => <strong className={`print-number-card${number === q.answer ? ' is-answer' : ''}`} key={number}>{number}</strong>)}</div>
      {q.hints ? <svg className="print-numberline-hint" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true"><line x1={(q.options.indexOf(q.answer) + .5) * (100 / q.options.length)} y1="0" x2={numberlinePosition(q.answer, q.max)} y2="34" /></svg> : <div className="print-numberline-space" />}
      <div className="print-numberline">{Array.from({ length: q.max }, (_, i) => <span className={i + 1 === q.answer ? 'is-blank' : ''} key={i}>{i + 1 === q.answer ? '' : i + 1}</span>)}</div>
    </div>}
    {q.kind === 'between' && <><div className="print-between"><span>{q.low} より おおきい</span>{answerBox('between')}<span>{q.high} より ちいさい</span></div>{q.hints && <div className="print-between-sequence"><span>{q.low}</span>{answerBox('between-hint')}<span>{q.high}</span></div>}</>}
  </article>
}

function paginateSections(sections) {
  const pages = []
  let page = []
  let used = 0
  sections.forEach((section) => {
    const size = section.questions.length >= 5 ? 2 : 1
    if (used + size > 2) { pages.push(page); page = []; used = 0 }
    page.push(section)
    used += size
  })
  if (page.length) pages.push(page)
  return pages
}

function WorksheetPage({ sections, pageIndex }) {
  return <div className="print-page">
    <header><h1>かずのぼうけん プリント</h1><div className="print-student-fields"><span>なまえ <i /></span></div></header>
    {sections.map(({ template, questions }) => <section className={`print-section section-${questions.length}`} key={`${pageIndex}-${template.id}`}>
      <h2>{template.title}</h2><p>{template.instruction}</p>
      <div className={`print-question-grid questions-${Math.min(8, questions.length)}`}>{questions.map((question, index) => <Question question={question} index={index} key={index} />)}</div>
    </section>)}
  </div>
}

export default function WorksheetMaker() {
  const [templateIds, setTemplateIds] = useState(['count'])
  const [count, setCount] = useState(6)
  const [max, setMax] = useState(5)
  const [hints, setHints] = useState(true)
  const [printAnswers, setPrintAnswers] = useState(false)
  const [exportChoice, setExportChoice] = useState(null)
  const [exportStatus, setExportStatus] = useState('')
  const [exportedImages, setExportedImages] = useState([])
  const [worksheet, setWorksheet] = useState(() => makeWorksheet(['count'], 6, 5, true))
  useEffect(() => () => exportedImages.forEach(({ url }) => URL.revokeObjectURL(url)), [exportedImages])
  const generate = () => setWorksheet(makeWorksheet(templateIds, count, max, hints))
  const toggleTemplate = (id) => {
    const next = templateIds.includes(id) ? templateIds.filter((value) => value !== id) : [...templateIds, id]
    setTemplateIds(next)
    if (next.length) setWorksheet(makeWorksheet(next, count, max, hints))
  }
  const changeCount = (value) => { setCount(value); setWorksheet(makeWorksheet(templateIds, value, max, hints)) }
  const changeMax = (value) => { setMax(value); setWorksheet(makeWorksheet(templateIds, count, value, hints)) }
  const changeHints = (value) => { setHints(value); setWorksheet(makeWorksheet(templateIds, count, max, value)) }
  const printWorksheet = (includeAnswers) => {
    setPrintAnswers(includeAnswers)
    window.setTimeout(() => window.print(), 0)
  }
  const makePageImage = (page, index) => new Promise((resolve) => {
    const clone = page.cloneNode(true)
    clone.style.boxShadow = 'none'
    clone.style.margin = '0'
    clone.style.transform = 'none'
    const width = page.offsetWidth
    const height = page.offsetHeight
    const styles = Array.from(document.styleSheets).map((sheet) => {
      try { return Array.from(sheet.cssRules).filter((rule) => rule.type !== CSSRule.IMPORT_RULE).map((rule) => rule.cssText).join('\n') } catch { return '' }
    }).join('\n')
    const markup = new XMLSerializer().serializeToString(clone)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${styles}</style>${markup}</div></foreignObject></svg>`
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    const resolveSvgFallback = () => {
      const name = `かずのぼうけん-${String(index + 1).padStart(2, '0')}.svg`
      resolve({ name, file: new File([svgBlob], name, { type: svgBlob.type }), url: svgUrl, isFallback: true })
    }
    const image = new Image()
    image.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const context = canvas.getContext('2d')
      if (!context) {
        resolveSvgFallback()
        return
      }
      try {
        context.scale(scale, scale)
        context.drawImage(image, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob) {
            resolveSvgFallback()
            return
          }
          URL.revokeObjectURL(svgUrl)
          const name = `かずのぼうけん-${String(index + 1).padStart(2, '0')}.png`
          const file = new File([blob], name, { type: 'image/png' })
          resolve({ name, file, url: URL.createObjectURL(blob) })
        }, 'image/png')
      } catch {
        resolveSvgFallback()
      }
    }
    image.onerror = () => {
      resolveSvgFallback()
    }
    image.src = svgUrl
  })
  const exportImages = async (includeAnswers) => {
    setExportStatus('画像を作成しています...')
    exportedImages.forEach(({ url }) => URL.revokeObjectURL(url))
    setExportedImages([])
    const pages = document.querySelectorAll(`.worksheet-preview .print-page${includeAnswers ? '' : ':not(.answer-page)'}`)
    try {
      const images = []
      for (const [index, page] of Array.from(pages).entries()) {
        images.push(await makePageImage(page, index))
      }
      setExportedImages(images)
      setExportStatus('')
    } catch {
      setExportStatus('')
      window.alert('がぞうを つくれませんでした。もういちど ためしてください。')
    }
  }
  const saveImage = async ({ file, url, name }) => {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name })
        return
      } catch (error) {
        if (error.name === 'AbortError') return
      }
    }
    const link = document.createElement('a')
    link.download = name
    link.href = url
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }
  const chooseExport = (includeAnswers) => {
    const action = exportChoice
    setExportChoice(null)
    if (action === 'print') printWorksheet(includeAnswers)
    if (action === 'image') exportImages(includeAnswers)
  }
  const pages = paginateSections(worksheet.sections)
  return <div className="worksheet-maker">
    <aside className="worksheet-controls">
      <h2>🖨️ プリントメーカー</h2>
      <fieldset className="worksheet-template-picker"><legend>もんだいの しゅるい</legend>{WORKSHEET_TEMPLATES.map((template) => <label key={template.id}><input type="checkbox" checked={templateIds.includes(template.id)} onChange={() => toggleTemplate(template.id)} /> <span>ステージ{template.stage}</span>{template.title}</label>)}</fieldset>
      <label>かずの はんい<select value={max} onChange={(e) => changeMax(Number(e.target.value))}><option value="5">1〜5</option><option value="10">1〜10</option></select></label>
      <label>1しゅるいの こもんすう<select value={count} onChange={(e) => changeCount(Number(e.target.value))}><option value="2">2もん</option><option value="4">4もん</option><option value="6">6もん</option><option value="8">8もん</option></select></label>
      <fieldset className="worksheet-hint-picker"><legend>ヒント</legend><label><input type="radio" name="hints" checked={hints} onChange={() => changeHints(true)} /> あり</label><label><input type="radio" name="hints" checked={!hints} onChange={() => changeHints(false)} /> なし</label></fieldset>
      <button className="btn btn-secondary" disabled={templateIds.length === 0} onClick={generate}><RefreshCcw size={18} /> プレビューを つくる</button>
      <button className="btn btn-primary" onClick={() => setExportChoice('print')}><Printer size={18} /> いんさつ / PDF</button>
      <button className="btn btn-image" onClick={() => setExportChoice('image')}><Download size={18} /> がぞうで ほぞん</button>
    </aside>
    <section className="worksheet-preview">
      {pages.map((sections, index) => <WorksheetPage sections={sections} pageIndex={index} key={index} />)}
      <div className={`print-page answer-page${printAnswers ? '' : ' print-answer-hidden'}`}>
        <header><h1>こたえ</h1></header>
        {worksheet.sections.map(({ template, questions }) => <section key={template.id}><h2>{template.title}</h2><div className="print-answers">{questions.map((question, index) => <span key={index}>{index + 1}. <strong>{question.answer}</strong></span>)}</div></section>)}
      </div>
    </section>
    {exportChoice && <div className="worksheet-export-overlay" role="dialog" aria-modal="true" aria-labelledby="worksheet-export-title">
      <div className="worksheet-export-dialog">
        <h3 id="worksheet-export-title">こたえも いっしょに しゅつりょくしますか？</h3>
        <p>ほしい しゅつりょくを えらんでください。</p>
        <button className="btn btn-primary" onClick={() => chooseExport(false)}>もんだいだけ</button>
        <button className="btn btn-secondary" onClick={() => chooseExport(true)}>こたえも いっしょ</button>
        <button className="btn" onClick={() => setExportChoice(null)}>やめる</button>
      </div>
    </div>}
    {(exportStatus || exportedImages.length > 0) && <div className="worksheet-export-overlay" role="dialog" aria-modal="true" aria-labelledby="worksheet-image-title">
      <div className="worksheet-export-dialog">
        <h3 id="worksheet-image-title">がぞうで ほぞん</h3>
        {exportStatus ? <p>{exportStatus}</p> : <>
          <p>iPadでは、1まいずつ おして「画像を保存」を えらんでください。</p>
          <div className="worksheet-image-list">
            {exportedImages.map((image, index) => <div className="worksheet-image-item" key={image.name}>
              <img src={image.url} alt={`${index + 1}まいめの プレビュー`} />
              <button className="btn btn-image-save" onClick={() => saveImage(image)}>
                {navigator.share && navigator.canShare?.({ files: [image.file] }) ? <Share2 size={18} /> : <ExternalLink size={18} />}
                {index + 1}まいめを ほぞん
              </button>
              <a href={image.url} target="_blank" rel="noreferrer">ひらいて ほぞん</a>
              {image.isFallback && <small>Safariようの ほぞんがぞうです</small>}
            </div>)}
          </div>
          <button className="btn" onClick={() => {
            exportedImages.forEach(({ url }) => URL.revokeObjectURL(url))
            setExportedImages([])
          }}>とじる</button>
        </>}
      </div>
    </div>}
  </div>
}
