import { Settings } from './settings.js'

const STORAGE_KEY = 'kazu_profiles'
const ACTIVE_KEY = 'kazu_active_profile'

export const ACTIVITY_IDS = {
  feed_animal: 'S1_tap_move', count_mark: 'S1_count_mark', arrange_same: 'S1_arrange', which_more: 'S1_which_more',
  count_up_island_interactive: 'S2_together', fill_blank_train: 'S2_fill_blank', count_up_island_voice: 'S2_self', arrange_cards: 'S2_arrange_cards',
  fill_blank_5: 'S3_fill_blank_5', fill_blank_10: 'S3_fill_blank_10', continue_5: 'S3_continue_5', continue: 'S3_continue', reverse_5: 'S3_reverse_5', reverse: 'S3_reverse', before_after_5: 'S3_before_after_5', before_after: 'S3_before_after', multi_blank: 'S3_multi_blank',
  snack_number_match_5: 'S4_match_5', snack_number_match: 'S4_match', flash_card_read: 'S4_flash', number_to_quantity_5: 'S4_how_many_5', number_to_quantity: 'S4_how_many', sort_number_cards: 'S4_sort',
  same_count_on_pans: 'S5_split', join_apples: 'S5_join', missing_apples: 'S5_missing_part', number_bonds: 'S5_number_bonds',
  condition_hunt_5: 'S6_hunt_5', condition_hunt: 'S6_hunt', compare_5: 'S6_compare_5', compare: 'S6_compare', numberline_5: 'S6_numberline_5', numberline: 'S6_numberline', sort: 'S6_sort', between_5: 'S6_between_5', between: 'S6_between',
}

const ONE_LOG_CLEAR = new Set(['S2_together', 'S2_self', 'S3_reverse_5', 'S3_reverse', 'S3_multi_blank'])
const ICONS = ['🌸', '🚀', '🍎', '⭐', '🌈', '🍬']
export const STAGE_DECORATIONS = [
  null,
  { icon: '🌳', name: 'りんごの き', text: 'くらべっこの おかを クリアしたね' },
  { icon: '⛵', name: 'うみの はた', text: 'かぞえる うみを クリアしたね' },
  { icon: '🚀', name: 'ロケットの とう', text: 'そらの しれんを クリアしたね' },
  { icon: '🍬', name: 'おかしの もん', text: 'おかしの まちを クリアしたね' },
  { icon: '⚖️', name: 'きんいろの てんびん', text: 'かじゅえんを クリアしたね' },
  { icon: '👑', name: 'おうさまの おうかん', text: 'おしろの しれんを クリアしたね' },
]
export const FOOTPRINT_DECORATIONS = [
  { at: 10, icon: '🌷', name: 'おはなの かだん' },
  { at: 30, icon: '🌈', name: 'にじ' },
  { at: 50, icon: '✨', name: 'きらきらの ほし' },
]
export const ACTIVITY_FLOW = {
  S1_tap_move: '/kids/s1', S1_count_mark: '/kids/s1/count', S1_arrange: '/kids/s1/arrange', S1_which_more: '/kids/s1/which',
  S2_together: '/kids/s2', S2_fill_blank: '/kids/s2/fill', S2_self: '/kids/s2/self', S2_arrange_cards: '/kids/s2/arrange',
  S3_fill_blank_5: '/kids/s3/fill-5', S3_fill_blank_10: '/kids/s3/fill-10', S3_continue_5: '/kids/s3/continue-5', S3_continue: '/kids/s3/continue', S3_reverse_5: '/kids/s3/reverse-5', S3_reverse: '/kids/s3/reverse', S3_before_after_5: '/kids/s3/before-after-5', S3_before_after: '/kids/s3/before-after', S3_multi_blank: '/kids/s3/multi-blank',
  S4_match_5: '/kids/s4/match-5', S4_match: '/kids/s4/match', S4_flash: '/kids/s4/flash', S4_how_many_5: '/kids/s4/how-many-5', S4_how_many: '/kids/s4/how-many', S4_sort: '/kids/s4/sort',
  S5_split: '/kids/s5/split', S5_join: '/kids/s5/join', S5_missing_part: '/kids/s5/missing', S5_number_bonds: '/kids/s5/bonds',
  S6_hunt_5: '/kids/s6/hunt-5', S6_hunt: '/kids/s6/hunt', S6_compare_5: '/kids/s6/compare-5', S6_compare: '/kids/s6/compare', S6_numberline_5: '/kids/s6/numberline-5', S6_numberline: '/kids/s6/numberline', S6_between_5: '/kids/s6/between-5', S6_between: '/kids/s6/between',
}
const ACTIVITY_ORDER = Object.keys(ACTIVITY_FLOW)
const NEXT_ACTIVITY_ORDER = ACTIVITY_ORDER

function loadProfiles() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(parsed)) return []
    return parsed.filter((profile) => profile && typeof profile === 'object' && profile.id).map((profile) => ({
      ...profile,
      name: typeof profile.name === 'string' && profile.name ? profile.name : 'ななし',
      icon: typeof profile.icon === 'string' && profile.icon ? profile.icon : ICONS[0],
      footprints: Number.isFinite(profile.footprints) ? profile.footprints : 0,
      activities: profile.activities && typeof profile.activities === 'object' ? profile.activities : {},
      results: profile.results && typeof profile.results === 'object' ? profile.results : {},
      awardedDecorations: Array.isArray(profile.awardedDecorations) ? profile.awardedDecorations : [],
      pendingDecorations: Array.isArray(profile.pendingDecorations) ? profile.pendingDecorations : [],
    }))
  } catch { return [] }
}
function saveProfiles(profiles) { localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles)) }
function makeProfile(name, icon) {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, icon, footprints: 0, activities: {}, results: {}, awardedDecorations: [], pendingDecorations: [], lastPlayedAt: new Date().toISOString() }
}
function updateActive(mutator) {
  const id = localStorage.getItem(ACTIVE_KEY)
  if (!id) return null
  const profiles = loadProfiles()
  const index = profiles.findIndex((profile) => profile.id === id)
  if (index < 0) return null
  try {
    profiles[index] = mutator({ ...profiles[index], activities: { ...profiles[index].activities }, results: { ...profiles[index].results }, awardedDecorations: [...(profiles[index].awardedDecorations || [])], pendingDecorations: [...(profiles[index].pendingDecorations || [])] })
    saveProfiles(profiles)
    return profiles[index]
  } catch (error) {
    console.error('Failed to update progress', error)
    return null
  }
}

export const ProgressStore = {
  icons: ICONS,
  getProfiles: loadProfiles,
  getActiveId: () => localStorage.getItem(ACTIVE_KEY),
  getActive() {
    const id = ProgressStore.getActiveId()
    return loadProfiles().find((profile) => profile.id === id) || null
  },
  create(name, icon = ICONS[0]) {
    const profile = makeProfile(name.trim() || 'ななし', icon)
    const profiles = [...loadProfiles(), profile]
    saveProfiles(profiles)
    localStorage.setItem(ACTIVE_KEY, profile.id)
    return profile
  },
  select(id) { localStorage.setItem(ACTIVE_KEY, id) },
  recordLog(logEntry) {
    const activityId = ACTIVITY_IDS[logEntry.activity]
    if (!activityId) return null
    return updateActive((profile) => {
      const stored = profile.activities[activityId]
      const current = {
        progress: Number.isFinite(stored?.progress) ? stored.progress : 0,
        clears: Number.isFinite(stored?.clears) ? stored.clears : 0,
        stars: Number.isFinite(stored?.stars) ? stored.stars : 0,
      }
      const needed = ONE_LOG_CLEAR.has(activityId) ? 1 : Settings.get().questionsPerRound
      const progress = current.progress + 1
      const didClear = progress >= needed
      const clears = current.clears + (didClear ? 1 : 0)
      const beforeFootprints = profile.footprints
      const gainedFootprints = 1 + (didClear && current.clears === 0 ? 2 : 0)
      profile.activities[activityId] = {
        progress: didClear ? 0 : progress,
        clears,
        stars: Math.min(3, Math.max(current.stars, clears)),
        lastPlayedAt: new Date().toISOString(),
      }
      profile.footprints += gainedFootprints
      FOOTPRINT_DECORATIONS.forEach((decoration) => {
        if (beforeFootprints < decoration.at && profile.footprints >= decoration.at) profile.pendingDecorations.push(decoration)
      })
      if (didClear) {
        const stageId = Number(activityId[1])
        const stageActivityIds = ACTIVITY_ORDER.filter((id) => Number(id[1]) === stageId)
        const stageCleared = stageActivityIds.every((id) => (id === activityId ? Math.min(3, Math.max(current.stars, clears)) : profile.activities[id]?.stars || 0) >= 1)
        const stageDecoration = STAGE_DECORATIONS[stageId]
        if (stageCleared && !profile.awardedDecorations.includes(stageDecoration.name)) {
          profile.awardedDecorations.push(stageDecoration.name)
          profile.pendingDecorations.push(stageDecoration)
        }
        profile.results[activityId] = {
          footprints: needed + (current.clears === 0 ? 2 : 0),
          stars: Math.min(3, Math.max(current.stars, clears)),
          decorations: profile.pendingDecorations,
        }
        profile.pendingDecorations = []
      }
      profile.lastPlayedAt = new Date().toISOString()
      return profile
    })
  },
  getActivity(activityId) { return ProgressStore.getActive()?.activities?.[activityId] || { progress: 0, clears: 0, stars: 0 } },
  getResult(activityId) { return ProgressStore.getActive()?.results?.[activityId] || null },
  markTreasureCompleted() {
    return updateActive((profile) => {
      if (!profile.treasureCompletedAt) profile.treasureCompletedAt = new Date().toISOString()
      return profile
    })
  },
  getNextActivity(activityId) {
    const index = NEXT_ACTIVITY_ORDER.indexOf(activityId)
    const nextId = NEXT_ACTIVITY_ORDER[index + 1]
    return nextId && nextId[1] === activityId[1] ? { id: nextId, path: ACTIVITY_FLOW[nextId] } : null
  },
  getStageStatus(stage) {
    const activities = [...stage.activities.basic, ...stage.activities.advanced]
    const records = activities.map((activity) => ProgressStore.getActivity(activity.id))
    const stars = records.map((record) => record.stars)
    return {
      cleared: stars.every((value) => value >= 1),
      perfect: stars.every((value) => value >= 3),
      started: records.some((record) => record.stars > 0 || record.progress > 0),
      stars,
    }
  },
}
