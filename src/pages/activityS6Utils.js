export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

export function makeChoices(answer, min = 1, max = 10, count = 3) {
  const values = new Set([answer])
  while (values.size < count) {
    values.add(randomInt(min, max))
  }
  return shuffle([...values])
}
