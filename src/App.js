import { useState, useCallback, useEffect, useRef } from "react";

const C = {
  bg: "#07111F", card: "#0D1E35", card2: "#112240",
  accent: "#F5A800", green: "#2ECC71", red: "#E74C3C",
  blue: "#3498DB", text: "#E8F4FD", muted: "#6B8CAE",
};

const SUBJECTS = [
  { id: "arabic",  label: "عربي",    emoji: "📖", color: "#F5A800", desc: "حروف وكلمات" },
  { id: "english", label: "English", emoji: "🔤", color: "#3498DB", desc: "Letters & Words" },
  { id: "math",    label: "رياضيات", emoji: "🔢", color: "#2ECC71", desc: "أرقام وحساب" },
];

const LEVELS = [
  { id: "easy",   label: "سهل",   emoji: "🌱", color: "#2ECC71", desc: "للمبتدئين، أسئلة بسيطة جداً" },
  { id: "medium", label: "متوسط", emoji: "⭐", color: "#F5A800", desc: "مستوى متوسط يحتاج تفكيراً" },
  { id: "hard",   label: "صعب",   emoji: "🔥", color: "#E74C3C", desc: "للمتقدمين، تحدٍّ حقيقي!" },
];

const STORAGE_KEY = "fos7a_v3";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function initChild(name, age, avatar) {
  return { name, age, avatar: avatar || null, createdAt: Date.now(), sessions: [] };
}
function recordSession(progress, childId, subjectId, levelId, score, total) {
  const updated = { ...progress };
  if (!updated[childId]) return updated;
  const session = { subjectId, levelId, score, total, pct: Math.round((score / total) * 100), date: Date.now() };
  updated[childId] = { ...updated[childId], sessions: [...(updated[childId].sessions || []), session] };
  saveProgress(updated);
  return updated;
}
function getStats(child) {
  const sessions = child.sessions || [];
  if (!sessions.length) return null;
  const bySubject = {};
  SUBJECTS.forEach(s => {
    const ss = sessions.filter(x => x.subjectId === s.id);
    bySubject[s.id] = ss.length
      ? { count: ss.length, avg: Math.round(ss.reduce((a, b) => a + b.pct, 0) / ss.length), best: Math.max(...ss.map(x => x.pct)) }
      : null;
  });
  const days = [...new Set(sessions.map(s => new Date(s.date).toDateString()))];
  let streak = days.length ? 1 : 0;
  for (let i = 1; i < days.length; i++) {
    if ((new Date(days[i - 1]) - new Date(days[i])) / 86400000 <= 1) streak++;
    else break;
  }
  return { bySubject, total: sessions.length, avgPct: Math.round(sessions.reduce((a, b) => a + b.pct, 0) / sessions.length), streak, recent: sessions.slice(-6).reverse() };
}

// Speech
function speak(text, lang) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "en" ? "en-US" : "ar-SA"; u.rate = 0.85; u.pitch = 1.1;
  window.speechSynthesis.speak(u);
}
function stopSpeech() { if (window.speechSynthesis) window.speechSynthesis.cancel(); }

// Sound
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === "correct") {
      o.frequency.setValueAtTime(523, ctx.currentTime);
      o.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      o.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
    } else {
      o.frequency.setValueAtTime(300, ctx.currentTime);
      o.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.start(); o.stop(ctx.currentTime + 0.3);
    }
  } catch {}
}

// Share
function buildShareText(childName, subject, level, score, total) {
  const pct = Math.round((score / total) * 100);
  const stars = pct === 100 ? "⭐⭐⭐⭐⭐" : pct >= 80 ? "⭐⭐⭐⭐" : pct >= 60 ? "⭐⭐⭐" : "⭐⭐";
  return `🇸🇩 فسحة - منصة تعليمية للأطفال\n\n🎉 ${childName} أنهى جلسة تعليمية!\n📚 المادة: ${subject.label}\n🎯 المستوى: ${level.label} ${level.emoji}\n✅ النتيجة: ${score}/${total} (${pct}%)\n${stars}\n\nانضم لفسحة مجاناً 👇\nhttps://fos7a.vercel.app`;
}

async function doShare(text) {
  if (navigator.share) {
    try { await navigator.share({ title: "فسحة - نتيجة تعليمية", text }); return "shared"; } catch { return false; }
  }
  try { await navigator.clipboard.writeText(text); return "copied"; } catch { return false; }
}

// Prompt
const QTYPES = {
  arabic:  ["الحروف الهجائية", "الكلمات البسيطة", "الألوان والأشكال", "الحيوانات", "الأرقام بالعربية", "الفواكه والخضروات", "أفراد الأسرة"],
  english: ["alphabet letters", "simple words and colors", "animals", "numbers", "body parts", "fruits and food", "action words"],
  math:    ["جمع 1-10", "طرح 1-10", "عد الأشياء", "مقارنة الأعداد", "الأشكال الهندسية", "التسلسلات", "ضرب 1-5"],
};
function buildPrompt(subjectId, age, levelId) {
  const ageLabel = age === "young" ? "3 إلى 6 سنوات" : "6 إلى 10 سنوات";
  const topic = QTYPES[subjectId][Math.floor(Math.random() * QTYPES[subjectId].length)];
  const diff = { easy: { ar: "بسيطة جداً ومباشرة", en: "very simple and direct" }, medium: { ar: "متوسطة تحتاج تفكيراً", en: "moderate, requires some thought" }, hard: { ar: "صعبة تحتاج تفكيراً عميقاً", en: "challenging and detailed" } }[levelId];
  const map = {
    arabic:  `أنت مساعد تعليمي للأطفال السودانيين. اصنع 5 أسئلة باللغة العربية لطفل عمره ${ageLabel}. الموضوع: ${topic}. الصعوبة: ${diff.ar}.`,
    english: `You are an educational assistant. Create 5 English questions for a child aged ${ageLabel}. Topic: ${topic}. Difficulty: ${diff.en}.`,
    math:    `أنت مساعد تعليمي. اصنع 5 أسئلة رياضيات لطفل عمره ${ageLabel}. الموضوع: ${topic}. الصعوبة: ${diff.ar}.`,
  };
  return `${map[subjectId]}\n\nJSON فقط بلا أي نص إضافي:\n[{"q":"السؤال","opts":["أ","ب","ج","د"],"ans":0,"img":"إيموجي"}]\n- ans = index الإجابة الصحيحة (0-3)\n- محتوى آمن للأطفال 100%`;
}

// ─── UI Atoms ────────────────────────────────────────────────────
const Btn = ({ children, onClick, color = C.accent, outline, style = {} }) => (
  <button onClick={onClick} style={{ background: outline ? "transparent" : color, border: `2px solid ${color}`, color: outline ? color : "#000", borderRadius: 14, padding: "12px 22px", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", ...style }}>{children}</button>
);
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.card2, borderRadius: 20, padding: 20, border: "1px solid rgba(255,255,255,0.06)", ...style }}>{children}</div>
);
function ProgressBar({ pct, color, height = 8 }) {
  return <div style={{ background: "#1a3050", borderRadius: 99, height, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.6s ease" }} /></div>;
}
function Stars({ count, size = 18 }) {
  return <span>{[...Array(5)].map((_, i) => <span key={i} style={{ opacity: i < count ? 1 : 0.18, fontSize: size }}>⭐</span>)}</span>;
}
function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{label}</span>;
}
function Avatar({ src, name, size = 44, color = C.accent }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${color}` }} />;
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45, fontWeight: 900, color }}>{name?.[0] || "؟"}</div>;
}

// ─── Welcome ─────────────────────────────────────────────────────
function WelcomeScreen({ progress, onSelectChild, onAddChild, onParentDash }) {
  const children = Object.entries(progress);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52 }}>🇸🇩</div>
        <h1 style={{ color: C.accent, fontWeight: 900, fontSize: 28, margin: "8px 0 4px" }}>فسحة</h1>
        <p style={{ color: C.muted, fontSize: 14, margin: 0, direction: "rtl" }}>منصة تعليمية مجانية للأطفال السودانيين</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(46,204,113,0.12)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: 20, padding: "4px 14px", marginTop: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "blink 1.5s infinite" }} />
          <span style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>مدعوم بـ Claude AI</span>
        </div>
      </div>
      {children.length > 0 && (
        <div>
          <p style={{ color: C.muted, fontSize: 13, direction: "rtl", textAlign: "center", marginBottom: 10 }}>من يريد التعلم اليوم؟</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {children.map(([id, child]) => {
              const stats = getStats(child);
              return (
                <button key={id} onClick={() => onSelectChild(id)} style={{ background: C.card2, border: "2px solid rgba(245,168,0,0.2)", borderRadius: 18, padding: "14px 18px", cursor: "pointer", color: C.text, display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s", direction: "rtl", fontFamily: "inherit" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(245,168,0,0.2)"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar src={child.avatar} name={child.name} size={48} />
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 17 }}>{child.name}</div>
                      <div style={{ color: C.muted, fontSize: 12 }}>{stats ? `${stats.total} جلسة · ${stats.avgPct}% متوسط` : "لم يبدأ بعد"}</div>
                    </div>
                  </div>
                  {stats && <Badge label={`🔥 ${stats.streak}`} color={C.accent} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn onClick={onAddChild} style={{ width: "100%" }}>+ إضافة طفل جديد</Btn>
        {children.length > 0 && <Btn onClick={onParentDash} outline color={C.muted} style={{ width: "100%", color: C.muted }}>📊 لوحة تحكم الأهل</Btn>}
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}

// ─── Add Child ────────────────────────────────────────────────────
function AddChildScreen({ onSave, onBack }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("old");
  const [avatar, setAvatar] = useState(null);
  const fileRef = useRef();

  function handleImg(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: C.text, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>← رجوع</button>
        <h2 style={{ color: C.text, margin: 0, direction: "rtl", fontWeight: 800 }}>إضافة طفل جديد</h2>
      </div>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, direction: "rtl" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div onClick={() => fileRef.current?.click()} style={{ cursor: "pointer", position: "relative" }}>
              <Avatar src={avatar} name={name || "؟"} size={88} />
              <div style={{ position: "absolute", bottom: 2, right: 2, background: C.accent, borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📷</div>
            </div>
            <span style={{ color: C.muted, fontSize: 12 }}>اضغط لإضافة صورة الطفل</span>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: 13, display: "block", marginBottom: 6 }}>اسم الطفل</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: أحمد"
              style={{ width: "100%", background: C.bg, border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 16, fontFamily: "inherit", outline: "none", boxSizing: "border-box", direction: "rtl" }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: 13, display: "block", marginBottom: 8 }}>الفئة العمرية</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ v: "young", l: "٣ - ٦ سنوات", e: "🧒" }, { v: "old", l: "٦ - ١٠ سنوات", e: "👦" }].map(a => (
                <button key={a.v} onClick={() => setAge(a.v)} style={{ flex: 1, background: age === a.v ? C.accent + "22" : C.bg, border: `2px solid ${age === a.v ? C.accent : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: "14px 10px", cursor: "pointer", color: age === a.v ? C.accent : C.muted, fontWeight: 700, fontSize: 14, fontFamily: "inherit", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{a.e}</div>{a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Btn onClick={() => { if (name.trim()) onSave("child_" + Date.now(), initChild(name.trim(), age, avatar)); }} style={{ width: "100%", opacity: name.trim() ? 1 : 0.4 }}>✅ حفظ وابدأ التعلم</Btn>
    </div>
  );
}

// ─── Subject Home ─────────────────────────────────────────────────
function SubjectHome({ child, onPickSubject, onBack, onViewProgress }) {
  const stats = getStats(child);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: C.text, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>← رجوع</button>
        <button onClick={onViewProgress} style={{ background: "rgba(46,204,113,0.12)", border: "1px solid rgba(46,204,113,0.3)", color: C.green, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>📊 تقدمي</button>
      </div>
      <div style={{ textAlign: "center" }}>
        <Avatar src={child.avatar} name={child.name} size={68} />
        <h2 style={{ color: C.text, margin: "10px 0 0", fontWeight: 900, fontSize: 22 }}>أهلاً {child.name}! 👋</h2>
        {stats && <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <Badge label={`🔥 ${stats.streak} يوم`} color={C.accent} />
          <Badge label={`⭐ ${stats.avgPct}%`} color={C.green} />
          <Badge label={`📚 ${stats.total} جلسة`} color={C.blue} />
        </div>}
      </div>
      <p style={{ color: C.muted, textAlign: "center", direction: "rtl", margin: 0, fontSize: 14 }}>اختر المادة ✨</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SUBJECTS.map(s => {
          const ss = stats?.bySubject[s.id];
          return (
            <button key={s.id} onClick={() => onPickSubject(s)} style={{ background: `linear-gradient(135deg,${s.color}15,${s.color}05)`, border: `2px solid ${s.color}33`, borderRadius: 20, padding: "18px 22px", cursor: "pointer", color: C.text, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.25s", direction: "rtl", fontFamily: "inherit" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = s.color + "33"; e.currentTarget.style.transform = "none"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 34 }}>{s.emoji}</span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{ss ? `${ss.count} جلسة · أفضل ${ss.best}%` : s.desc}</div>
                </div>
              </div>
              {ss && <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{ss.avg}%</div><div style={{ fontSize: 11, color: C.muted }}>متوسط</div></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Level Selector ───────────────────────────────────────────────
function LevelSelector({ subject, onSelect, onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: C.text, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>← رجوع</button>
        <span style={{ color: subject.color, fontWeight: 700, fontSize: 18 }}>{subject.emoji} {subject.label}</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: C.text, fontWeight: 800, fontSize: 20, direction: "rtl", margin: 0 }}>اختر مستوى الصعوبة 🎯</p>
        <p style={{ color: C.muted, fontSize: 13, direction: "rtl", marginTop: 6 }}>كل مستوى يولّد أسئلة مختلفة تماماً</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LEVELS.map(lv => (
          <button key={lv.id} onClick={() => onSelect(lv)} style={{ background: `linear-gradient(135deg,${lv.color}18,${lv.color}06)`, border: `2px solid ${lv.color}44`, borderRadius: 20, padding: "20px 24px", cursor: "pointer", color: C.text, width: "100%", display: "flex", alignItems: "center", gap: 16, transition: "all 0.25s", direction: "rtl", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = lv.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = lv.color + "44"; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: 40 }}>{lv.emoji}</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 900, fontSize: 20, color: lv.color }}>{lv.label}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{lv.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Loading ──────────────────────────────────────────────────────
function LoadingScreen({ subject }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ fontSize: 64, animation: "spin 2s linear infinite" }}>{subject.emoji}</div>
      <div>
        <p style={{ color: subject.color, fontWeight: 700, fontSize: 20, margin: 0, direction: "rtl" }}>Claude AI يحضّر أسئلتك…</p>
        <p style={{ color: C.muted, fontSize: 13, marginTop: 6, direction: "rtl" }}>لحظة يا بطل! 🌟</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: subject.color, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{transform:scale(0.6);opacity:0.4}50%{transform:scale(1.2);opacity:1}}`}</style>
    </div>
  );
}

// ─── Quiz ─────────────────────────────────────────────────────────
function QuizScreen({ subject, level, questions, onBack, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const q = questions[idx];
  const isRTL = subject.id !== "english";
  const lang = subject.id === "english" ? "en" : "ar";

  useEffect(() => {
    const t = setTimeout(() => speak(q.q, lang), 600);
    return () => { clearTimeout(t); stopSpeech(); };
  }, [idx]);

  function handleSpeak() {
    setSpeaking(true);
    speak(q.q, lang);
    setTimeout(() => setSpeaking(false), 2500);
  }

  function choose(i) {
    if (selected !== null) return;
    const correct = i === q.ans;
    setSelected(i); setFeedback(correct ? "correct" : "wrong");
    playSound(correct ? "correct" : "wrong");
    if (correct) { speak(isRTL ? "ممتاز! إجابة صحيحة!" : "Great job! Correct!", lang); setScore(s => s + 1); }
    else { speak(isRTL ? "حاول مرة أخرى!" : "Try again!", lang); setShake(true); setTimeout(() => setShake(false), 500); }
    setTimeout(() => {
      stopSpeech(); setFeedback(null);
      if (idx + 1 < questions.length) { setIdx(idx + 1); setSelected(null); setTimeout(() => speak(questions[idx + 1]?.q, lang), 700); }
      else onComplete(score + (correct ? 1 : 0));
    }, 1400);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => { stopSpeech(); onBack(); }} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: C.text, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>← رجوع</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ background: level.color + "22", color: level.color, borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>{level.emoji} {level.label}</span>
        </div>
        <span style={{ background: subject.color + "22", color: subject.color, borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 13 }}>{idx + 1}/{questions.length}</span>
      </div>
      <ProgressBar pct={((idx + 1) / questions.length) * 100} color={subject.color} height={10} />
      <Card style={{ textAlign: "center", animation: shake ? "shake 0.5s" : "none", border: `2px solid ${subject.color}33` }}>
        {feedback && <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6, color: feedback === "correct" ? C.green : C.red, animation: "popIn 0.3s ease" }}>{feedback === "correct" ? "✅ ممتاز!" : "❌ حاول مرة أخرى!"}</div>}
        <div style={{ fontSize: 58, marginBottom: 10 }}>{q.img}</div>
        <p style={{ fontSize: 20, fontWeight: 700, color: C.text, direction: isRTL ? "rtl" : "ltr", lineHeight: 1.5, margin: "0 0 14px" }}>{q.q}</p>
        <button onClick={handleSpeak} style={{ background: speaking ? subject.color + "33" : "rgba(255,255,255,0.07)", border: `1.5px solid ${subject.color}55`, borderRadius: 99, padding: "8px 20px", color: subject.color, cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 700, transition: "all 0.2s" }}>
          🔊 {isRTL ? "اسمع السؤال" : "Listen"}
        </button>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.opts.map((opt, i) => {
          let bg = C.card2, border = "2px solid rgba(255,255,255,0.07)", color = C.text;
          if (selected !== null) {
            if (i === q.ans) { bg = "#2ECC7120"; border = "2px solid #2ECC71"; color = C.green; }
            else if (i === selected) { bg = "#E74C3C20"; border = "2px solid #E74C3C"; color = C.red; }
          }
          return <button key={i} onClick={() => choose(i)} onMouseEnter={() => selected === null && speak(opt, lang)} style={{ background: bg, border, color, borderRadius: 16, padding: "16px 10px", fontSize: isRTL ? 18 : 16, fontWeight: 700, cursor: selected ? "default" : "pointer", transition: "all 0.25s", direction: isRTL ? "rtl" : "ltr", fontFamily: "inherit", minHeight: 58 }}>{opt}</button>;
        })}
      </div>
      <p style={{ color: C.muted, fontSize: 12, textAlign: "center", direction: "rtl", margin: 0 }}>💡 مرّر على الإجابة لتسمعها</p>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-8px)}50%{transform:translateX(8px)}}@keyframes popIn{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

// ─── Result ───────────────────────────────────────────────────────
function ResultScreen({ score, total, subject, level, child, onRetry, onHome }) {
  const [shareMsg, setShareMsg] = useState(null);
  const pct = Math.round((score / total) * 100);
  const stars = pct === 100 ? 5 : pct >= 80 ? 4 : pct >= 60 ? 3 : pct >= 40 ? 2 : 1;
  const msg = pct === 100 ? "مثالي! أنت نجم! 🌟" : pct >= 60 ? "أحسنت! استمر! 💪" : "لا تستسلم! 🔄";

  async function handleShare() {
    const text = buildShareText(child.name, subject, level, score, total);
    const res = await doShare(text);
    setShareMsg(res === "copied" ? "✅ تم نسخ النتيجة! الصقها في واتساب" : res === "shared" ? "✅ تمت المشاركة!" : "❌ تعذرت المشاركة");
    setTimeout(() => setShareMsg(null), 4000);
  }

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ fontSize: 72, animation: "popIn 0.5s ease" }}>{pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💡"}</div>
      <Stars count={stars} size={26} />
      <h2 style={{ fontSize: 22, color: subject.color, margin: 0, direction: "rtl" }}>{msg}</h2>
      <Card style={{ padding: "20px 30px", border: `2px solid ${subject.color}44`, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: subject.color }}>{score}/{total}</div>
            <div style={{ color: C.muted, fontSize: 13, direction: "rtl" }}>إجابة صحيحة</div>
          </div>
          <div style={{ width: 1, height: 50, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: level.color }}>{pct}%</div>
            <Badge label={`${level.emoji} ${level.label}`} color={level.color} />
          </div>
        </div>
      </Card>
      <p style={{ color: C.muted, fontSize: 13, direction: "rtl", margin: 0 }}>✅ تم حفظ نتيجتك تلقائياً</p>
      <button onClick={handleShare} style={{ background: "linear-gradient(135deg,#25D366,#128C7E)", border: "none", color: "#fff", borderRadius: 14, padding: "14px 28px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        📤 شارك النتيجة مع الأهل
      </button>
      {shareMsg && <div style={{ background: "rgba(46,204,113,0.15)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: 12, padding: "10px 20px", color: C.green, fontWeight: 700, fontSize: 14, width: "100%", direction: "rtl" }}>{shareMsg}</div>}
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <Btn onClick={onRetry} style={{ flex: 1 }}>🔄 مجدداً</Btn>
        <Btn onClick={onHome} outline color={C.muted} style={{ flex: 1, color: C.muted }}>🏠 الرئيسية</Btn>
      </div>
      <style>{`@keyframes popIn{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

// ─── Child Progress ───────────────────────────────────────────────
function ChildProgress({ child, onBack }) {
  const stats = getStats(child);
  if (!stats) return (
    <div style={{ textAlign: "center", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 52 }}>📭</div>
      <p style={{ color: C.muted, direction: "rtl" }}>لم تبدأ أي جلسة بعد!</p>
      <Btn onClick={onBack}>ارجع وابدأ التعلم</Btn>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: C.text, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>← رجوع</button>
        <Avatar src={child.avatar} name={child.name} size={36} />
        <h2 style={{ color: C.text, margin: 0, fontWeight: 800, direction: "rtl" }}>تقدم {child.name}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[{ l: "جلسات", v: stats.total, c: C.blue }, { l: "متوسط", v: stats.avgPct + "%", c: C.accent }, { l: "🔥 سلسلة", v: stats.streak, c: C.green }].map(x => (
          <Card key={x.l} style={{ textAlign: "center", padding: "14px 8px" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: x.c }}>{x.v}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2, direction: "rtl" }}>{x.l}</div>
          </Card>
        ))}
      </div>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", direction: "rtl", fontWeight: 800, fontSize: 16 }}>📊 حسب المادة</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {SUBJECTS.map(s => {
            const ss = stats.bySubject[s.id];
            return (
              <div key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, direction: "rtl" }}>
                  <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{s.emoji} {s.label}</span>
                  {ss ? <span style={{ color: s.color, fontWeight: 700, fontSize: 13 }}>{ss.avg}% · {ss.count} جلسة</span> : <span style={{ color: C.muted, fontSize: 12 }}>لم يبدأ</span>}
                </div>
                <ProgressBar pct={ss ? ss.avg : 0} color={s.color} />
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 12px", direction: "rtl", fontWeight: 800, fontSize: 16 }}>🕐 آخر الجلسات</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.recent.map((s, i) => {
            const subj = SUBJECTS.find(x => x.id === s.subjectId);
            const lv = LEVELS.find(x => x.id === s.levelId);
            const st = s.pct === 100 ? 5 : s.pct >= 80 ? 4 : s.pct >= 60 ? 3 : s.pct >= 40 ? 2 : 1;
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.bg, borderRadius: 12, direction: "rtl" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{subj?.emoji}</span>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>{subj?.label}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      {lv && <span style={{ background: lv.color + "22", color: lv.color, borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{lv.emoji} {lv.label}</span>}
                      <span style={{ color: C.muted, fontSize: 11 }}>{new Date(s.date).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: subj?.color, fontWeight: 800, fontSize: 15 }}>{s.score}/{s.total}</div>
                  <Stars count={st} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Parent Dashboard ─────────────────────────────────────────────
function ParentDashboard({ progress, onBack }) {
  const children = Object.entries(progress);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: C.text, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>← رجوع</button>
        <h2 style={{ color: C.text, margin: 0, fontWeight: 800, direction: "rtl" }}>📊 لوحة تحكم الأهل</h2>
      </div>
      {children.length === 0 ? <div style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 52 }}>👨‍👩‍👧</div><p style={{ color: C.muted, direction: "rtl" }}>لا يوجد أطفال مسجلين بعد</p></div>
        : children.map(([id, child]) => {
          const stats = getStats(child);
          return (
            <Card key={id} style={{ border: "1px solid rgba(245,168,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", direction: "rtl", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar src={child.avatar} name={child.name} size={52} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: C.text }}>{child.name}</div>
                    <div style={{ color: C.muted, fontSize: 12 }}>{child.age === "young" ? "٣-٦ سنوات" : "٦-١٠ سنوات"}</div>
                  </div>
                </div>
                {stats && <Badge label={`🔥 ${stats.streak} يوم`} color={C.accent} />}
              </div>
              {stats ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                    <div style={{ background: C.bg, borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>{stats.total}</div>
                      <div style={{ fontSize: 11, color: C.muted, direction: "rtl" }}>إجمالي الجلسات</div>
                    </div>
                    <div style={{ background: C.bg, borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{stats.avgPct}%</div>
                      <div style={{ fontSize: 11, color: C.muted, direction: "rtl" }}>متوسط الدرجات</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {SUBJECTS.map(s => {
                      const ss = stats.bySubject[s.id];
                      return (
                        <div key={s.id} style={{ direction: "rtl" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: C.muted }}>{s.emoji} {s.label}</span>
                            <span style={{ color: ss ? s.color : C.muted, fontWeight: 700 }}>{ss ? `${ss.avg}%` : "—"}</span>
                          </div>
                          <ProgressBar pct={ss ? ss.avg : 0} color={s.color} height={6} />
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : <p style={{ color: C.muted, fontSize: 13, direction: "rtl", textAlign: "center", margin: 0 }}>لم يبدأ أي جلسة بعد</p>}
            </Card>
          );
        })}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────
export default function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [screen, setScreen] = useState("welcome");
  const [activeChildId, setActiveChildId] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeLevel, setActiveLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [error, setError] = useState(null);
  const activeChild = progress[activeChildId];

  const fetchQuestions = useCallback(async (subject, level) => {
    setActiveSubject(subject); setActiveLevel(level);
    setScreen("loading"); setError(null);
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: buildPrompt(subject.id, activeChild?.age || "old", level.id) }] }) });
      const data = await res.json();
      const raw = data?.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (!Array.isArray(parsed) || !parsed.length) throw new Error();
      setQuestions(parsed); setScreen("quiz");
    } catch {
      setError("مشكلة في توليد الأسئلة. تأكد من الاتصال.");
      setScreen("error");
    }
  }, [activeChild]);

  function handleAddChild(id, child) {
    const updated = { ...progress, [id]: child };
    setProgress(updated); saveProgress(updated);
    setActiveChildId(id); setScreen("subjects");
  }

  function handleComplete(score) {
    setFinalScore(score);
    setProgress(prev => recordSession(prev, activeChildId, activeSubject.id, activeLevel.id, score, questions.length));
    setScreen("result");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Tajawal','Cairo','Segoe UI',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480, background: C.card, borderRadius: 32, padding: 26, boxShadow: "0 32px 100px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
        {screen === "welcome"       && <WelcomeScreen progress={progress} onSelectChild={id => { setActiveChildId(id); setScreen("subjects"); }} onAddChild={() => setScreen("addChild")} onParentDash={() => setScreen("parentDash")} />}
        {screen === "addChild"      && <AddChildScreen onSave={handleAddChild} onBack={() => setScreen("welcome")} />}
        {screen === "subjects"      && activeChild && <SubjectHome child={activeChild} onPickSubject={s => { setActiveSubject(s); setScreen("levels"); }} onBack={() => setScreen("welcome")} onViewProgress={() => setScreen("childProgress")} />}
        {screen === "levels"        && activeSubject && <LevelSelector subject={activeSubject} onSelect={lv => fetchQuestions(activeSubject, lv)} onBack={() => setScreen("subjects")} />}
        {screen === "loading"       && activeSubject && <LoadingScreen subject={activeSubject} />}
        {screen === "quiz"          && questions.length > 0 && <QuizScreen subject={activeSubject} level={activeLevel} questions={questions} onBack={() => setScreen("levels")} onComplete={handleComplete} />}
        {screen === "result"        && <ResultScreen score={finalScore} total={questions.length} subject={activeSubject} level={activeLevel} child={activeChild} onRetry={() => fetchQuestions(activeSubject, activeLevel)} onHome={() => setScreen("subjects")} />}
        {screen === "childProgress" && activeChild && <ChildProgress child={activeChild} onBack={() => setScreen("subjects")} />}
        {screen === "parentDash"    && <ParentDashboard progress={progress} onBack={() => setScreen("welcome")} />}
        {screen === "error"         && (
          <div style={{ textAlign: "center", padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 56 }}>😕</div>
            <p style={{ color: C.red, fontWeight: 700, direction: "rtl" }}>{error}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => fetchQuestions(activeSubject, activeLevel)}>🔄 حاول مجدداً</Btn>
              <Btn onClick={() => setScreen("subjects")} outline color={C.muted} style={{ color: C.muted }}>رجوع</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
