'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addContent, deleteContent, fileToDataUrl, getAllContent, resetContent, saveAllContent, updateContent } from '@/lib/contentStore'
import { categoryLabels, getColorFromGradient, type Category, type ContentItem } from '@/lib/data'
import { arabicLetters } from '@/lib/letters'
import { getLetterAudio, setLetterAudio, speak } from '@/lib/speech'

const ADMIN_PIN = '4444'
const MAX_AUDIO_MB = 4

const COVER_COLORS = [
  'from-green-400 to-emerald-600', 'from-blue-400 to-cyan-600', 'from-yellow-400 to-orange-500', 'from-pink-400 to-rose-600',
  'from-purple-500 to-indigo-600', 'from-teal-400 to-cyan-600', 'from-orange-400 to-red-500', 'from-amber-400 to-yellow-600',
  'from-violet-500 to-purple-700', 'from-rose-400 to-pink-600', 'from-emerald-500 to-teal-600', 'from-sky-400 to-blue-600',
]
const CATEGORIES = (Object.keys(categoryLabels) as Category[]).filter(c => c !== 'letters').map(value => ({ value, label: categoryLabels[value] }))

const EMPTY: Omit<ContentItem, 'id'> = {
  title: '', subtitle: '', category: 'prophets', duration: '5:00', ageMin: 3, ageMax: 12,
  isPremium: false, emoji: '🎧', coverColor: 'from-purple-500 to-indigo-600', description: '', body: '', audioUrl: '', isNew: true, isTrending: false,
}

type View = 'list' | 'form' | 'letters'

export default function AdminPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [items, setItems] = useState<ContentItem[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [view, setView] = useState<View>('list')
  const [editItem, setEditItem] = useState<ContentItem | null>(null)
  const [form, setForm] = useState<Omit<ContentItem, 'id'>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [letterAudio, setLetterAudioMap] = useState<Record<string, string>>({})
  const [uploadingLetter, setUploadingLetter] = useState<string | null>(null)
  const audioRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const letterFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (sessionStorage.getItem('fos7a_admin_auth') === 'true') setAuthed(true) }, [])
  useEffect(() => { if (authed) { setItems(getAllContent()); setLetterAudioMap(getLetterAudio()) } }, [authed])

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2000) }
  const reload = () => setItems(getAllContent())

  const login = () => {
    if (pin === ADMIN_PIN) { setAuthed(true); sessionStorage.setItem('fos7a_admin_auth', 'true') }
    else { setPinError(true); setTimeout(() => setPinError(false), 1200) }
  }
  const logout = () => { setAuthed(false); sessionStorage.removeItem('fos7a_admin_auth'); router.push('/home') }

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setView('form') }
  const openEdit = (it: ContentItem) => { setEditItem(it); setForm({ ...EMPTY, ...it }); setView('form') }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    try {
      if (editItem) updateContent(editItem.id, form); else addContent(form)
      reload(); setView('list'); notify(editItem ? '✅ تم التعديل' : '✅ تمت الإضافة')
    } catch {
      notify('⚠️ مساحة التخزين ممتلئة — استخدم رابط صوت بدلاً من رفع الملف')
    }
    setSaving(false)
  }

  const handleDelete = (id: string) => { deleteContent(id); reload(); setDeleteConfirm(null); notify('🗑️ تم الحذف') }

  const handleAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) { notify(`⚠️ الملف أكبر من ${MAX_AUDIO_MB}MB — ارفعه على رابط خارجي وضع الرابط`); return }
    const url = await fileToDataUrl(file)
    // حساب المدة
    const a = new Audio(url)
    a.onloadedmetadata = () => {
      const s = Math.round(a.duration)
      setForm(f => ({ ...f, audioUrl: url, duration: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }))
    }
    a.onerror = () => setForm(f => ({ ...f, audioUrl: url }))
    notify('🎵 تم تحميل الملف الصوتي')
  }

  const handleLetterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !uploadingLetter) return
    if (file.size > 1024 * 1024) { notify('⚠️ ملف صوت الحرف يجب أن يكون أقل من 1MB'); return }
    try {
      const url = await fileToDataUrl(file)
      setLetterAudio(uploadingLetter, url); setLetterAudioMap(getLetterAudio()); notify('✅ تم حفظ صوت الحرف')
    } catch { notify('⚠️ فشل الحفظ') }
    setUploadingLetter(null)
    e.target.value = ''
  }

  const handleExport = () => {
    const data = JSON.stringify({ content: getAllContent(), letterAudio: getLetterAudio() }, null, 2)
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }))
    a.download = `fos7a-content-${new Date().toISOString().slice(0, 10)}.json`; a.click()
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (Array.isArray(data)) saveAllContent(data)
        else if (data.content) { saveAllContent(data.content); if (data.letterAudio) localStorage.setItem('fos7a_letter_audio', JSON.stringify(data.letterAudio)) }
        reload(); setLetterAudioMap(getLetterAudio()); notify('📥 تم الاستيراد')
      } catch { notify('⚠️ ملف غير صالح') }
    }
    reader.readAsText(file)
  }

  const filtered = items.filter(i => (catFilter === 'all' || i.category === catFilter) && (!search || (i.title + i.subtitle).includes(search)))
  const stats = { total: items.length, premium: items.filter(i => i.isPremium).length, audio: items.filter(i => i.audioUrl).length, text: items.filter(i => i.body).length }

  // ── PIN ─────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' }}>
      <div className="text-6xl mb-4">🔐</div>
      <h1 className="text-white font-bold text-2xl mb-2">لوحة التحكم</h1>
      <p className="text-white/60 text-sm mb-8">أدخل رمز ولي الأمر للدخول</p>
      <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl">
        <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} maxLength={6} autoFocus dir="ltr"
          className={`w-full text-center text-3xl font-bold border-2 rounded-2xl py-4 outline-none mb-4 ${pinError ? 'border-red-400 bg-red-50 shake' : 'border-gray-200'}`} style={{ letterSpacing: 8 }} placeholder="••••" />
        <button onClick={login} className="w-full py-3 rounded-2xl text-white font-bold btn-press" style={{ background: '#5C35BF' }}>دخول</button>
        <p className="text-center text-gray-400 text-xs mt-3">الرمز الافتراضي: 4444</p>
        <button onClick={() => router.back()} className="w-full mt-2 py-2 text-gray-400 text-xs btn-press">رجوع</button>
      </div>
    </div>
  )

  const Input = ({ label, value, onChange, placeholder, ltr, type = 'text' }: { label: string; value: string | number; onChange: (v: string) => void; placeholder?: string; ltr?: boolean; type?: string }) => (
    <div>
      <label className="text-xs text-gray-500 font-semibold mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} dir={ltr ? 'ltr' : 'rtl'}
        className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 ${ltr ? 'text-left' : ''}`} />
    </div>
  )

  // ── Form ────────────────────────────────────────────────
  if (view === 'form') return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setView('list')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center btn-press">→</button>
        <h1 className="font-bold text-gray-900 text-lg flex-1">{editItem ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}</h1>
        <button onClick={handleSave} disabled={saving || !form.title.trim()} className="btn-press px-5 py-2 rounded-xl text-white font-bold text-sm" style={{ background: saving || !form.title.trim() ? '#9CA3AF' : '#5C35BF' }}>
          {saving ? '...' : 'حفظ'}
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl shadow-lg" style={{ background: getColorFromGradient(form.coverColor) }}>{form.emoji || '🎧'}</div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-xs font-bold text-gray-400">المعلومات الأساسية</p>
          <Input label="العنوان *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="مثال: قصة سيدنا نوح" />
          <Input label="العنوان الفرعي" value={form.subtitle} onChange={v => setForm(f => ({ ...f, subtitle: v }))} placeholder="مثال: والسفينة العظيمة" />
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-1 block">الوصف المختصر</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 resize-none" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-1">📜 نص القصة الكامل</p>
          <p className="text-[11px] text-gray-400 mb-2">يُقرأ بالصوت الآلي عند عدم وجود ملف صوتي، ويظهر للطفل في صفحة المحتوى.</p>
          <textarea value={form.body || ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={7} placeholder="اكتب القصة هنا... افصل الجمل بنقطة ليقرأها المشغّل جملة جملة."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-purple-400 resize-y" />
          {form.body && <button onClick={() => speak(form.body!.split('.')[0])} className="mt-2 text-xs font-semibold btn-press" style={{ color: '#5C35BF' }}>🔊 اسمع أول جملة بالصوت الآلي</button>}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-3">🎙️ الملف الصوتي</p>
          <Input label="رابط الصوت (mp3 / m4a)" value={form.audioUrl || ''} onChange={v => setForm(f => ({ ...f, audioUrl: v }))} placeholder="https://..." ltr />
          <p className="text-center text-gray-400 text-xs my-2">أو</p>
          <input ref={audioRef} type="file" accept="audio/*" onChange={handleAudioFile} className="hidden" />
          <button onClick={() => audioRef.current?.click()} className="btn-press w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-medium">📂 رفع ملف صوتي من الجهاز (حتى {MAX_AUDIO_MB}MB)</button>
          {form.audioUrl && (
            <div className="mt-3 p-2 bg-green-50 rounded-xl flex items-center gap-2">
              <audio controls src={form.audioUrl} className="flex-1 h-9" />
              <button onClick={() => setForm(f => ({ ...f, audioUrl: '' }))} className="text-red-400 text-sm px-2 btn-press">✕</button>
            </div>
          )}
          {!form.audioUrl && !form.body && <p className="text-[11px] text-amber-600 mt-2">⚠️ بدون صوت ولا نص سيُشغَّل المحتوى بشكل صامت (محاكاة)</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-xs font-bold text-gray-400">التصنيف</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-semibold mb-1 block">الفئة</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))} className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <Input label="المدة (د:ث)" value={form.duration} onChange={v => setForm(f => ({ ...f, duration: v }))} placeholder="5:30" ltr />
            <Input label="العمر من" type="number" value={form.ageMin} onChange={v => setForm(f => ({ ...f, ageMin: +v }))} />
            <Input label="العمر إلى" type="number" value={form.ageMax} onChange={v => setForm(f => ({ ...f, ageMax: +v }))} />
            {form.category === 'prophets' && <Input label="الترتيب الزمني" type="number" value={form.order ?? ''} onChange={v => setForm(f => ({ ...f, order: v ? +v : undefined }))} placeholder="1" />}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {([['isPremium', '👑 مميز'], ['isNew', '✨ جديد'], ['isTrending', '🔥 رائج']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))} className="py-2 rounded-xl text-xs font-bold btn-press border-2"
                style={{ background: form[key] ? '#5C35BF' : 'white', color: form[key] ? 'white' : '#6B7280', borderColor: form[key] ? '#5C35BF' : '#E5E7EB' }}>{label}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 mb-3">الشكل</p>
          <Input label="الإيموجي" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} placeholder="🎧" />
          <label className="text-xs text-gray-500 font-semibold mb-2 mt-3 block">لون الغلاف</label>
          <div className="grid grid-cols-6 gap-2">
            {COVER_COLORS.map(c => (
              <button key={c} onClick={() => setForm(f => ({ ...f, coverColor: c }))} className="w-10 h-10 rounded-xl btn-press relative"
                style={{ background: getColorFromGradient(c), outline: form.coverColor === c ? '3px solid #5C35BF' : 'none', outlineOffset: 2 }}>
                {form.coverColor === c && <span className="absolute inset-0 flex items-center justify-center text-white font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      {toast && <Toast msg={toast} />}
    </div>
  )

  // ── Letter audio ────────────────────────────────────────
  if (view === 'letters') return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setView('list')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center btn-press">→</button>
        <div className="flex-1"><h1 className="font-bold text-gray-900 text-lg">أصوات الحروف</h1><p className="text-xs text-gray-400">{Object.keys(letterAudio).length}/28 حرفاً بصوت مسجّل</p></div>
      </div>
      <input ref={letterFileRef} type="file" accept="audio/*" onChange={handleLetterFile} className="hidden" />
      <div className="px-5 py-4">
        <p className="text-xs text-gray-500 bg-blue-50 rounded-xl p-3 mb-4">💡 ارفع تسجيلاً صوتياً قصيراً لكل حرف (أقل من 1MB). الحروف بدون تسجيل تُقرأ بالصوت الآلي المختار في الإعدادات.</p>
        <div className="space-y-2">
          {arabicLetters.map(l => {
            const url = letterAudio[l.id]
            return (
              <div key={l.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0" style={{ background: getColorFromGradient(l.color) }}>{l.char}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{l.name}</p>
                  <p className="text-[11px] text-gray-400">{url ? '🎙️ صوت مسجّل' : '🗣️ صوت آلي'}</p>
                </div>
                {url && <button onClick={() => new Audio(url).play()} className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center btn-press">▶</button>}
                <button onClick={() => { setUploadingLetter(l.id); letterFileRef.current?.click() }} className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center btn-press text-sm">📂</button>
                {url && <button onClick={() => { setLetterAudio(l.id, null); setLetterAudioMap(getLetterAudio()) }} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center btn-press text-sm">🗑️</button>}
              </div>
            )
          })}
        </div>
      </div>
      {toast && <Toast msg={toast} />}
    </div>
  )

  // ── List ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white px-5 pt-12 pb-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-xl font-bold text-gray-900">لوحة التحكم 🎛️</h1><p className="text-gray-400 text-xs">فسحة — إدارة المحتوى</p></div>
          <button onClick={logout} className="text-gray-400 text-xs border border-gray-200 px-3 py-1.5 rounded-xl btn-press">خروج</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: 'المحتوى', v: stats.total, e: '📚' }, { l: 'مميز', v: stats.premium, e: '👑' }, { l: 'بصوت', v: stats.audio, e: '🎙️' }, { l: 'بنص', v: stats.text, e: '📜' }].map(s => (
            <div key={s.l} className="bg-gray-50 rounded-2xl p-2 text-center"><div className="text-lg">{s.e}</div><div className="font-bold text-gray-800">{s.v}</div><div className="text-gray-400 text-[10px]">{s.l}</div></div>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <span className="text-gray-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن محتوى..." className="flex-1 bg-transparent text-sm text-gray-700 outline-none" />
        </div>
      </div>

      <div className="px-5 py-3 flex gap-2 overflow-x-auto">
        {[{ value: 'all', label: 'الكل' }, ...CATEGORIES].map(c => (
          <button key={c.value} onClick={() => setCatFilter(c.value)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold btn-press" style={{ background: catFilter === c.value ? '#5C35BF' : '#F3F4F6', color: catFilter === c.value ? 'white' : '#6B7280' }}>{c.label}</button>
        ))}
      </div>

      <div className="px-5 flex gap-2 mb-3">
        <button onClick={openAdd} className="flex-1 btn-press py-3 rounded-2xl text-white font-bold text-sm shadow-lg" style={{ background: 'linear-gradient(135deg, #5C35BF, #2D1B69)' }}>+ إضافة محتوى</button>
        <button onClick={() => setView('letters')} className="btn-press px-4 py-3 rounded-2xl bg-white text-gray-700 text-sm shadow-sm font-bold">🔤 أصوات الحروف</button>
      </div>
      <div className="px-5 flex gap-2 mb-4">
        <button onClick={handleExport} className="flex-1 btn-press py-2.5 rounded-xl bg-white text-gray-600 text-xs shadow-sm">📥 تصدير JSON</button>
        <label className="flex-1 btn-press py-2.5 rounded-xl bg-white text-gray-600 text-xs shadow-sm text-center cursor-pointer">📤 استيراد<input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" /></label>
        <button onClick={() => { if (confirm('إعادة المحتوى الافتراضي؟ ستُحذف التعديلات.')) { resetContent(); reload(); notify('🔄 تمت الإعادة') } }} className="flex-1 btn-press py-2.5 rounded-xl bg-white text-gray-400 text-xs shadow-sm">🔄 افتراضي</button>
      </div>

      <div className="px-5 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-3">📭</div><p className="text-gray-400 text-sm">لا يوجد محتوى</p></div>
        ) : filtered.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative" style={{ background: getColorFromGradient(item.coverColor) }}>
              {item.emoji}
              {item.audioUrl && <span className="absolute -bottom-1 -right-1 text-[9px] bg-green-400 text-white rounded-full w-4 h-4 flex items-center justify-center">▶</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                {item.isPremium && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">مميز</span>}
                {item.body && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">نص</span>}
              </div>
              <p className="text-gray-400 text-xs">{categoryLabels[item.category]} · {item.duration} · {item.ageMin}-{item.ageMax} سنة</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center btn-press text-sm">✏️</button>
              <button onClick={() => setDeleteConfirm(item.id)} className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center btn-press text-sm">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="text-4xl text-center mb-3">🗑️</div>
            <h3 className="font-bold text-gray-800 text-center mb-1">حذف المحتوى؟</h3>
            <p className="text-gray-400 text-sm text-center mb-5">لا يمكن التراجع عن هذا الإجراء</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm btn-press">إلغاء</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-semibold text-sm btn-press">حذف</button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast msg={toast} />}
    </div>
  )
}

function Toast({ msg }: { msg: string }) {
  return <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 slide-up max-w-[340px] text-center">{msg}</div>
}
