import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ─── Design System (Warm Beige + Fos7a Orange) ────────────────────
const C = {
  bg:       "#F9F0EB",
  bg2:      "#F2E8E2",
  card:     "#FFFFFF",
  orange:   "#C85A00",
  orangeMid:"#E06B00",
  orangeBtn:"#B84E00",
  orangeLt: "#FFF0E8",
  green:    "#1A7A6E",
  greenLt:  "#D4F5F0",
  yellow:   "#F5B800",
  yellowLt: "#FFF8DC",
  red:      "#DC2626",
  text:     "#2C1810",
  muted:    "#8A7570",
  border:   "rgba(0,0,0,0.08)",
  shadow:   "0 4px 20px rgba(0,0,0,0.07)",
  shadowHover: "0 12px 32px rgba(200,90,0,0.15)",
};
const FONT = "'Tajawal','Cairo',sans-serif";

const CSS = `
  @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes popIn   { from{opacity:0;transform:scale(.6) rotate(-6deg)} to{opacity:1;transform:scale(1) rotate(0)} }
  @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
  @keyframes shake   { 0%,100%{transform:translateX(0)} 25%,75%{transform:translateX(-7px)} 50%{transform:translateX(7px)} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes checkPop{ 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  .shimmer-text {
    background: linear-gradient(90deg,#C85A00 25%,#F28C00 50%,#C85A00 75%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 2.5s linear infinite;
  }
`;

// ─── Data ────────────────────────────────────────────────────────
const SUBJECTS = [
  { id:"arabic",  label:"اللغة العربية", labelShort:"عربي",  emoji:"🐻", color:C.orange, bg:C.orangeLt, desc:"حروف وكلمات وجمل",        level:"المستوى ٤", prog:75,  progColor:C.orange  },
  { id:"english", label:"English",       labelShort:"English",emoji:"🦊", color:"#8B7A00",bg:"#FFF8DC",  desc:"Letters, Words & Sentences", level:"Level 2",   prog:30,  progColor:C.yellow  },
  { id:"math",    label:"الرياضيات",     labelShort:"رياضيات",emoji:"🤓", color:C.green,  bg:C.greenLt,  desc:"أسرار الأرقام والحساب!",    level:"المستوى ٨", prog:92,  progColor:C.green   },
];
const LEVELS = [
  { id:"easy",   label:"سهل",   emoji:"🌱", color:C.green,  bg:C.greenLt  },
  { id:"medium", label:"متوسط", emoji:"⭐", color:"#D97706", bg:"#FFF8EB"  },
  { id:"hard",   label:"صعب",   emoji:"🔥", color:C.red,    bg:"#FFEBEB"  },
];
const ARABIC_LETTERS = [
  { id:"alef",letter:"أ",name:"الألف",color:C.orange,  sound:"آ",  words:[{word:"أَسَد",emoji:"🦁",meaning:"Lion"},{word:"أُمّ",emoji:"👩",meaning:"Mother"},{word:"أَرْنَب",emoji:"🐰",meaning:"Rabbit"}],examples:["أَحْمَد","أَزْرَق","أَخ"]},
  { id:"ba",  letter:"ب",name:"الباء",color:"#2563EB",  sound:"بَ", words:[{word:"بَطَّة",emoji:"🦆",meaning:"Duck"},{word:"بَيْت",emoji:"🏠",meaning:"House"},{word:"بَقَرة",emoji:"🐄",meaning:"Cow"}],examples:["بَاب","كِتَاب","حَبّ"]},
  { id:"ta",  letter:"ت",name:"التاء",color:"#7C3AED",  sound:"تَ", words:[{word:"تُفَّاحة",emoji:"🍎",meaning:"Apple"},{word:"تِمْسَاح",emoji:"🐊",meaning:"Crocodile"},{word:"تَمْر",emoji:"🌴",meaning:"Dates"}],examples:["تَاج","بَيْت","نَبَات"]},
  { id:"tha", letter:"ث",name:"الثاء",color:C.green,    sound:"ثَ", words:[{word:"ثَعْلَب",emoji:"🦊",meaning:"Fox"},{word:"ثَلاثة",emoji:"3️⃣",meaning:"Three"},{word:"ثَلْج",emoji:"❄️",meaning:"Snow"}],examples:["ثَوْب","حَديث","لَيْث"]},
  { id:"jim", letter:"ج",name:"الجيم",color:"#DC2626",  sound:"جَ", words:[{word:"جَمَل",emoji:"🐪",meaning:"Camel"},{word:"جَبَل",emoji:"⛰️",meaning:"Mountain"},{word:"جَزَرة",emoji:"🥕",meaning:"Carrot"}],examples:["جَار","شَجَر","مَسْجِد"]},
  { id:"ha",  letter:"ح",name:"الحاء",color:"#D97706",  sound:"حَ", words:[{word:"حِصَان",emoji:"🐴",meaning:"Horse"},{word:"حَوْت",emoji:"🐳",meaning:"Whale"},{word:"حَمَامة",emoji:"🕊️",meaning:"Dove"}],examples:["حَب","صَحْن","مِلْح"]},
  { id:"kha", letter:"خ",name:"الخاء",color:"#7C3AED",  sound:"خَ", words:[{word:"خَروف",emoji:"🐑",meaning:"Sheep"},{word:"خُبْز",emoji:"🍞",meaning:"Bread"},{word:"خَيْمة",emoji:"⛺",meaning:"Tent"}],examples:["خَال","نَخْل","شَيْخ"]},
  { id:"dal", letter:"د",name:"الدال",color:C.green,    sound:"دَ", words:[{word:"دُبّ",emoji:"🐻",meaning:"Bear"},{word:"دَجَاجة",emoji:"🐔",meaning:"Chicken"},{word:"دَفْتَر",emoji:"📓",meaning:"Notebook"}],examples:["دَار","وَلَد","عَيْد"]},
];
const ENGLISH_LETTERS = [
  { id:"a",letter:"A",name:"Letter A",color:C.orange,  sound:"Ah/Ay",words:[{word:"Apple",emoji:"🍎",meaning:"تفاحة"},{word:"Ant",emoji:"🐜",meaning:"نملة"},{word:"Airplane",emoji:"✈️",meaning:"طيارة"}],examples:["Apple","Ant","Animal"]},
  { id:"b",letter:"B",name:"Letter B",color:"#2563EB",  sound:"Buh",  words:[{word:"Ball",emoji:"⚽",meaning:"كرة"},{word:"Butterfly",emoji:"🦋",meaning:"فراشة"},{word:"Bear",emoji:"🐻",meaning:"دب"}],examples:["Ball","Bee","Banana"]},
  { id:"c",letter:"C",name:"Letter C",color:"#7C3AED",  sound:"Kuh",  words:[{word:"Cat",emoji:"🐱",meaning:"قطة"},{word:"Car",emoji:"🚗",meaning:"سيارة"},{word:"Cake",emoji:"🎂",meaning:"كيكة"}],examples:["Cat","Cow","Camel"]},
  { id:"d",letter:"D",name:"Letter D",color:C.green,    sound:"Duh",  words:[{word:"Dog",emoji:"🐕",meaning:"كلب"},{word:"Duck",emoji:"🦆",meaning:"بطة"},{word:"Door",emoji:"🚪",meaning:"باب"}],examples:["Dog","Deer","Dolphin"]},
  { id:"e",letter:"E",name:"Letter E",color:"#DC2626",  sound:"Eh/Ee",words:[{word:"Elephant",emoji:"🐘",meaning:"فيل"},{word:"Egg",emoji:"🥚",meaning:"بيضة"},{word:"Eagle",emoji:"🦅",meaning:"نسر"}],examples:["Egg","Elephant","Earth"]},
  { id:"f",letter:"F",name:"Letter F",color:"#D97706",  sound:"Fuh",  words:[{word:"Fish",emoji:"🐟",meaning:"سمكة"},{word:"Flower",emoji:"🌸",meaning:"زهرة"},{word:"Frog",emoji:"🐸",meaning:"ضفدع"}],examples:["Fish","Fox","Frog"]},
];

// ─── Utils ────────────────────────────────────────────────────────
function sanitize(s){if(typeof s!=="string")return"";return s.replace(/[<>&"'`]/g,"").trim().slice(0,100);}
function validateEmail(e){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);}
function validateQuestions(p){if(!Array.isArray(p)||p.length<1||p.length>10)return false;return p.every(q=>typeof q.q==="string"&&q.q.length<300&&Array.isArray(q.opts)&&q.opts.length===4&&q.opts.every(o=>typeof o==="string"&&o.length<100)&&typeof q.ans==="number"&&q.ans>=0&&q.ans<=3);}
function gaEvent(n,p={}){try{window.gtag?.("event",n,p);}catch{}}

function playSound(type){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();const t=ctx.currentTime;
    if(type==="correct"){[[523,.0],[659,.1],[784,.2],[1047,.3]].forEach(([f,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(.28,t+d+.05);g.gain.exponentialRampToValueAtTime(.001,t+d+.3);o.start(t+d);o.stop(t+d+.3);});}
    else if(type==="wrong"){[[349,.0],[261,.2]].forEach(([f,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sawtooth";o.frequency.setValueAtTime(f,t+d);o.frequency.linearRampToValueAtTime(f*.8,t+d+.25);g.gain.setValueAtTime(.2,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.3);o.start(t+d);o.stop(t+d+.3);});}
    else if(type==="complete"){[523,659,784,659,784,1046].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.25,t+i*.1);g.gain.exponentialRampToValueAtTime(.001,t+i*.1+.22);o.start(t+i*.1);o.stop(t+i*.1+.22);});}
    else if(type==="click"){const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=1200;g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);o.start(t);o.stop(t+.06);}
  }catch{}
}
function speak(text,lang="ar"){
  try{window.speechSynthesis?.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang==="ar"?"ar-SA":"en-US";u.rate=.82;u.pitch=1.15;u.volume=1;const voices=window.speechSynthesis?.getVoices()||[];const v=voices.find(v=>v.lang.startsWith(lang==="ar"?"ar":"en"))||null;if(v)u.voice=v;window.speechSynthesis?.speak(u);}catch{}
}

const QTYPES={arabic:["الحروف الهجائية","الكلمات البسيطة","الألوان","الحيوانات","الفواكه"],english:["alphabet letters","simple words","colors","animals","fruits"],math:["جمع ١-١٠","طرح ١-١٠","عد الأشياء","مقارنة الأعداد"]};
function buildPrompt(sid,age,lid){if(!QTYPES[sid])return null;const topic=QTYPES[sid][Math.floor(Math.random()*QTYPES[sid].length)];const ageLabel=age==="young"?"٣ إلى ٦ سنوات":"٦ إلى ١٠ سنوات";const diff={easy:"بسيطة جداً",medium:"متوسطة",hard:"صعبة"}[lid]||"بسيطة";const base={arabic:`أنت مساعد تعليمي للأطفال السودانيين. اصنع 5 أسئلة باللغة العربية لطفل عمره ${ageLabel}. الموضوع: ${topic}. الصعوبة: ${diff}.`,english:`Educational assistant. Create 5 English questions for a child aged ${ageLabel}. Topic: ${topic}. Difficulty: ${diff}.`,math:`مساعد تعليمي. اصنع 5 أسئلة رياضيات لطفل عمره ${ageLabel}. الموضوع: ${topic}. الصعوبة: ${diff}.`};return `${base[sid]}\n\nJSON فقط:\n[{"q":"سؤال","opts":["أ","ب","ج","د"],"ans":0,"img":"🎯"}]\n- ans = رقم الإجابة (0-3)\n- محتوى آمن 100%`;}

// ─── Shared UI Atoms ──────────────────────────────────────────────
function ProgBar({pct,color,h=8}){return <div style={{background:"#E5D8D0",borderRadius:99,height:h,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,pct))}%`,background:`linear-gradient(90deg,${color},${color}CC)`,borderRadius:99,transition:"width .8s cubic-bezier(.4,0,.2,1)",boxShadow:`0 2px 6px ${color}66`}}/></div>;}

function StarsBadge({count=120}){return <div style={{background:C.yellowLt,border:"1.5px solid rgba(245,184,0,.35)",borderRadius:99,padding:"5px 10px",display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:15}}>⭐</span><span style={{fontWeight:900,fontSize:13,color:"#8A6000"}}>{count}</span></div>;}

function BackBtn({onClick,label="← رجوع"}){return <button onClick={()=>{playSound("click");onClick?.();}} style={{background:C.bg2,border:"none",borderRadius:99,padding:"9px 16px",fontWeight:800,fontSize:14,color:C.text,cursor:"pointer",fontFamily:FONT,display:"flex",alignItems:"center",gap:6,transition:"all .2s"}} onMouseEnter={e=>e.currentTarget.style.background=C.orangeLt} onMouseLeave={e=>e.currentTarget.style.background=C.bg2}>{label}</button>;}

function BtnPrimary({children,onClick,disabled,full,style={}}){return <button onClick={()=>{if(!disabled){playSound("click");onClick?.();}}} disabled={disabled} style={{background:disabled?"#D4C4BB":`linear-gradient(135deg,${C.orangeBtn},#A84500)`,color:"white",border:"none",borderRadius:99,padding:"15px 28px",fontWeight:800,fontSize:17,cursor:disabled?"not-allowed":"pointer",fontFamily:FONT,width:full?"100%":undefined,boxShadow:disabled?"none":`0 6px 20px rgba(184,78,0,.4),inset 0 1px 0 rgba(255,255,255,.15)`,transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:10,...style}} onMouseEnter={e=>{if(!disabled)e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>{children}</button>;}

function BtnGreen({children,onClick,style={}}){return <button onClick={()=>{playSound("click");onClick?.();}} style={{background:`linear-gradient(135deg,${C.green},#1FA090)`,color:"white",border:"none",borderRadius:99,padding:"13px 24px",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:FONT,boxShadow:`0 5px 16px rgba(26,122,110,.4)`,transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,...style}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>{children}</button>;}

function BtnOutline({children,onClick,style={}}){return <button onClick={()=>{playSound("click");onClick?.();}} style={{background:"white",border:`2px solid ${C.border}`,borderRadius:99,padding:"13px 20px",fontWeight:800,fontSize:15,color:C.text,cursor:"pointer",fontFamily:FONT,transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,...style}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.orange;e.currentTarget.style.color=C.orange;e.currentTarget.style.background=C.orangeLt;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text;e.currentTarget.style.background="white";}}>{children}</button>;}

function Card({children,style={},onClick}){return <div onClick={onClick} style={{background:C.card,borderRadius:24,border:`1.5px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden",transition:"all .25s",cursor:onClick?"pointer":undefined,...style}} onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=C.shadowHover;}}} onMouseLeave={e=>{if(onClick){e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=C.shadow;}}}>{children}</div>;}

function LetterCircle({letter,size=52,color=C.orange}){return <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${color},${color}CC)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.45,fontWeight:900,color:"white",boxShadow:`0 6px 20px ${color}55`,flexShrink:0}}>{letter}</div>;}

function SpellBlock({letter,active,delay=0}){return <div style={{width:52,height:52,borderRadius:14,border:`2px solid ${active?C.orange:C.border}`,background:active?C.orangeLt:C.bg2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:active?C.orange:C.text,transition:"all .25s",boxShadow:active?`0 4px 12px ${C.orange}33`:"none",animation:`popIn .5s cubic-bezier(.175,.885,.32,1.275) ${delay}s both`}}>{letter}</div>;}

// ─── Toast ───────────────────────────────────────────────────────
function Toast({msg}){if(!msg)return null;return <div style={{position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",zIndex:9999,animation:"popIn .3s ease both"}}><div style={{background:C.text,color:"white",borderRadius:99,padding:"10px 22px",display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 32px rgba(0,0,0,.25)",fontFamily:FONT,fontWeight:700,fontSize:14,whiteSpace:"nowrap"}}>{msg}</div></div>;}

// ─── TabBar ────────────────────────────────────────────────────────
function TabBar({active,onTab}){
  const tabs=[{id:"home",icon:"🏠",label:"الرئيسية"},{id:"journey",icon:"🗺️",label:"دروسي"},{id:"quiz",icon:"🎯",label:"إنجازاتي"},{id:"profile",icon:"👤",label:"حسابي"}];
  return <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"white",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"8px 0 16px",zIndex:200,fontFamily:FONT}}>
    {tabs.map((t,i)=>{
      const isActive=active===t.id;
      if(i===1)return <div key="home-center" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:1}}>
        <div onClick={()=>{playSound("click");onTab(t.id);}} style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${C.orange},#F28C00)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 4px 16px ${C.orange}55`,marginTop:-22,cursor:"pointer"}}>{t.icon}</div>
        <span style={{fontSize:10,fontWeight:700,color:isActive?C.orange:C.muted}}>{t.label}</span>
      </div>;
      return <div key={t.id} onClick={()=>{playSound("click");onTab(t.id);}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",flex:1,padding:"4px 0"}}>
        <span style={{fontSize:20,opacity:isActive?1:.55}}>{t.icon}</span>
        <span style={{fontSize:10,fontWeight:700,color:isActive?C.orange:C.muted}}>{t.label}</span>
      </div>;
    })}
  </div>;
}

// ─── Auth Screen ──────────────────────────────────────────────────
function AuthScreen({onAuth}){
  const [mode,setMode]=useState("login");const [email,setEmail]=useState("");const [otp,setOtp]=useState("");const [loading,setLoading]=useState(false);const [error,setError]=useState("");const [msg,setMsg]=useState("");
  async function sendOTP(){const clean=sanitize(email).toLowerCase();if(!validateEmail(clean)){setError("يرجى إدخال بريد إلكتروني صحيح ✉️");return;}setLoading(true);setError("");const{error:err}=await supabase.auth.signInWithOtp({email:clean,options:{shouldCreateUser:true}});setLoading(false);if(err){setError("تعذر إرسال الرمز.");return;}setMsg(clean);setMode("otp");gaEvent("send_otp");}
  async function verifyOTP(){if(otp.length<6){setError("الرمز 6 أرقام");return;}setLoading(true);setError("");const{data,error:err}=await supabase.auth.verifyOtp({email:sanitize(email).toLowerCase(),token:otp,type:"email"});setLoading(false);if(err){setError("رمز غير صحيح ❌");return;}gaEvent("login_success");onAuth(data.user);}
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:FONT}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400,animation:"fadeUp .5s ease both"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:64,marginBottom:4,animation:"float 3s ease-in-out infinite",display:"inline-block"}}>🇸🇩</div>
          <h1 style={{fontSize:44,fontWeight:900,color:C.orange,margin:"0 0 4px"}}>فُسحة</h1>
          <p style={{color:C.muted,fontSize:14,fontWeight:600}}>منصة تعليمية مجانية للأطفال السودانيين</p>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {["📖 عربي","🔤 English","🔢 رياضيات"].map(s=><span key={s} style={{background:C.card,color:C.text,borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:700,border:`1px solid ${C.border}`}}>{s}</span>)}
          </div>
        </div>
        <Card style={{padding:24}}>
          <div style={{display:"flex",flexDirection:"column",gap:16,direction:"rtl"}}>
            {mode==="login"?(<>
              <div><h2 style={{fontWeight:900,fontSize:20,color:C.text,margin:"0 0 4px"}}>أهلاً بك! 👋</h2><p style={{color:C.muted,fontSize:13}}>أدخل بريدك الإلكتروني للبدء</p></div>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@gmail.com" style={{background:C.bg2,border:`2px solid ${C.border}`,borderRadius:14,padding:"13px 16px",color:C.text,fontSize:16,fontFamily:FONT,outline:"none",direction:"ltr",width:"100%",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.border}/>
              {error&&<div style={{background:"#FFF0F0",border:"1px solid #FFD0D0",borderRadius:12,padding:"10px 14px",color:C.red,fontSize:13,fontWeight:600}}>{error}</div>}
              <BtnPrimary onClick={sendOTP} disabled={loading||!email} full>{loading?"⏳ جاري الإرسال...":"📨 إرسال رمز التحقق"}</BtnPrimary>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#F0FFF8",borderRadius:12,padding:"10px 14px"}}><span>🔒</span><span style={{color:C.green,fontSize:12,fontWeight:700}}>تسجيل دخول آمن بدون كلمة مرور</span></div>
            </>):(<>
              <div><h2 style={{fontWeight:900,fontSize:20,color:C.text,margin:"0 0 4px"}}>تحقق من بريدك ✉️</h2><p style={{color:C.muted,fontSize:13}}>أرسلنا رمزاً من 6 أرقام إلى {msg}</p></div>
              <div style={{display:"flex",justifyContent:"center",gap:8,direction:"ltr"}}>{[...Array(6)].map((_,i)=><div key={i} style={{width:44,height:52,borderRadius:12,border:`2px solid ${otp[i]?C.orange:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:C.text,background:otp[i]?C.orangeLt:C.bg2}}>{otp[i]||""}</div>)}</div>
              <input type="text" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder="أدخل الرمز" maxLength={6} style={{background:C.bg2,border:`2px solid ${C.border}`,borderRadius:14,padding:"13px 16px",color:C.text,fontSize:20,fontFamily:FONT,outline:"none",textAlign:"center",letterSpacing:8,direction:"ltr"}} onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.border}/>
              {error&&<div style={{background:"#FFF0F0",border:"1px solid #FFD0D0",borderRadius:12,padding:"10px 14px",color:C.red,fontSize:13,fontWeight:600}}>{error}</div>}
              <BtnPrimary onClick={verifyOTP} disabled={loading||otp.length<6} full>{loading?"⏳ جاري التحقق...":"✅ تأكيد الدخول"}</BtnPrimary>
              <button onClick={()=>{setMode("login");setError("");setOtp("");}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontFamily:FONT,fontWeight:600,textAlign:"center"}}>← تغيير البريد</button>
            </>)}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Setup Profile ────────────────────────────────────────────────
function SetupProfile({user,onSave}){
  const [name,setName]=useState("");const [loading,setLoading]=useState(false);
  async function save(){const clean=sanitize(name);if(!clean)return;setLoading(true);await supabase.from("profiles").upsert({id:user.id,email:user.email,parent_name:clean,created_at:new Date().toISOString()});setLoading(false);onSave({id:user.id,email:user.email,parent_name:clean});}
  return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:FONT}}><style>{CSS}</style><div style={{width:"100%",maxWidth:400,animation:"fadeUp .5s ease both"}}><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:64,marginBottom:8}}>👨‍👩‍👧</div><h2 style={{color:C.text,fontWeight:900,fontSize:26,margin:"0 0 4px"}}>أهلاً بك في فُسحة!</h2><p style={{color:C.muted,fontSize:14,fontWeight:600}}>كيف نناديك؟</p></div><Card style={{padding:24}}><div style={{display:"flex",flexDirection:"column",gap:16,direction:"rtl"}}><input value={name} onChange={e=>setName(e.target.value)} placeholder="مثال: أم أحمد" maxLength={50} style={{background:C.bg2,border:`2px solid ${C.border}`,borderRadius:14,padding:"13px 16px",color:C.text,fontSize:16,fontFamily:FONT,outline:"none",direction:"rtl"}} onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.border}/><BtnPrimary onClick={save} disabled={loading||!sanitize(name)} full>{loading?"⏳ جاري الحفظ...":"🚀 ابدأ الرحلة التعليمية"}</BtnPrimary></div></Card></div></div>);
}

// ─── Add Child ────────────────────────────────────────────────────
function AddChildScreen({userId,onSave,onBack}){
  const [name,setName]=useState("");const [age,setAge]=useState("old");const [loading,setLoading]=useState(false);
  async function save(){const clean=sanitize(name);if(!clean)return;setLoading(true);const{data}=await supabase.from("children").insert({parent_id:userId,name:clean,age,created_at:new Date().toISOString()}).select().single();setLoading(false);if(data){gaEvent("add_child");onSave(data);}}
  return(<div style={{minHeight:"100vh",background:C.bg,padding:24,fontFamily:FONT}}><style>{CSS}</style><div style={{maxWidth:400,margin:"0 auto",paddingTop:40,animation:"fadeUp .4s ease both"}}><BackBtn onClick={onBack} label="← رجوع"/><h2 style={{color:C.text,fontWeight:900,fontSize:22,margin:"20px 0 16px",direction:"rtl"}}>إضافة طفل جديد 👶</h2><Card style={{padding:24}}><div style={{display:"flex",flexDirection:"column",gap:20,direction:"rtl"}}><div><label style={{color:C.text,fontSize:14,fontWeight:700,display:"block",marginBottom:8}}>اسم الطفل</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="مثال: أحمد" maxLength={30} style={{background:C.bg2,border:`2px solid ${C.border}`,borderRadius:14,padding:"13px 16px",color:C.text,fontSize:16,fontFamily:FONT,outline:"none",direction:"rtl",width:"100%",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.border}/></div><div><label style={{color:C.text,fontSize:14,fontWeight:700,display:"block",marginBottom:10}}>الفئة العمرية</label><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[{v:"young",l:"٣ - ٦ سنوات",e:"🧒",c:C.orange},{v:"old",l:"٦ - ١٠ سنوات",e:"👦",c:"#2563EB"}].map(a=><button key={a.v} onClick={()=>setAge(a.v)} style={{background:age===a.v?a.c+"18":C.bg2,border:`2.5px solid ${age===a.v?a.c:C.border}`,borderRadius:16,padding:"18px 10px",cursor:"pointer",color:age===a.v?a.c:C.muted,fontWeight:800,fontSize:14,fontFamily:FONT,transition:"all .2s"}}><div style={{fontSize:32,marginBottom:6}}>{a.e}</div>{a.l}</button>)}</div></div><BtnPrimary onClick={save} disabled={loading||!sanitize(name)} full>{loading?"⏳ جاري الحفظ...":"✅ حفظ وابدأ التعلم"}</BtnPrimary></div></Card></div></div>);
}

// ─── HOME SCREEN ──────────────────────────────────────────────────
function HomeScreen({profile,children,onAddChild,onSelectChild,onTabChange}){
  return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,paddingBottom:90}}>
    <style>{CSS}</style>
    {/* Nav */}
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(249,240,235,.92)",backdropFilter:"blur(18px)",borderBottom:`1px solid rgba(200,90,0,.1)`,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <StarsBadge/>
      <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:18,color:C.orange}}>فُسحة</div><div style={{fontSize:11,color:C.muted,fontWeight:600}}>أهلاً، {profile?.parent_name}!</div></div>
      <div style={{width:38,height:38,borderRadius:"50%",background:C.orangeLt,border:`2px solid rgba(200,90,0,.15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,overflow:"hidden",cursor:"pointer"}}>👦</div>
    </div>
    <div style={{padding:"18px 18px 0"}}>
      {/* Title */}
      <div style={{animation:"fadeUp .4s .05s ease both"}}>
        <h1 style={{fontSize:30,fontWeight:900,color:C.text,lineHeight:1.2}}>ساحة التعليم</h1>
        <p style={{color:C.muted,fontSize:13,fontWeight:600,marginTop:4}}>اختر مادتك المفضلة وانطلق في مغامرة جديدة!</p>
      </div>

      {/* Children selector or empty */}
      {children.length===0?<div style={{marginTop:16,animation:"fadeUp .4s .1s ease both"}}><Card style={{padding:32,textAlign:"center",border:`2px dashed ${C.orange}33`}}><div style={{fontSize:52,marginBottom:12}}>👶</div><p style={{color:C.muted,fontSize:14,fontWeight:600}}>أضف طفلك الأول!</p><div style={{marginTop:16}}><BtnPrimary onClick={onAddChild}>+ إضافة طفل</BtnPrimary></div></Card></div>
      :<div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap",animation:"fadeUp .4s .08s ease both"}}>{children.map(child=><button key={child.id} onClick={()=>onSelectChild(child)} style={{background:C.card,border:`2px solid ${C.border}`,borderRadius:14,padding:"8px 14px",cursor:"pointer",fontFamily:FONT,fontWeight:800,fontSize:14,color:C.text,display:"flex",alignItems:"center",gap:8,boxShadow:C.shadow,transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=C.orange;e.currentTarget.style.color=C.orange;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text;}}><span style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.orange},#F28C00)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"white"}}>{child.name[0]}</span>{child.name}</button>)}<button onClick={onAddChild} style={{background:C.orangeLt,border:`2px dashed ${C.orange}44`,borderRadius:14,padding:"8px 14px",cursor:"pointer",fontFamily:FONT,fontWeight:800,fontSize:14,color:C.orange}}>+ إضافة</button></div>}

      {/* Subject cards */}
      <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:14}}>
        {SUBJECTS.map((s,idx)=><div key={s.id} style={{animation:`fadeUp .4s ${.12+idx*.08}s ease both`}}>
          <Card onClick={()=>onTabChange("subjects",s)} style={{borderRight:`6px solid ${s.color}`,overflow:"visible"}}>
            <div style={{display:"flex",alignItems:"stretch"}}>
              <div style={{width:92,minHeight:110,background:`linear-gradient(135deg,${s.bg},${s.bg}CC)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:52,animation:`float ${2.8+idx*.3}s ease-in-out infinite`,animationDelay:`${idx*.2}s`,display:"inline-block"}}>{s.emoji}</span>
              </div>
              <div style={{padding:"14px 16px",flex:1}}>
                <div style={{fontWeight:900,fontSize:18,color:s.color}}>{s.label}</div>
                <div style={{margin:"5px 0 8px"}}><span style={{background:s.bg,color:s.color,borderRadius:99,padding:"2px 10px",fontSize:11,fontWeight:800}}>{s.level}</span></div>
                <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:7}}>{s.id==="english"?"Your Progress":"تقدمك"}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1}}><ProgBar pct={s.prog} color={s.progColor}/></div>
                  <span style={{fontWeight:900,fontSize:13,color:s.color}}>{s.prog}٪</span>
                </div>
              </div>
            </div>
          </Card>
        </div>)}
      </div>

      {/* Daily Challenge */}
      <div style={{marginTop:14,background:`linear-gradient(135deg,${C.yellowLt},#FFF3C0)`,border:`2px solid rgba(245,184,0,.3)`,borderRadius:24,padding:18,display:"flex",alignItems:"center",gap:14,animation:"fadeUp .4s .4s ease both"}}>
        <div style={{width:50,height:50,background:`linear-gradient(135deg,${C.yellow},#FFD740)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 14px rgba(245,184,0,.35)`,animation:"pulse 2s ease-in-out infinite"}}>🏆</div>
        <div style={{flex:1,direction:"rtl"}}>
          <div style={{fontWeight:900,fontSize:16,color:C.text}}>تحدي اليوم</div>
          <p style={{fontSize:12,color:C.muted,marginTop:2}}>أكمل ٣ دروس للحصول على وسام "العبقري"</p>
          <div style={{marginTop:10}}><BtnPrimary onClick={()=>onTabChange("journey")} style={{fontSize:14,padding:"10px 20px",borderRadius:14}}>ابدأ التحدي الآن</BtnPrimary></div>
        </div>
      </div>
    </div>
    <TabBar active="home" onTab={onTabChange}/>
  </div>);
}

// ─── JOURNEY (Subject Menu) ───────────────────────────────────────
function JourneyScreen({child,onPickLesson,onPickQuiz,onBack,onTabChange}){
  const subject=SUBJECTS[0]; // Arabic as default journey
  const letters=ARABIC_LETTERS;
  const completedCount=1; // أ completed
  return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,paddingBottom:90}}>
    <style>{CSS}</style>
    {/* Nav */}
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(249,240,235,.92)",backdropFilter:"blur(18px)",borderBottom:`1px solid rgba(200,90,0,.1)`,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <StarsBadge/>
      <div style={{textAlign:"center"}}><div style={{fontWeight:900,fontSize:16,color:C.orange}}>فُسحة</div><div style={{fontSize:11,color:C.muted,fontWeight:600}}>تقدمك في الرحلة</div></div>
      <BackBtn onClick={onBack} label="← رجوع"/>
    </div>
    {/* Progress strip */}
    <div style={{padding:"12px 18px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,fontWeight:800,color:C.orange}}>اللغة العربية</span><span style={{fontSize:12,fontWeight:700,color:C.muted}}>{completedCount} من {letters.length}</span></div>
      <ProgBar pct={(completedCount/letters.length)*100} color={C.orange}/>
    </div>
    <div style={{padding:"8px 18px",display:"flex",flexDirection:"column",gap:12}}>
      {letters.map((l,idx)=>{
        const isActive=idx===completedCount;const isDone=idx<completedCount;const isLocked=idx>completedCount;
        return <div key={l.id} style={{animation:`fadeUp .4s ${idx*.07}s ease both`}}>
          <div style={{background:C.card,borderRadius:20,border:`2px solid ${isActive?l.color:isDone?"rgba(26,122,110,.3)":C.border}`,boxShadow:isActive?`0 8px 28px ${l.color}33`:C.shadow,padding:"14px 16px",cursor:isLocked?"default":"pointer",opacity:isLocked?.55:1,position:"relative",transition:"all .25s"}}
            onClick={()=>{if(!isLocked){playSound("click");if(isActive||isDone)onPickLesson(l);}}}
            onMouseEnter={e=>{if(!isLocked)e.currentTarget.style.transform="translateY(-2px)";}}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            {isActive&&<div style={{background:`linear-gradient(135deg,${C.orange},#F28C00)`,color:"white",borderRadius:99,fontSize:11,fontWeight:800,padding:"3px 10px",display:"inline-block",marginBottom:8}}>📍 أنت هنا الآن!</div>}
            {isLocked&&<div style={{position:"absolute",top:-8,right:-8,width:26,height:26,borderRadius:"50%",background:C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🔒</div>}
            {isDone&&<div style={{position:"absolute",top:-8,right:-8,width:26,height:26,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,animation:"checkPop .4s ease both"}}>✅</div>}
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <LetterCircle letter={l.letter} size={48} color={isLocked?C.muted:l.color}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,fontSize:16,color:isLocked?C.muted:C.text}}>{l.name}</div>
                <div style={{fontSize:12,color:C.muted,fontWeight:600}}>{isDone?"✓ مكتمل!":isActive?"ابدأ المغامرة":"مقفول"}</div>
              </div>
              {isDone&&<span style={{fontSize:16}}>⭐⭐⭐</span>}
              {isActive&&<button onClick={e=>{e.stopPropagation();playSound("click");onPickLesson(l);}} style={{background:`linear-gradient(135deg,${C.green},#1FA090)`,color:"white",border:"none",borderRadius:99,padding:"9px 18px",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:FONT,boxShadow:`0 4px 12px rgba(26,122,110,.35)`}}>▶ ابدأ</button>}
            </div>
          </div>
        </div>;
      })}
      {/* AI Quiz entry */}
      <div style={{animation:"fadeUp .4s .6s ease both"}}>
        <Card onClick={()=>onPickQuiz()} style={{padding:"16px 18px",border:`2px solid rgba(124,58,237,.2)`}}>
          <div style={{display:"flex",alignItems:"center",gap:14,direction:"rtl"}}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(124,58,237,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🎮</div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:900,fontSize:16,color:C.text}}>اختبار AI تفاعلي</div><div style={{fontSize:12,color:C.muted,fontWeight:600}}>أسئلة مولّدة بالذكاء الاصطناعي</div></div>
            <div style={{marginRight:"auto",color:"#7C3AED",fontSize:18}}>←</div>
          </div>
        </Card>
      </div>
    </div>
    <TabBar active="journey" onTab={onTabChange}/>
  </div>);
}

// ─── LESSON SCREEN ────────────────────────────────────────────────
function LessonScreen({lesson,subject,onComplete,onBack}){
  const [step,setStep]=useState(0);
  const totalSteps=lesson.words.length+2;const isIntro=step===0;const isSummary=step===totalSteps-1;const word=lesson.words[step-1];const lang=subject?.id==="english"?"en":"ar";
  return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,paddingBottom:90}}>
    <style>{CSS}</style>
    {/* Nav */}
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(249,240,235,.92)",backdropFilter:"blur(18px)",borderBottom:`1px solid rgba(200,90,0,.1)`,padding:"12px 18px",display:"flex",alignItems:"center",gap:10}}>
      <button onClick={()=>{playSound("click");onBack();}} style={{width:36,height:36,borderRadius:"50%",background:C.bg2,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>✕</button>
      <div style={{flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,fontWeight:800,color:C.orange}}>الخطوة {step+1} من {totalSteps}</span><span style={{fontSize:12}}>⭐</span></div>
        <ProgBar pct={((step+1)/totalSteps)*100} color={C.green}/>
      </div>
      <StarsBadge/>
    </div>
    <div style={{padding:"16px 18px",display:"flex",flexDirection:"column",gap:14}}>
      {/* Intro step */}
      {isIntro&&<>
        <Card style={{animation:"fadeUp .4s ease both",position:"relative",overflow:"visible"}}>
          <div style={{background:`linear-gradient(135deg,${C.orangeLt},#FFF8F4)`,padding:28,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
            <div style={{position:"relative"}}>
              <div style={{width:160,height:160,borderRadius:24,background:`linear-gradient(135deg,#D4A843,#C08020)`,display:"flex",alignItems:"center",justifyContent:"center",transform:"rotate(2deg)",boxShadow:"0 12px 40px rgba(0,0,0,.15)"}}>
                <span style={{fontSize:86,animation:"float 3s ease-in-out infinite",display:"inline-block",filter:"drop-shadow(0 6px 12px rgba(0,0,0,.2))"}}>{lesson.words[0]?.emoji||"🦁"}</span>
              </div>
              <LetterCircle letter={lesson.letter} size={58} color={lesson.color} style={{position:"absolute",top:-10,right:-10,animation:"popIn .6s .3s cubic-bezier(.175,.885,.32,1.275) both"}}/>
            </div>
            <div style={{background:"white",border:`1.5px solid ${C.border}`,borderRadius:99,padding:"6px 14px",display:"flex",alignItems:"center",gap:6,boxShadow:"0 4px 14px rgba(0,0,0,.08)",animation:"float 2.5s ease-in-out infinite"}}>
              <span>😊</span><span style={{fontSize:12,fontWeight:700,color:C.muted}}>أحسنت! هذا {lesson.words[0]?.word}</span>
            </div>
          </div>
          <div style={{padding:"18px 22px",background:"white"}}>
            <div className="shimmer-text" style={{fontSize:62,fontWeight:900,lineHeight:1,textAlign:"center",marginBottom:6,fontFamily:"Cairo,sans-serif"}}>{lesson.words[0]?.word}</div>
            <p style={{textAlign:"center",color:C.muted,fontSize:14,fontWeight:600}}>حرف <span style={{color:lesson.color,fontWeight:900}}>{lesson.name}</span> في بداية الكلمة</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",margin:"16px 0"}} dir="rtl">
              {[...lesson.words[0]?.word.replace(/[\u064B-\u065F]/g,"")].map((ch,i)=><SpellBlock key={i} letter={ch} active={i===0} delay={i*.1}/>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <BtnGreen onClick={()=>{speak(lesson.words[0]?.word,lang);}} style={{width:"100%",justifyContent:"center",fontSize:17,padding:14}}>🔊 اسمع</BtnGreen>
              <BtnOutline onClick={()=>{}} style={{width:"100%",justifyContent:"center",fontSize:15,padding:12}}>✏️ اكتب</BtnOutline>
            </div>
          </div>
        </Card>
        {/* Tip */}
        <div style={{background:`linear-gradient(135deg,${C.greenLt},#F0FFF8)`,border:`2px solid rgba(26,122,110,.15)`,borderRadius:20,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,animation:"fadeUp .4s .2s ease both"}}>
          <div style={{width:40,height:40,background:"white",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:C.shadow,flexShrink:0}}>💡</div>
          <div dir="rtl"><div style={{fontWeight:900,color:C.green,fontSize:13,marginBottom:3}}>نصيحة سريعة</div><p style={{fontSize:12,color:C.muted,lineHeight:1.5}}>الصوت: <strong style={{color:lesson.color}}>{lesson.sound}</strong> — افتح فمك جيداً!</p></div>
        </div>
      </>}
      {/* Word steps */}
      {!isIntro&&!isSummary&&word&&<Card style={{animation:"popIn .45s ease both"}}>
        <div style={{background:`linear-gradient(135deg,${C.orangeLt},#FFF8F4)`,padding:24,textAlign:"center"}}>
          <p style={{color:C.muted,fontSize:12,fontWeight:700,marginBottom:12}}>كلمة {step} من {lesson.words.length}</p>
          <div style={{fontSize:88,marginBottom:12,animation:"popIn .4s ease both",display:"block"}}>{word.emoji}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:12}}>
            <button onClick={()=>speak(word.word,lang)} style={{width:42,height:42,borderRadius:"50%",background:`linear-gradient(135deg,${C.orange},#F28C00)`,border:"none",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 12px ${C.orange}44`}}>🔊</button>
            <span style={{fontSize:40,fontWeight:900,color:lesson.color,fontFamily:"Cairo,sans-serif"}}>{word.word}</span>
          </div>
          <span style={{background:C.greenLt,color:C.green,border:`1.5px solid rgba(26,122,110,.2)`,borderRadius:99,padding:"4px 14px",fontSize:13,fontWeight:800}}>{word.meaning}</span>
        </div>
        <div style={{padding:"14px 18px",background:"white",textAlign:"center"}}>
          <p style={{fontSize:13,color:C.muted,fontWeight:600}}>حرف <span style={{color:lesson.color,fontWeight:900,fontSize:18}}>{lesson.letter}</span> في الكلمة</p>
        </div>
      </Card>}
      {/* Summary */}
      {isSummary&&<Card style={{textAlign:"center",padding:40,animation:"popIn .5s ease both",border:`3px solid rgba(26,122,110,.25)`}}><div style={{fontSize:72,marginBottom:12}}>🎉</div><h2 style={{color:C.green,fontWeight:900,fontSize:24,marginBottom:8}}>أحسنت! أنهيت الدرس!</h2><p style={{color:C.muted,fontSize:14,fontWeight:600}}>هل أنت جاهز للاختبار؟ 💪</p></Card>}
      {/* Nav buttons */}
      <div style={{display:"flex",gap:10,marginTop:4}}>
        {step>0&&<BtnOutline onClick={()=>setStep(s=>s-1)} style={{flex:1}}>← السابق</BtnOutline>}
        {!isSummary?<BtnGreen onClick={()=>{playSound("click");setStep(s=>s+1);}} style={{flex:1,justifyContent:"center"}}>التالي →</BtnGreen>:<BtnPrimary onClick={onComplete} style={{flex:1}}>🎯 ابدأ الاختبار</BtnPrimary>}
      </div>
    </div>
  </div>);
}

// ─── LEVEL SELECTOR ───────────────────────────────────────────────
function LevelSelector({subject,onSelect,onBack}){
  return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,padding:24}}>
    <style>{CSS}</style>
    <div style={{maxWidth:400,margin:"0 auto",paddingTop:16}}>
      <BackBtn onClick={onBack}/>
      <div style={{display:"flex",alignItems:"center",gap:8,margin:"16px 0"}}><span style={{fontSize:26}}>{subject?.emoji||"📖"}</span><h2 style={{fontWeight:900,fontSize:20,color:subject?.color||C.orange}}>{subject?.label}</h2></div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {LEVELS.map((lv,i)=><div key={lv.id} style={{animation:`fadeUp .4s ${i*.1}s ease both`}}>
          <button onClick={()=>{playSound("click");onSelect(lv);gaEvent("select_level",{level:lv.id});}} style={{background:`linear-gradient(135deg,${lv.color}14,${lv.bg})`,border:`2.5px solid ${lv.color}33`,borderRadius:22,padding:"18px 20px",cursor:"pointer",color:C.text,display:"flex",alignItems:"center",gap:14,direction:"rtl",fontFamily:FONT,transition:"all .25s",width:"100%",boxShadow:C.shadow}} onMouseEnter={e=>{e.currentTarget.style.borderColor=lv.color;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 24px ${lv.color}33`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=lv.color+"33";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=C.shadow;}}>
            <div style={{width:52,height:52,borderRadius:16,background:lv.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{lv.emoji}</div>
            <div style={{textAlign:"right"}}><div style={{fontWeight:900,fontSize:20,color:lv.color}}>{lv.label}</div><div style={{fontSize:12,color:C.muted,fontWeight:600}}>{lv.id==="easy"?"للمبتدئين — بسيطة":lv.id==="medium"?"مستوى متوسط":"للمتقدمين — تحدٍّ حقيقي!"}</div></div>
          </button>
        </div>)}
      </div>
    </div>
  </div>);
}

// ─── LOADING SCREEN ───────────────────────────────────────────────
function LoadingScreen({subject}){return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,fontFamily:FONT}}><style>{CSS}</style><div style={{width:96,height:96,borderRadius:24,background:`linear-gradient(135deg,${subject?.color||C.orange},${subject?.color||C.orange}BB)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,animation:"spin 2s linear infinite",boxShadow:`0 12px 40px ${subject?.color||C.orange}44`}}>{subject?.emoji||"📖"}</div><div style={{textAlign:"center"}}><p style={{fontWeight:900,fontSize:20,color:C.text}}>Claude AI يحضّر أسئلتك…</p><p style={{color:C.muted,fontSize:14,fontWeight:600,marginTop:6}}>لحظة يا بطل! 🌟</p></div><div style={{display:"flex",gap:8}}>{[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:subject?.color||C.orange,animation:`pulse 1.2s ease-in-out ${i*.2}s infinite`}}/>)}</div></div>);}

// ─── QUIZ SCREEN ─────────────────────────────────────────────────
function QuizScreen({subject,level,questions,onBack,onComplete}){
  const [idx,setIdx]=useState(0);const [selected,setSelected]=useState(null);const [score,setScore]=useState(0);const [shake,setShake]=useState(false);const [feedback,setFeedback]=useState(null);
  const q=questions[idx];const isRTL=subject?.id!=="english";const lang=subject?.id==="english"?"en":"ar";
  function choose(i){if(selected!==null)return;const correct=i===q.ans;setSelected(i);setFeedback(correct?"correct":"wrong");playSound(correct?"correct":"wrong");if(correct){setScore(s=>s+1);speak("ممتاز! إجابة صحيحة!","ar");}else{setShake(true);setTimeout(()=>setShake(false),500);speak("حاول مرة أخرى!","ar");}setTimeout(()=>{setFeedback(null);if(idx+1<questions.length){setIdx(idx+1);setSelected(null);}else{playSound("complete");onComplete(score+(correct?1:0));}},1600);}
  return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,paddingBottom:30}}>
    <style>{CSS}</style>
    <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(249,240,235,.92)",backdropFilter:"blur(18px)",borderBottom:`1px solid rgba(200,90,0,.1)`,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <StarsBadge/>
      <div style={{background:C.orangeLt,color:C.orange,border:`1.5px solid rgba(200,90,0,.2)`,borderRadius:99,padding:"4px 12px",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",gap:6}}><span>صل الحرف بالصورة</span></div>
      <button onClick={()=>{playSound("click");onBack();}} style={{width:36,height:36,borderRadius:"50%",background:C.bg2,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✕</button>
    </div>
    <div style={{padding:"14px 18px",display:"flex",flexDirection:"column",gap:12}}>
      {/* Question */}
      <div style={{textAlign:"center",animation:"fadeUp .4s ease both"}}>
        <h2 style={{fontSize:28,fontWeight:900,color:C.text,marginBottom:10}}>{q.q}</h2>
        <button onClick={()=>speak(q.q,lang)} style={{background:C.greenLt,border:`1.5px solid rgba(26,122,110,.25)`,borderRadius:99,padding:"8px 18px",fontFamily:FONT,fontWeight:800,fontSize:13,color:C.green,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6}}>🔊 استمع للسؤال</button>
      </div>
      {/* Feedback */}
      {feedback&&<div style={{background:feedback==="correct"?"#EBFFF4":"#FFF0F0",border:`2px solid ${feedback==="correct"?C.green:C.red}`,borderRadius:16,padding:"14px 20px",textAlign:"center",animation:"popIn .3s ease both",color:feedback==="correct"?C.green:C.red,fontWeight:900,fontSize:18}}>{feedback==="correct"?"✅ ممتاز! إجابة صحيحة! 🌟":"❌ حاول مرة أخرى! 💪"}</div>}
      {/* Options */}
      <div style={{display:"flex",flexDirection:"column",gap:10,animation:shake?"shake .5s":"none"}}>
        {q.opts.map((opt,i)=>{
          let bg="white",border=`2px solid ${C.border}`,color=C.text,shadow=C.shadow;
          if(selected!==null){if(i===q.ans){bg=C.greenLt;border=`2.5px solid ${C.green}`;color=C.green;shadow=`0 4px 16px rgba(26,122,110,.2)`;}else if(i===selected){bg="#FFF0F0";border=`2.5px solid ${C.red}`;color=C.red;}}
          return <button key={i} onClick={()=>choose(i)} style={{background:bg,border,color,borderRadius:20,padding:"16px 18px",fontSize:isRTL?18:16,fontWeight:800,cursor:selected?"default":"pointer",transition:"all .25s",direction:isRTL?"rtl":"ltr",fontFamily:FONT,minHeight:60,boxShadow:shadow,display:"flex",alignItems:"center",gap:12,justifyContent:"space-between"}} onMouseEnter={e=>{if(!selected){e.currentTarget.style.background=`${subject?.color||C.orange}12`;e.currentTarget.style.borderColor=subject?.color||C.orange;}}} onMouseLeave={e=>{if(!selected){e.currentTarget.style.background="white";e.currentTarget.style.borderColor=C.border;}}}>
            <span>{opt}</span>
            {selected!==null&&i===q.ans&&<span style={{animation:"checkPop .4s ease both",fontSize:18}}>✅</span>}
          </button>;
        })}
      </div>
      {/* Progress */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"}}>
        <span style={{fontSize:12,fontWeight:700,color:C.muted}}>السؤال {idx+1} من {questions.length}</span>
        <ProgBar pct={((idx+1)/questions.length)*100} color={subject?.color||C.orange}/>
        <span style={{fontSize:12,fontWeight:700,color:C.orange,marginRight:8}}>{score}✓</span>
      </div>
    </div>
  </div>);
}

// ─── RESULT SCREEN ────────────────────────────────────────────────
function ResultScreen({score,total,subject,level,child,onRetry,onHome}){
  const pct=Math.round((score/total)*100);const stars=pct===100?5:pct>=80?4:pct>=60?3:pct>=40?2:1;const msg=pct===100?"مثالي! أنت نجم! 🌟":pct>=60?"أحسنت! استمر! 💪":"لا تستسلم! 🔄";
  useEffect(()=>{gaEvent("complete_session",{subject:subject?.id,level:level?.id,score:pct});speak(msg,"ar");},[]);
  return(<div style={{minHeight:"100vh",background:C.bg,fontFamily:FONT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <style>{CSS}</style>
    <div style={{width:"100%",maxWidth:400,display:"flex",flexDirection:"column",alignItems:"center",gap:18,animation:"fadeUp .5s ease both"}}>
      <div style={{fontSize:80,animation:"popIn .6s ease both"}}>{pct===100?"🏆":pct>=60?"🎉":"💡"}</div>
      <div style={{display:"flex",gap:4}}>{[...Array(5)].map((_,i)=><span key={i} style={{fontSize:28,opacity:i<stars?1:.2,transition:`opacity .3s ${i*.1}s`}}>⭐</span>)}</div>
      <h2 style={{fontSize:22,color:subject?.color||C.orange,fontWeight:900,textAlign:"center"}}>{msg}</h2>
      <Card style={{padding:"22px 28px",border:`3px solid ${subject?.color||C.orange}33`,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-around",alignItems:"center"}}>
          <div style={{textAlign:"center"}}><div style={{fontSize:40,fontWeight:900,color:subject?.color||C.orange}}>{score}/{total}</div><div style={{color:C.muted,fontSize:12,fontWeight:600}}>إجابة صحيحة</div></div>
          <div style={{width:2,height:46,background:C.border}}/>
          <div style={{textAlign:"center"}}><div style={{fontSize:40,fontWeight:900,color:level?.color||C.green}}>{pct}%</div><div style={{background:level?.bg,color:level?.color,borderRadius:99,padding:"2px 10px",fontSize:11,fontWeight:800}}>{level?.emoji} {level?.label}</div></div>
        </div>
        <div style={{marginTop:14}}><ProgBar pct={pct} color={pct>=60?C.green:C.red}/></div>
      </Card>
      <button onClick={async()=>{const text=`🇸🇩 فُسحة\n🎉 ${child?.name} — ${subject?.label}\n✅ ${score}/${total} (${pct}%)\nhttps://fos7a-v2.vercel.app`;try{if(navigator.share)await navigator.share({title:"فُسحة",text});else await navigator.clipboard.writeText(text);}catch{}}} style={{background:"linear-gradient(135deg,#25D366,#128C7E)",border:"none",color:"white",borderRadius:99,padding:"14px 28px",fontWeight:800,fontSize:16,cursor:"pointer",fontFamily:FONT,width:"100%",boxShadow:"0 4px 14px rgba(37,211,102,.3)"}}>📤 شارك النتيجة مع الأهل</button>
      <div style={{display:"flex",gap:10,width:"100%"}}>
        <BtnPrimary onClick={onRetry} style={{flex:1}}>🔄 مجدداً</BtnPrimary>
        <BtnOutline onClick={onHome} style={{flex:1}}>🏠 الرئيسية</BtnOutline>
      </div>
    </div>
  </div>);
}

// ─── ROOT APP ─────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);const [profile,setProfile]=useState(null);const [children,setChildren]=useState([]);const [screen,setScreen]=useState("auth");const [activeChild,setActiveChild]=useState(null);const [activeSubject,setActiveSubject]=useState(null);const [activeLevel,setActiveLevel]=useState(null);const [activeLesson,setActiveLesson]=useState(null);const [questions,setQuestions]=useState([]);const [finalScore,setFinalScore]=useState(0);const [error,setError]=useState(null);const [loading,setLoading]=useState(true);const [toast,setToast]=useState("");

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(""),2500);}

  useEffect(()=>{
    // preload TTS voices
    window.speechSynthesis?.getVoices();

    let initialized = false;

    async function init(){
      // ── Handle magic link hash (access_token in URL) ──
      const hash = window.location.hash;
      if(hash && hash.includes("access_token")){
        const h = new URLSearchParams(hash.replace("#","?"));
        const at = h.get("access_token");
        const rt = h.get("refresh_token");
        if(at && rt){
          const {data, error} = await supabase.auth.setSession({access_token:at, refresh_token:rt});
          // Clean URL immediately
          window.history.replaceState(null, "", window.location.pathname);
          if(data?.user && !error){
            initialized = true;
            setUser(data.user);
            await loadProfile(data.user);
            setLoading(false);
            return;
          }
        }
      }

      // ── Check existing session ──
      const {data:{session}} = await supabase.auth.getSession();
      if(session?.user){
        initialized = true;
        setUser(session.user);
        await loadProfile(session.user);
      } else {
        setScreen("auth");
      }
      setLoading(false);
    }

    init();

    // ── Listen for auth changes (OTP verify, sign out) ──
    const{data:{subscription}}=supabase.auth.onAuthStateChange(async(event,session)=>{
      if(event==="SIGNED_IN" && session?.user){
        // Avoid double-loading if init() already handled it
        if(!initialized){
          initialized = true;
          setUser(session.user);
          await loadProfile(session.user);
          setLoading(false);
        }
      } else if(event==="SIGNED_OUT"){
        initialized = false;
        setUser(null); setProfile(null); setChildren([]); setScreen("auth");
      }
    });

    window.speechSynthesis?.getVoices();
    return()=>subscription.unsubscribe();
  },[]);

  async function loadProfile(u){
    try{
      const{data:prof,error:profErr}=await supabase.from("profiles").select("*").eq("id",u.id).single();
      if(prof&&!profErr){
        setProfile(prof);
        const{data:kids}=await supabase.from("children").select("*").eq("parent_id",u.id).order("created_at",{ascending:true});
        setChildren(kids||[]);
        setScreen("home");
      } else {
        setScreen("setup");
      }
    }catch(e){ setScreen("setup"); }
  }

  const fetchQuestions=useCallback(async(subject,level)=>{
    setActiveSubject(subject);setActiveLevel(level);setScreen("loading");setError(null);
    const prompt=buildPrompt(subject.id,activeChild?.age||"old",level.id);if(!prompt){setError("خطأ");setScreen("error");return;}
    try{const res=await fetch("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});if(!res.ok)throw new Error();const data=await res.json();if(!data?.content?.[0]?.text)throw new Error();const jsonStr=data.content[0].text.replace(/```json|```/gi,"").trim();const parsed=JSON.parse(jsonStr);if(!validateQuestions(parsed))throw new Error();setQuestions(parsed);setScreen("quiz");}
    catch{setError("مشكلة في توليد الأسئلة.");setScreen("error");}
  },[activeChild]);

  function handleComplete(score){setFinalScore(score);if(activeChild?.id)supabase.from("sessions").insert({child_id:activeChild.id,subject_id:activeSubject?.id,level_id:activeLevel?.id,score,total:questions.length,pct:Math.round((score/questions.length)*100),created_at:new Date().toISOString()});setScreen("result");}

  function handleTabChange(tab,subjectOverride){
    playSound("click");
    if(tab==="home")setScreen("home");
    else if(tab==="journey"){if(activeChild)setScreen("journey");else showToast("اختر طفلاً أولاً 👶");}
    else if(tab==="subjects"){if(subjectOverride){setActiveSubject(subjectOverride);if(activeChild)setScreen("journey");else showToast("اختر طفلاً أولاً 👶");}else setScreen("subjects");}
    else if(tab==="quiz"){setScreen("levels");}
    else if(tab==="profile")showToast("قريباً! 🚀");
  }

  const CSS_GLOBAL=`
    * { box-sizing: border-box; }
    body { margin:0; padding:0; background:${C.bg}; }
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{from{opacity:0;transform:scale(.6) rotate(-6deg)}to{opacity:1;transform:scale(1) rotate(0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
    @keyframes shake{0%,100%{transform:translateX(0)}25%,75%{transform:translateX(-7px)}50%{transform:translateX(7px)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .shimmer-text{background:linear-gradient(90deg,#C85A00 25%,#F28C00 50%,#C85A00 75%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 2.5s linear infinite;}
  `;

  if(loading)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS_GLOBAL}</style><div style={{textAlign:"center"}}><div style={{fontSize:64,animation:"spin 2s linear infinite",display:"inline-block"}}>🇸🇩</div></div></div>;

  return <>
    <style>{CSS_GLOBAL}</style>
    <Toast msg={toast}/>
    {screen==="auth"        && <AuthScreen onAuth={async u=>{setUser(u);await loadProfile(u);}}/>}
    {screen==="setup"       && user&&<SetupProfile user={user} onSave={p=>{setProfile(p);setScreen("home");}}/>}
    {screen==="home"        && <HomeScreen profile={profile} children={children} onAddChild={()=>setScreen("addChild")} onSelectChild={c=>{setActiveChild(c);setScreen("home");}} onTabChange={handleTabChange}/>}
    {screen==="addChild"    && user&&<AddChildScreen userId={user.id} onSave={c=>{setChildren(p=>[...p,c]);setScreen("home");}} onBack={()=>setScreen("home")}/>}
    {screen==="journey"     && activeChild&&<JourneyScreen child={activeChild} onPickLesson={l=>{setActiveLesson(l);setActiveSubject(SUBJECTS[0]);setScreen("lesson");}} onPickQuiz={()=>setScreen("levels")} onBack={()=>setScreen("home")} onTabChange={handleTabChange}/>}
    {screen==="lesson"      && activeLesson&&<LessonScreen lesson={activeLesson} subject={activeSubject} onComplete={()=>setScreen("levels")} onBack={()=>setScreen("journey")}/>}
    {screen==="levels"      && activeSubject&&<LevelSelector subject={activeSubject} onSelect={lv=>fetchQuestions(activeSubject,lv)} onBack={()=>setScreen("journey")}/>}
    {screen==="loading"     && <LoadingScreen subject={activeSubject}/>}
    {screen==="quiz"        && questions.length>0&&activeSubject&&activeLevel&&<QuizScreen subject={activeSubject} level={activeLevel} questions={questions} onBack={()=>setScreen("levels")} onComplete={handleComplete}/>}
    {screen==="result"      && activeSubject&&activeLevel&&activeChild&&<ResultScreen score={finalScore} total={questions.length} subject={activeSubject} level={activeLevel} child={activeChild} onRetry={()=>fetchQuestions(activeSubject,activeLevel)} onHome={()=>setScreen("home")}/>}
    {screen==="error"       && <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,fontFamily:FONT,padding:24}}><style>{CSS_GLOBAL}</style><div style={{fontSize:56}}>😕</div><p style={{color:C.red,fontWeight:800,fontSize:16,textAlign:"center"}}>{error}</p><div style={{display:"flex",gap:10}}><BtnPrimary onClick={()=>fetchQuestions(activeSubject,activeLevel)}>🔄 حاول مجدداً</BtnPrimary><BtnOutline onClick={()=>setScreen("home")}>رجوع</BtnOutline></div></div>}
  </>;
}
