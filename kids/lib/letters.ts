export interface LetterWord {
  word: string
  emoji: string
}

export interface ArabicLetter {
  id: string
  /** الحرف منفرداً */
  char: string
  name: string
  /** أشكال الحرف: أول الكلمة، وسطها، آخرها */
  forms: { initial: string; medial: string; final: string }
  /** هل يتصل بما بعده؟ (أ د ذ ر ز و لا تتصل) */
  connects: boolean
  words: LetterWord[]
  color: string
  /** الحرف بالحركات الثلاث */
  harakat: { fatha: string; damma: string; kasra: string }
  /** مسار تقريبي لرسم الحرف داخل مربع 200×200 (نقاط x,y) لإرشاد الكتابة */
  strokes: number[][][]
}

const H = (c: string) => ({ fatha: c + 'َ', damma: c + 'ُ', kasra: c + 'ِ' })

export const arabicLetters: ArabicLetter[] = [
  { id: 'alif', char: 'ا', name: 'ألف', connects: false, color: 'from-red-400 to-rose-600',
    forms: { initial: 'ا', medial: 'ـا', final: 'ـا' }, harakat: { fatha: 'أَ', damma: 'أُ', kasra: 'إِ' },
    words: [{ word: 'أَرْنَب', emoji: '🐰' }, { word: 'أَسَد', emoji: '🦁' }, { word: 'أَنَانَاس', emoji: '🍍' }],
    strokes: [[[100, 30], [100, 170]]] },
  { id: 'baa', char: 'ب', name: 'باء', connects: true, color: 'from-blue-400 to-cyan-600',
    forms: { initial: 'بـ', medial: 'ـبـ', final: 'ـب' }, harakat: H('ب'),
    words: [{ word: 'بَطَّة', emoji: '🦆' }, { word: 'بَيْت', emoji: '🏠' }, { word: 'بُرْتُقَال', emoji: '🍊' }],
    strokes: [[[170, 90], [175, 120], [160, 140], [100, 145], [40, 140], [25, 120], [30, 95]], [[100, 175], [100, 175]]] },
  { id: 'taa', char: 'ت', name: 'تاء', connects: true, color: 'from-green-400 to-emerald-600',
    forms: { initial: 'تـ', medial: 'ـتـ', final: 'ـت' }, harakat: H('ت'),
    words: [{ word: 'تُفَّاح', emoji: '🍎' }, { word: 'تَاج', emoji: '👑' }, { word: 'تِمْسَاح', emoji: '🐊' }],
    strokes: [[[170, 100], [175, 130], [160, 150], [100, 155], [40, 150], [25, 130], [30, 105]], [[85, 65], [85, 65]], [[115, 65], [115, 65]]] },
  { id: 'thaa', char: 'ث', name: 'ثاء', connects: true, color: 'from-yellow-400 to-amber-600',
    forms: { initial: 'ثـ', medial: 'ـثـ', final: 'ـث' }, harakat: H('ث'),
    words: [{ word: 'ثَعْلَب', emoji: '🦊' }, { word: 'ثَلْج', emoji: '❄️' }, { word: 'ثَوْب', emoji: '👕' }],
    strokes: [[[170, 105], [175, 135], [160, 155], [100, 160], [40, 155], [25, 135], [30, 110]], [[80, 75], [80, 75]], [[120, 75], [120, 75]], [[100, 50], [100, 50]]] },
  { id: 'jeem', char: 'ج', name: 'جيم', connects: true, color: 'from-purple-400 to-indigo-600',
    forms: { initial: 'جـ', medial: 'ـجـ', final: 'ـج' }, harakat: H('ج'),
    words: [{ word: 'جَمَل', emoji: '🐪' }, { word: 'جَزَر', emoji: '🥕' }, { word: 'جَبَل', emoji: '⛰️' }],
    strokes: [[[150, 50], [90, 55], [60, 75], [120, 80]], [[120, 80], [60, 110], [40, 150], [70, 175], [130, 170], [160, 140]], [[100, 130], [100, 130]]] },
  { id: 'haa', char: 'ح', name: 'حاء', connects: true, color: 'from-pink-400 to-rose-600',
    forms: { initial: 'حـ', medial: 'ـحـ', final: 'ـح' }, harakat: H('ح'),
    words: [{ word: 'حِصَان', emoji: '🐴' }, { word: 'حُوت', emoji: '🐋' }, { word: 'حَقِيبَة', emoji: '🎒' }],
    strokes: [[[150, 50], [90, 55], [60, 75], [120, 80]], [[120, 80], [60, 110], [40, 150], [70, 175], [130, 170], [160, 140]]] },
  { id: 'khaa', char: 'خ', name: 'خاء', connects: true, color: 'from-teal-400 to-cyan-600',
    forms: { initial: 'خـ', medial: 'ـخـ', final: 'ـخ' }, harakat: H('خ'),
    words: [{ word: 'خَرُوف', emoji: '🐑' }, { word: 'خُبْز', emoji: '🍞' }, { word: 'خَيْمَة', emoji: '⛺' }],
    strokes: [[[150, 65], [90, 70], [60, 90], [120, 95]], [[120, 95], [60, 125], [40, 160], [70, 180], [130, 175], [160, 150]], [[100, 35], [100, 35]]] },
  { id: 'dal', char: 'د', name: 'دال', connects: false, color: 'from-orange-400 to-red-500',
    forms: { initial: 'د', medial: 'ـد', final: 'ـد' }, harakat: H('د'),
    words: [{ word: 'دَجَاجَة', emoji: '🐔' }, { word: 'دُبّ', emoji: '🐻' }, { word: 'دَرَّاجَة', emoji: '🚲' }],
    strokes: [[[90, 50], [130, 70], [150, 110], [130, 150], [60, 155]]] },
  { id: 'thal', char: 'ذ', name: 'ذال', connects: false, color: 'from-lime-400 to-green-600',
    forms: { initial: 'ذ', medial: 'ـذ', final: 'ـذ' }, harakat: H('ذ'),
    words: [{ word: 'ذِئْب', emoji: '🐺' }, { word: 'ذُرَة', emoji: '🌽' }, { word: 'ذَهَب', emoji: '🥇' }],
    strokes: [[[90, 65], [130, 85], [150, 125], [130, 160], [60, 165]], [[110, 35], [110, 35]]] },
  { id: 'raa', char: 'ر', name: 'راء', connects: false, color: 'from-sky-400 to-blue-600',
    forms: { initial: 'ر', medial: 'ـر', final: 'ـر' }, harakat: H('ر'),
    words: [{ word: 'رُمَّان', emoji: '🍎' }, { word: 'رَجُل', emoji: '🧔' }, { word: 'رِيشَة', emoji: '🪶' }],
    strokes: [[[120, 50], [125, 100], [110, 140], [80, 165], [50, 170]]] },
  { id: 'zay', char: 'ز', name: 'زاي', connects: false, color: 'from-violet-400 to-purple-600',
    forms: { initial: 'ز', medial: 'ـز', final: 'ـز' }, harakat: H('ز'),
    words: [{ word: 'زَرَافَة', emoji: '🦒' }, { word: 'زَهْرَة', emoji: '🌸' }, { word: 'زَيْتُون', emoji: '🫒' }],
    strokes: [[[120, 70], [125, 115], [110, 150], [80, 170], [50, 175]], [[120, 35], [120, 35]]] },
  { id: 'seen', char: 'س', name: 'سين', connects: true, color: 'from-amber-400 to-orange-600',
    forms: { initial: 'سـ', medial: 'ـسـ', final: 'ـس' }, harakat: H('س'),
    words: [{ word: 'سَمَكَة', emoji: '🐟' }, { word: 'سَيَّارَة', emoji: '🚗' }, { word: 'سَاعَة', emoji: '⌚' }],
    strokes: [[[180, 90], [170, 115], [155, 95], [145, 115], [130, 95], [120, 120], [110, 110]], [[110, 110], [90, 170], [50, 180], [25, 150], [40, 115]]] },
  { id: 'sheen', char: 'ش', name: 'شين', connects: true, color: 'from-emerald-400 to-teal-600',
    forms: { initial: 'شـ', medial: 'ـشـ', final: 'ـش' }, harakat: H('ش'),
    words: [{ word: 'شَمْس', emoji: '☀️' }, { word: 'شَجَرَة', emoji: '🌳' }, { word: 'شُبَّاك', emoji: '🪟' }],
    strokes: [[[180, 100], [170, 125], [155, 105], [145, 125], [130, 105], [120, 130], [110, 120]], [[110, 120], [90, 175], [50, 185], [25, 155], [40, 120]], [[135, 65], [135, 65]], [[155, 65], [155, 65]], [[145, 40], [145, 40]]] },
  { id: 'sad', char: 'ص', name: 'صاد', connects: true, color: 'from-rose-400 to-pink-600',
    forms: { initial: 'صـ', medial: 'ـصـ', final: 'ـص' }, harakat: H('ص'),
    words: [{ word: 'صَقْر', emoji: '🦅' }, { word: 'صَابُون', emoji: '🧼' }, { word: 'صَارُوخ', emoji: '🚀' }],
    strokes: [[[175, 100], [165, 85], [130, 80], [105, 95], [110, 120], [140, 125], [175, 115]], [[105, 118], [90, 170], [50, 180], [25, 150], [40, 115]]] },
  { id: 'dad', char: 'ض', name: 'ضاد', connects: true, color: 'from-indigo-400 to-blue-600',
    forms: { initial: 'ضـ', medial: 'ـضـ', final: 'ـض' }, harakat: H('ض'),
    words: [{ word: 'ضِفْدَع', emoji: '🐸' }, { word: 'ضَوْء', emoji: '💡' }, { word: 'ضَرْس', emoji: '🦷' }],
    strokes: [[[175, 110], [165, 95], [130, 90], [105, 105], [110, 130], [140, 135], [175, 125]], [[105, 128], [90, 175], [50, 185], [25, 155], [40, 120]], [[140, 55], [140, 55]]] },
  { id: 'tah', char: 'ط', name: 'طاء', connects: true, color: 'from-cyan-400 to-teal-600',
    forms: { initial: 'طـ', medial: 'ـطـ', final: 'ـط' }, harakat: H('ط'),
    words: [{ word: 'طَائِرَة', emoji: '✈️' }, { word: 'طَمَاطِم', emoji: '🍅' }, { word: 'طَاوُوس', emoji: '🦚' }],
    strokes: [[[160, 140], [150, 120], [110, 115], [85, 130], [95, 150], [130, 155], [170, 150]], [[150, 40], [150, 150]]] },
  { id: 'zah', char: 'ظ', name: 'ظاء', connects: true, color: 'from-fuchsia-400 to-purple-600',
    forms: { initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' }, harakat: H('ظ'),
    words: [{ word: 'ظَرْف', emoji: '✉️' }, { word: 'ظَبْي', emoji: '🦌' }, { word: 'ظِلّ', emoji: '🌳' }],
    strokes: [[[160, 145], [150, 125], [110, 120], [85, 135], [95, 155], [130, 160], [170, 155]], [[155, 45], [155, 155]], [[110, 70], [110, 70]]] },
  { id: 'ain', char: 'ع', name: 'عين', connects: true, color: 'from-green-400 to-lime-600',
    forms: { initial: 'عـ', medial: 'ـعـ', final: 'ـع' }, harakat: H('ع'),
    words: [{ word: 'عُصْفُور', emoji: '🐦' }, { word: 'عِنَب', emoji: '🍇' }, { word: 'عَيْن', emoji: '👁️' }],
    strokes: [[[140, 45], [100, 50], [85, 75], [110, 95], [130, 90]], [[110, 95], [60, 115], [40, 150], [70, 175], [130, 170], [160, 140]]] },
  { id: 'ghain', char: 'غ', name: 'غين', connects: true, color: 'from-orange-400 to-amber-600',
    forms: { initial: 'غـ', medial: 'ـغـ', final: 'ـغ' }, harakat: H('غ'),
    words: [{ word: 'غَزَال', emoji: '🦌' }, { word: 'غُرَاب', emoji: '🐦‍⬛' }, { word: 'غَيْمَة', emoji: '☁️' }],
    strokes: [[[140, 60], [100, 65], [85, 90], [110, 110], [130, 105]], [[110, 110], [60, 130], [40, 160], [70, 180], [130, 175], [160, 150]], [[110, 30], [110, 30]]] },
  { id: 'faa', char: 'ف', name: 'فاء', connects: true, color: 'from-blue-400 to-indigo-600',
    forms: { initial: 'فـ', medial: 'ـفـ', final: 'ـف' }, harakat: H('ف'),
    words: [{ word: 'فِيل', emoji: '🐘' }, { word: 'فَرَاوْلَة', emoji: '🍓' }, { word: 'فَرَاشَة', emoji: '🦋' }],
    strokes: [[[150, 85], [160, 70], [140, 60], [125, 75], [135, 95], [155, 95]], [[175, 110], [160, 130], [100, 135], [40, 130], [25, 110], [30, 90]], [[142, 40], [142, 40]]] },
  { id: 'qaf', char: 'ق', name: 'قاف', connects: true, color: 'from-red-400 to-orange-600',
    forms: { initial: 'قـ', medial: 'ـقـ', final: 'ـق' }, harakat: H('ق'),
    words: [{ word: 'قِطَّة', emoji: '🐱' }, { word: 'قَمَر', emoji: '🌙' }, { word: 'قَلَم', emoji: '✏️' }],
    strokes: [[[150, 95], [160, 80], [140, 70], [125, 85], [135, 105], [155, 105]], [[175, 115], [165, 150], [120, 175], [60, 170], [35, 140]], [[130, 40], [130, 40]], [[155, 40], [155, 40]]] },
  { id: 'kaf', char: 'ك', name: 'كاف', connects: true, color: 'from-teal-400 to-emerald-600',
    forms: { initial: 'كـ', medial: 'ـكـ', final: 'ـك' }, harakat: H('ك'),
    words: [{ word: 'كَلْب', emoji: '🐶' }, { word: 'كِتَاب', emoji: '📖' }, { word: 'كُرَة', emoji: '⚽' }],
    strokes: [[[150, 35], [150, 150], [40, 155], [30, 130]], [[115, 90], [95, 80], [80, 100], [105, 110]]] },
  { id: 'lam', char: 'ل', name: 'لام', connects: true, color: 'from-purple-400 to-pink-600',
    forms: { initial: 'لـ', medial: 'ـلـ', final: 'ـل' }, harakat: H('ل'),
    words: [{ word: 'لَيْمُون', emoji: '🍋' }, { word: 'لَبَن', emoji: '🥛' }, { word: 'لُعْبَة', emoji: '🧸' }],
    strokes: [[[130, 30], [130, 120], [120, 160], [80, 175], [45, 160], [40, 130]]] },
  { id: 'meem', char: 'م', name: 'ميم', connects: true, color: 'from-yellow-400 to-orange-500',
    forms: { initial: 'مـ', medial: 'ـمـ', final: 'ـم' }, harakat: H('م'),
    words: [{ word: 'مَوْز', emoji: '🍌' }, { word: 'مِفْتَاح', emoji: '🔑' }, { word: 'مَدْرَسَة', emoji: '🏫' }],
    strokes: [[[130, 70], [140, 90], [120, 105], [95, 95], [100, 75], [125, 70]], [[100, 100], [100, 180]]] },
  { id: 'noon', char: 'ن', name: 'نون', connects: true, color: 'from-sky-400 to-cyan-600',
    forms: { initial: 'نـ', medial: 'ـنـ', final: 'ـن' }, harakat: H('ن'),
    words: [{ word: 'نَحْلَة', emoji: '🐝' }, { word: 'نَجْمَة', emoji: '⭐' }, { word: 'نَمِر', emoji: '🐯' }],
    strokes: [[[160, 70], [165, 130], [130, 165], [70, 165], [35, 130], [40, 75]], [[100, 50], [100, 50]]] },
  { id: 'haa2', char: 'ه', name: 'هاء', connects: true, color: 'from-rose-400 to-red-600',
    forms: { initial: 'هـ', medial: 'ـهـ', final: 'ـه' }, harakat: H('ه'),
    words: [{ word: 'هِلَال', emoji: '🌙' }, { word: 'هَدِيَّة', emoji: '🎁' }, { word: 'هُدْهُد', emoji: '🐦' }],
    strokes: [[[100, 60], [140, 80], [145, 130], [100, 155], [55, 130], [60, 80], [100, 60]]] },
  { id: 'waw', char: 'و', name: 'واو', connects: false, color: 'from-green-400 to-teal-600',
    forms: { initial: 'و', medial: 'ـو', final: 'ـو' }, harakat: H('و'),
    words: [{ word: 'وَرْدَة', emoji: '🌹' }, { word: 'وَلَد', emoji: '👦' }, { word: 'وَجْه', emoji: '😊' }],
    strokes: [[[130, 55], [150, 75], [135, 100], [105, 100], [95, 75], [115, 55], [130, 55]], [[120, 100], [110, 140], [85, 170], [55, 180]]] },
  { id: 'yaa', char: 'ي', name: 'ياء', connects: true, color: 'from-indigo-400 to-violet-600',
    forms: { initial: 'يـ', medial: 'ـيـ', final: 'ـي' }, harakat: H('ي'),
    words: [{ word: 'يَد', emoji: '✋' }, { word: 'يَمَامَة', emoji: '🕊️' }, { word: 'يَاسَمِين', emoji: '🌼' }],
    strokes: [[[160, 60], [130, 85], [150, 110], [180, 100]], [[150, 110], [140, 150], [100, 170], [50, 160], [30, 130], [45, 110]], [[85, 185], [85, 185]], [[115, 185], [115, 185]]] },
]

export const letterById = (id: string) => arabicLetters.find(l => l.id === id)
export const letterIndex = (id: string) => arabicLetters.findIndex(l => l.id === id)

/** كلمات قصيرة للعبة تكوين الكلمات */
export const spellingWords: { word: string; emoji: string; letters: string[] }[] = [
  { word: 'باب', emoji: '🚪', letters: ['ب', 'ا', 'ب'] },
  { word: 'قمر', emoji: '🌙', letters: ['ق', 'م', 'ر'] },
  { word: 'أسد', emoji: '🦁', letters: ['أ', 'س', 'د'] },
  { word: 'بطة', emoji: '🦆', letters: ['ب', 'ط', 'ة'] },
  { word: 'جمل', emoji: '🐪', letters: ['ج', 'م', 'ل'] },
  { word: 'كتاب', emoji: '📖', letters: ['ك', 'ت', 'ا', 'ب'] },
  { word: 'شمس', emoji: '☀️', letters: ['ش', 'م', 'س'] },
  { word: 'سمكة', emoji: '🐟', letters: ['س', 'م', 'ك', 'ة'] },
  { word: 'نحلة', emoji: '🐝', letters: ['ن', 'ح', 'ل', 'ة'] },
  { word: 'فيل', emoji: '🐘', letters: ['ف', 'ي', 'ل'] },
  { word: 'ورد', emoji: '🌹', letters: ['و', 'ر', 'د'] },
  { word: 'عنب', emoji: '🍇', letters: ['ع', 'ن', 'ب'] },
  { word: 'موز', emoji: '🍌', letters: ['م', 'و', 'ز'] },
  { word: 'دب', emoji: '🐻', letters: ['د', 'ب'] },
  { word: 'يد', emoji: '✋', letters: ['ي', 'د'] },
]
