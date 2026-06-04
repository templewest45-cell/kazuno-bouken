// 全ステージの活動データ（仕様書に準拠）
export const STAGES = [
  {
    id: 1,
    title: 'ものと かずを あわせよう',
    subtitle: '1対1対応',
    description: '具体物が役立、アプリも補助',
    badge: '具体物と',
    theme: {
      circleBg: '#E8F5E9', circleColor: '#1B5E20',
      badgeBg: '#E0F2F1', badgeColor: '#00695C',
      headerBg: '#F1F8E9'
    },
    activities: {
      basic: [
        {
          id: 'S1_tap_move',
          title: 'タップして動かす',
          desc: '物をドラッグして枠に1つずつ入れる。入れるたびに音が鳴る',
          path: '/kids/s1',
          implemented: true,
        },
        {
          id: 'S1_count_mark',
          title: '数えた数をつける',
          desc: 'タップするたびに〇がつく。数え終えていないものと区別できる',
          path: '/kids/s1/count',
          implemented: true,
        },
      ],
      advanced: [
        {
          id: 'S1_arrange',
          title: '同じ数だけ並べる',
          desc: '見本と同じ数になるよう物をタップして並べる（並置対応）',
          path: '/kids/s1/arrange',
          implemented: true,
        },
        {
          id: 'S1_which_more',
          title: 'どっちが多い？',
          desc: '2匹の動物が食べたりんごを比べてどっちが多いか当てる',
          path: '/kids/s1/which',
          implemented: true,
        },
      ],
    },
    logNote: '記録: 対応が正確に行われたか・スキップ・二重数えの発生回数',
  },
  {
    id: 2,
    title: 'じゅんばんに かぞえよう',
    subtitle: '数唱（順唱）',
    description: '1から5まで順に唱える',
    badge: 'アプリ◎',
    theme: {
      circleBg: '#E3F2FD', circleColor: '#0D47A1',
      badgeBg: '#E3F2FD', badgeColor: '#0D47A1',
      headerBg: '#EBF5FB'
    },
    activities: {
      basic: [
        {
          id: 'S2_together',
          title: '一緒に唱えよう',
          desc: '1から5まで、イラストに合わせて順番に唱えて進もう！',
          path: '/kids/s2',
          implemented: true,
        },
        {
          id: 'S2_fill_blank',
          title: '穴あき数列を埋める',
          desc: '船団のあいている船に、正しい数字を乗せてね！',
          path: '/kids/s2/fill',
          implemented: true,
        },
      ],
      advanced: [
        {
          id: 'S2_self',
          title: '自分で唱える',
          desc: 'マイクで唱えて、音声認識で次へ進む',
          path: '/kids/s2/self',
          implemented: true,
        },
        {
          id: 'S2_arrange_cards',
          title: 'カードを並べる',
          desc: 'バラバラの数字カードを正しい順番に並び替える',
          path: '/kids/s2/arrange',
          implemented: true,
        },
      ],
    },
    logNote: '記録: 詰まった数字・連続正答数・速度の推移',
  },
  {
    id: 3,
    title: 'つぎの かずは なに？',
    subtitle: '数唱（続き唱え・逆唱）',
    description: '途中から・逆から唱える',
    badge: 'アプリ◎',
    theme: {
      circleBg: '#E3F2FD', circleColor: '#0D47A1',
      badgeBg: '#E3F2FD', badgeColor: '#0D47A1',
      headerBg: '#EBF5FB'
    },
    activities: {
      basic: [
        {
          id: 'S3_fill_blank_5',
          title: '5までの穴あき数列',
          desc: '1〜5の数列で、空いている場所に入る数字を選ぶ',
          path: '/kids/s3/fill-5',
          implemented: true,
        },
        {
          id: 'S3_fill_blank_10',
          title: '10までの穴あき数列',
          desc: '1〜10の数列を見て、空いている場所に入る数字を選ぶ',
          path: '/kids/s3/fill-10',
          implemented: true,
        },
        {
          id: 'S3_continue_5',
          title: '5までの つづきの数',
          desc: '1〜5の範囲で「つぎの数」を選ぶ',
          path: '/kids/s3/continue-5',
          implemented: true,
        },
        {
          id: 'S3_continue',
          title: '途中から続けよう',
          desc: '「4のつぎは？」と問い、後に起点をランダムに',
          path: '/kids/s3/continue',
          implemented: true,
        },
        {
          id: 'S3_reverse_5',
          title: '5から逆に数えよう',
          desc: '5から1へ、逆順に数える',
          path: '/kids/s3/reverse-5',
          implemented: true,
        },
        {
          id: 'S3_reverse',
          title: '逆から唱えよう',
          desc: '10から1へ。最初は音声と一緒に、次第に自力で',
          path: '/kids/s3/reverse',
          implemented: true,
        },
      ],
      advanced: [
        {
          id: 'S3_before_after_5',
          title: '5までの前の数・後の数',
          desc: '1〜5の範囲で、前後の数を数字カードから選ぶ',
          path: '/kids/s3/before-after-5',
          implemented: true,
        },
        {
          id: 'S3_before_after',
          title: '前の数・後の数',
          desc: '「6のまえは？」「7のあとは？」を数字カードから選ぶ',
          path: '/kids/s3/before-after',
          implemented: true,
        },
        {
          id: 'S3_multi_blank',
          title: '虫食い（複数箇所）',
          desc: '数列の中の2〜3か所の穴を埋める。逆順も出題',
          path: '/kids/s3/multi-blank',
          implemented: true,
        },
      ],
    },
    logNote: '記録: 起点の正否率・逆唱の最高到達点・詰まりやすい移行位置',
  },
  {
    id: 4,
    title: 'すうじと なかよし',
    subtitle: '数字記号と数量',
    description: '数字カードと具体物を結びつける',
    badge: '数字カード',
    theme: {
      circleBg: '#F3E5F5', circleColor: '#4A148C',
      badgeBg: '#EDE7F6', badgeColor: '#311B92',
      headerBg: '#F5EEF8'
    },
    activities: {
      basic: [
        {
          id: 'S4_match_5',
          title: 'おかしは なんこ？ 5まで',
          desc: '5個までのおかしを数えて、数字カードを空欄へドラッグする',
          path: '/kids/s4/match-5',
          implemented: true,
        },
        {
          id: 'S4_match',
          title: 'おかしは なんこ？',
          desc: 'おかしを数えて、数字カードを空欄へドラッグする',
          path: '/kids/s4/match',
          implemented: true,
        },
        {
          id: 'S4_flash',
          title: 'すうじカードを よもう',
          desc: '数字カードを見て、声に出して読んでみる',
          path: '/kids/s4/flash',
          implemented: true,
        },
      ],
      advanced: [
        {
          id: 'S4_how_many_5',
          title: 'この数字は いくつ？ 5まで',
          desc: '5までの数字カードを見て、同じ数のおかしを選ぶ',
          path: '/kids/s4/how-many-5',
          implemented: true,
        },
        {
          id: 'S4_how_many',
          title: 'この すうじは いくつ？',
          desc: '数字カードを見て、同じ数のおかしを選ぶ',
          path: '/kids/s4/how-many',
          implemented: true,
        },
        {
          id: 'S4_sort',
          title: 'すうじカードを ならべよう',
          desc: 'バラバラの数字カードを小さい順番に並べる',
          path: '/kids/s4/sort',
          implemented: true,
        },
      ],
    },
    logNote: '記録: 数字ごとの誤答率・混同しやすい数字・音読の達成状況',
  },
  {
    id: 5,
    title: 'わけると あわせる',
    subtitle: '数の合成・分解',
    description: '1つの数を分けたり、合わせたりする',
    badge: '数のしくみ',
    theme: {
      circleBg: '#FFF3E0', circleColor: '#E65100',
      badgeBg: '#FFF3E0', badgeColor: '#E65100',
      headerBg: '#FEF9F0'
    },
    activities: {
      basic: [
        {
          id: 'S5_split',
          title: 'おなじ こすうに しよう',
          desc: '左右それぞれの箱から、同じ数のりんごをおさらに載せる',
          path: '/kids/s5/split',
          implemented: true,
        },
        {
          id: 'S5_join',
          title: 'あわせると いくつ？',
          desc: '左右のかごにある果物を合わせて、全部の数を考える',
          path: '/kids/s5/join',
          implemented: true,
        },
      ],
      advanced: [
        {
          id: 'S5_missing_part',
          title: 'あと いくつ？',
          desc: '全部で5個にするには、あと何個必要か考える',
          path: '/kids/s5/missing',
          implemented: true,
        },
        {
          id: 'S5_number_bonds',
          title: 'おなじ かずを つくろう',
          desc: '違う分け方でも、全部の数が同じになる組を探す',
          path: '/kids/s5/bonds',
          implemented: true,
        },
      ],
    },
    logNote: '記録: 合成・分解の正答率・見つけた分け方・苦手な組み合わせ',
  },
  {
    id: 6,
    title: 'おおきい かずは どっち？',
    subtitle: '順序・大小',
    description: '3より5が大きい、前後の数',
    badge: 'アプリ◎',
    theme: {
      circleBg: '#FFF3E0', circleColor: '#E65100',
      badgeBg: '#FFF3E0', badgeColor: '#E65100',
      headerBg: '#FEF9F0'
    },
    activities: {
      basic: [
        {
          id: 'S6_hunt_5',
          title: '5までの条件に合う数',
          desc: '1〜5の範囲で、条件に合う数字を見つける',
          path: '/kids/s6/hunt-5',
          implemented: true,
        },
        {
          id: 'S6_hunt',
          title: 'じょうけんに あう かずを さがそう',
          desc: '「5より大きい数」など、条件に合う数字を見つける',
          path: '/kids/s6/hunt',
          implemented: true,
        },
        {
          id: 'S6_compare_5',
          title: '5までの大きい数はどっち？',
          desc: '1〜5の範囲で、2つの数を比べる',
          path: '/kids/s6/compare-5',
          implemented: true,
        },
        {
          id: 'S6_compare',
          title: '大小比較（2択）',
          desc: '2つの数を見て大きい方・小さい方をタップ',
          path: '/kids/s6/compare',
          implemented: true,
        },
        {
          id: 'S6_numberline_5',
          title: '5までの数の道',
          desc: '1〜5の数直線で、正しい位置に数字カードを置く',
          path: '/kids/s6/numberline-5',
          implemented: true,
        },
        {
          id: 'S6_numberline',
          title: '数直線に置こう',
          desc: '数直線の正しい位置に数字カードをドラッグ',
          path: '/kids/s6/numberline',
          implemented: true,
        },
      ],
      advanced: [
        {
          id: 'S6_between_5',
          title: '5までの間の数',
          desc: '1〜5の範囲で、2つの数の間に入る数を選ぶ',
          path: '/kids/s6/between-5',
          implemented: true,
        },
        {
          id: 'S6_between',
          title: '□に入る数は？',
          desc: '「5より大きくて8より小さい数」を選ぶ',
          path: '/kids/s6/between',
          implemented: true,
        },
      ],
    },
    logNote: '記録: 正答率・迷いやすい組み合わせ・数直線の配置精度',
  },
];

export const getStageById = (id) => STAGES.find(s => s.id === Number(id));
