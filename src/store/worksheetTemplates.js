const ICONS = ['🍎', '🍬', '⭐', '🐠']
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const shuffle = (items) => [...items].sort(() => Math.random() - .5)
const icon = () => ICONS[randomInt(0, ICONS.length - 1)]
const choices = (answer, min, max) => {
  const values = new Set([answer])
  while (values.size < 3) values.add(randomInt(min, max))
  return shuffle([...values])
}

export const WORKSHEET_TEMPLATES = [
  { id: 'count', stage: 1, title: 'いくつ あるかな？', instruction: 'かぞえて、ただしい かずに ○を つけよう', make(max) { const answer = randomInt(1, max), item = icon(); return { kind: 'objects-choice', item, answer, options: choices(answer, 1, max) } } },
  { id: 'same-count', stage: 1, title: 'おなじ かずは どれ？', instruction: 'みほんと おなじ かずに ○を つけよう', make(max) { const answer = randomInt(1, max), item = icon(); return { kind: 'group-choice', item, answer, options: choices(answer, 1, max) } } },
  { id: 'more', stage: 1, title: 'どっちが おおい？', instruction: 'おおい ほうに ○を つけよう', make(max) { const left = randomInt(1, max - 1), right = randomInt(left + 1, max); return { kind: 'more', item: '🍎', left, right, answer: right } } },
  { id: 'sequence', stage: 2, max: 5, title: '5までの あなあき すうれつ', instruction: '□に はいる かずを かこう', unique(max) { const length = Math.min(5, max); const problems = []; for (let start = 1; start <= Math.max(1, max - length + 1); start++) for (let blank = 0; blank < length; blank++) { const values = Array.from({ length }, (_, index) => start + index); const answer = values[blank]; values[blank] = null; problems.push({ kind: 'sequence', values, answer, blank }) } return shuffle(problems) } },
  { id: 'sequence-10', stage: 3, max: 10, title: '10までの あなあき すうれつ', instruction: '□に はいる かずを かこう', unique(max) { const length = Math.min(5, max); const problems = []; for (let start = 1; start <= Math.max(1, max - length + 1); start++) for (let blank = 0; blank < length; blank++) { const values = Array.from({ length }, (_, index) => start + index); const answer = values[blank]; values[blank] = null; problems.push({ kind: 'sequence', values, answer, blank }) } return shuffle(problems) } },
  { id: 'before-after', stage: 3, title: 'まえと あとの かず', instruction: '□に はいる かずを かこう', unique(max) { return shuffle(Array.from({ length: Math.max(1, max - 2) }, (_, index) => index + 2)).map((middle) => ({ kind: 'sequence', values: [null, middle, null], answer: `${middle - 1}, ${middle + 1}` })) } },
  { id: 'number-quantity', stage: 4, title: 'この すうじは いくつ？', instruction: 'おなじ かずの おさらに ○を つけよう', make(max) { const answer = randomInt(1, max), item = icon(); return { kind: 'number-groups', item, number: answer, answer, options: choices(answer, 1, max) } } },
  { id: 'join', stage: 5, title: 'あわせると いくつ？', instruction: '□に はいる かずを かこう', make(max) { const left = randomInt(1, Math.max(1, max - 1)), right = randomInt(1, Math.max(1, max - left)); return { kind: 'join', item: '🍎', left, right, answer: left + right } } },
  { id: 'missing', stage: 5, title: 'あと いくつ？', instruction: '□に はいる かずを かこう', make(max) { const total = randomInt(3, max), have = randomInt(1, total - 1); return { kind: 'missing', item: '🍎', total, have, answer: total - have } } },
  { id: 'compare', stage: 6, title: 'おおきい かずは どっち？', instruction: 'おおきい かずに ○を つけよう', make(max) { const left = randomInt(1, max - 1), right = randomInt(left + 1, max); return { kind: 'number-choice', options: shuffle([left, right]), answer: right } } },
  { id: 'numberline', stage: 6, title: 'かずの みち', instruction: 'ただしい カードから、□へ せんを ひこう', unique(max) { return shuffle(Array.from({ length: max }, (_, index) => { const answer = index + 1; return { kind: 'numberline', max, answer, options: choices(answer, 1, max) } })) } },
  { id: 'between', stage: 6, title: 'あいだの かずは？', instruction: '□に はいる かずを かこう', make(max) { const low = randomInt(1, Math.max(1, max - 2)); return { kind: 'between', low, high: low + 2, answer: low + 1 } } },
]

export function makeWorksheet(templateIds, count, max, hints = true) {
  const selectedIds = Array.isArray(templateIds) && templateIds.length ? templateIds : ['count']
  const templates = selectedIds.map((id) => WORKSHEET_TEMPLATES.find((template) => template.id === id)).filter(Boolean)
  const sections = templates.map((template) => ({
    template,
    questions: (template.unique ? template.unique(template.max || max).slice(0, count) : Array.from({ length: count }, () => template.make(template.max || max))).map((question) => ({ ...question, templateId: template.id, hints })),
  }))
  return { templates, sections }
}
