import { Link } from 'react-router-dom'
import { Activity, Shield, Clock, ArrowRight, CheckCircle2, Zap, Heart, MapPin, Bell, Syringe, Users, FileText } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

function CountUp({ end, suffix = '' }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let s = 0; const step = end / 80
    const t = setInterval(() => { s += step; if (s >= end) { setCount(end); clearInterval(t) } else setCount(Math.floor(s)) }, 20)
    return () => clearInterval(t)
  }, [started])
  return <span ref={ref}>{count}{suffix}</span>
}

function FeatureCard({ icon: Icon, title, desc, color, delay }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      background: 'rgba(2,26,60,0.65)', border: '1px solid rgba(8,145,178,0.15)',
      borderRadius: '20px', padding: '28px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, border-color 0.3s, box-shadow 0.3s`,
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor=`${color}55`; e.currentTarget.style.transform='translateY(-6px) scale(1.01)'; e.currentTarget.style.boxShadow=`0 16px 48px ${color}18` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(8,145,178,0.15)'; e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow='none' }}
    >
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: `${color}15`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', transition: 'all 0.3s' }}>
        <Icon style={{ width: '22px', height: '22px', color }} />
      </div>
      <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: '#E0F7FF', fontSize: '16px', marginBottom: '10px' }}>{title}</h3>
      <p style={{ color: 'rgba(103,232,249,0.45)', fontSize: '13px', lineHeight: 1.75 }}>{desc}</p>
    </div>
  )
}

export default function Landing() {
  const [visible, setVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [ecgDone, setEcgDone] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])
  useEffect(() => { setTimeout(() => setEcgDone(true), 3200) }, [])

  const handleMouse = (e) => {
    setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
  }

  const particles = [
    { s:5,  t:'8%',  l:'6%',   c:'#22D3EE', o:0.6, d:'7s',  dl:'0s'   },
    { s:4,  t:'15%', l:'94%',  c:'#67E8F9', o:0.5, d:'9s',  dl:'1.2s' },
    { s:7,  t:'78%', l:'4%',   c:'#34D399', o:0.4, d:'8s',  dl:'2.1s' },
    { s:4,  t:'85%', l:'92%',  c:'#22D3EE', o:0.45,d:'10s', dl:'0.7s' },
    { s:3,  t:'35%', l:'97%',  c:'#A5F3FC', o:0.35,d:'7s',  dl:'3.1s' },
    { s:6,  t:'55%', l:'2%',   c:'#67E8F9', o:0.3, d:'11s', dl:'1.8s' },
    { s:3,  t:'22%', l:'48%',  c:'#34D399', o:0.25,d:'8s',  dl:'2.8s' },
    { s:5,  t:'65%', l:'55%',  c:'#22D3EE', o:0.2, d:'9s',  dl:'4.2s' },
    { s:4,  t:'42%', l:'88%',  c:'#F87171', o:0.3, d:'6s',  dl:'0.4s' },
    { s:3,  t:'90%', l:'40%',  c:'#C084FC', o:0.25,d:'8s',  dl:'3.5s' },
    { s:6,  t:'12%', l:'22%',  c:'#22D3EE', o:0.2, d:'12s', dl:'2.0s' },
    { s:3,  t:'70%', l:'75%',  c:'#67E8F9', o:0.3, d:'7s',  dl:'1.5s' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', overflowX: 'hidden', fontFamily: 'Outfit,sans-serif' }}
      onMouseMove={handleMouse}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        @keyframes float-up   { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-22px) scale(1.1)} }
        @keyframes float-side { 0%,100%{transform:translateX(0)} 50%{transform:translateX(14px)} }
        @keyframes spin-slow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spin-rev   { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes pulse-ring { 0%{transform:scale(0.95);opacity:0.7} 50%{transform:scale(1.05);opacity:0.4} 100%{transform:scale(0.95);opacity:0.7} }
        @keyframes glow-logo  { 0%,100%{box-shadow:0 0 16px rgba(34,211,238,0.3),0 4px 14px rgba(8,145,178,0.4)} 50%{box-shadow:0 0 32px rgba(34,211,238,0.6),0 4px 24px rgba(8,145,178,0.6)} }
        @keyframes ecg-draw   { 0%{stroke-dashoffset:1200} 100%{stroke-dashoffset:0} }
        @keyframes ecg-loop   { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-1200} }
        @keyframes fade-up    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in    { from{opacity:0} to{opacity:1} }
        @keyframes shimmer    { 0%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }
        @keyframes badge-glow { 0%,100%{box-shadow:0 0 0 0 rgba(34,211,238,0)} 50%{box-shadow:0 0 20px 4px rgba(34,211,238,0.25)} }
        @keyframes count-pop  { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes orbit-1    { from{transform:rotate(0deg) translateX(160px) rotate(0deg)} to{transform:rotate(360deg) translateX(160px) rotate(-360deg)} }
        @keyframes orbit-2    { from{transform:rotate(120deg) translateX(110px) rotate(-120deg)} to{transform:rotate(480deg) translateX(110px) rotate(-480deg)} }
        @keyframes orbit-3    { from{transform:rotate(240deg) translateX(70px) rotate(-240deg)} to{transform:rotate(600deg) translateX(70px) rotate(-600deg)} }
        @keyframes line-scan  { 0%{opacity:0;transform:translateX(-100%)} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0;transform:translateX(100%)} }

        .btn-primary {
          background: linear-gradient(135deg, #0C7B96 0%, #0891B2 50%, #06B6D4 100%);
          color: white; font-weight: 800; font-family: Outfit,sans-serif;
          border: none; cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .btn-primary::before {
          content:''; position:absolute; top:-50%; left:-60%;
          width:35%; height:200%; background:rgba(255,255,255,0.18);
          transform:skewX(-20deg); animation: shimmer 2.8s ease-in-out infinite;
        }
        .btn-primary:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(8,145,178,0.55) !important; }
        .btn-secondary {
          background:rgba(8,145,178,0.07); border:1.5px solid rgba(34,211,238,0.28);
          color:#A5F3FC; font-weight:700; font-family:Outfit,sans-serif;
          cursor:pointer; transition:all 0.25s;
        }
        .btn-secondary:hover { background:rgba(8,145,178,0.14); border-color:rgba(34,211,238,0.55); transform:translateY(-3px); box-shadow:0 10px 32px rgba(34,211,238,0.14); }

        .stat-card { transition:all 0.3s ease; }
        .stat-card:hover { transform:translateY(-6px) scale(1.04) !important; }

        .risk-card { transition:transform 0.25s ease; }
        .risk-card:hover { transform:scale(1.03) !important; }

        .ecg-line-draw {
          stroke-dasharray: 1200;
          animation: ecg-draw 2.8s ease-out forwards;
        }
        .ecg-line-loop {
          stroke-dasharray: 1200;
          animation: ecg-loop 4s linear infinite;
        }
      `}</style>

      {/* Mouse follow glow */}
      <div style={{ position:'fixed', width:'700px', height:'700px', borderRadius:'50%', pointerEvents:'none', zIndex:0,
        background:'radial-gradient(circle, rgba(8,145,178,0.07) 0%, transparent 70%)',
        left:`${mousePos.x*100}%`, top:`${mousePos.y*100}%`,
        transform:'translate(-50%,-50%)', transition:'left 1s ease, top 1s ease',
      }} />

      {/* ── Navbar ── */}
      <header style={{ background:'rgba(2,6,23,0.88)', backdropFilter:'blur(28px)', borderBottom:'1px solid rgba(8,145,178,0.16)', position:'sticky', top:0, zIndex:50, boxShadow:'0 4px 30px rgba(0,0,0,0.4)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 28px', height:'66px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'40px', height:'40px', background:'linear-gradient(135deg,#0C7B96,#0891B2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', animation:'glow-logo 3s ease-in-out infinite' }}>
              <Activity style={{ width:'18px', height:'18px', color:'#67E8F9' }} />
            </div>
            <div>
              <div style={{ fontWeight:900, fontSize:'19px', letterSpacing:'-0.03em', color:'#E0F7FF' }}>Medi<span style={{ color:'#22D3EE' }}>Intake</span></div>
              <div style={{ fontSize:'9px', color:'rgba(103,232,249,0.3)', letterSpacing:'0.12em', textTransform:'uppercase', lineHeight:1 }}>Healthcare System</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            <Link to="/login" style={{ color:'rgba(165,243,252,0.65)', padding:'8px 20px', borderRadius:'10px', fontSize:'13px', fontWeight:700, textDecoration:'none', border:'1px solid rgba(8,145,178,0.2)', transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.color='white'; e.currentTarget.style.background='rgba(8,145,178,0.1)' }}
              onMouseLeave={e=>{ e.currentTarget.style.color='rgba(165,243,252,0.65)'; e.currentTarget.style.background='transparent' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding:'9px 22px', borderRadius:'11px', fontSize:'13px', textDecoration:'none', boxShadow:'0 4px 16px rgba(8,145,178,0.4)' }}>
              Get Started →
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex:1, position:'relative', zIndex:1 }}>

        {/* ── HERO ── */}
        <section style={{ position:'relative', minHeight:'96vh', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', textAlign:'center',
          background:'radial-gradient(ellipse at 50% -10%, rgba(8,145,178,0.22) 0%, transparent 65%)' }}>

          {/* Particles */}
          {particles.map((p,i) => (
            <div key={i} style={{ position:'absolute', width:p.s, height:p.s, borderRadius:'50%', background:p.c, opacity:p.o, top:p.t, left:p.l,
              boxShadow:`0 0 ${p.s*4}px ${p.c}`, pointerEvents:'none',
              animation:`float-up ${p.d} ease-in-out infinite`, animationDelay:p.dl,
            }} />
          ))}

          {/* Concentric rings */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none', zIndex:0 }}>
            {[400,560,720].map((sz,i) => (
              <div key={i} style={{ position:'absolute', width:sz, height:sz, borderRadius:'50%',
                border:`1px solid rgba(34,211,238,${0.06 - i*0.015})`,
                top:'50%', left:'50%', transform:'translate(-50%,-50%)',
                animation:`pulse-ring ${8+i*3}s ease-in-out infinite`, animationDelay:`${i*1.2}s`,
              }} />
            ))}
          </div>

          {/* Orbit dots */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:0, height:0, pointerEvents:'none' }}>
            {[
              { color:'#22D3EE', size:8,  anim:'orbit-1', dur:'10s' },
              { color:'#34D399', size:6,  anim:'orbit-2', dur:'14s' },
              { color:'#F87171', size:5,  anim:'orbit-3', dur:'7s'  },
            ].map((d,i) => (
              <div key={i} style={{ position:'absolute', width:d.size, height:d.size, borderRadius:'50%',
                background:d.color, boxShadow:`0 0 12px ${d.color}`, opacity:0.6,
                animation:`${d.anim} ${d.dur} linear infinite`,
              }} />
            ))}
          </div>

          {/* Rotating ring decorations */}
          <div style={{ position:'absolute', top:'50%', left:'50%', width:'380px', height:'380px', transform:'translate(-50%,-50%)', pointerEvents:'none', opacity:0.07 }}>
            <div style={{ position:'absolute', inset:0, border:'1px solid #22D3EE', borderRadius:'50%', animation:'spin-slow 20s linear infinite' }} />
            <div style={{ position:'absolute', inset:'30px', border:'1px dashed #67E8F9', borderRadius:'50%', animation:'spin-rev 15s linear infinite' }} />
          </div>

          {/* Hero content — centered */}
          <div style={{ position:'relative', zIndex:2, maxWidth:'760px', padding:'0 24px', display:'flex', flexDirection:'column', alignItems:'center' }}>

            {/* Badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'32px',
              padding:'8px 20px', borderRadius:'30px', fontSize:'11px', fontWeight:800, letterSpacing:'0.08em',
              background:'rgba(8,145,178,0.1)', border:'1px solid rgba(34,211,238,0.3)', color:'#67E8F9',
              animation:'badge-glow 3s ease-in-out infinite',
              opacity: visible?1:0, transition:'opacity 0.6s ease 0.1s',
            }}>
              <Zap style={{ width:'12px', height:'12px' }} />
              RULE-BASED EMERGENCY RISK SCORING
            </div>

            {/* Headline */}
            <h1 style={{
              fontWeight:900, lineHeight:1.06, letterSpacing:'-0.04em',
              fontSize:'clamp(42px,6.5vw,78px)', color:'#E0F7FF', marginBottom:'18px',
              opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(24px)',
              transition:'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
            }}>
              Digital Healthcare<br />
              <span style={{ background:'linear-gradient(135deg, #67E8F9 0%, #22D3EE 45%, #0891B2 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Intake & Triage
              </span>
            </h1>

            {/* ECG */}
            <div style={{ width:'100%', maxWidth:'500px', marginBottom:'22px', opacity:visible?1:0, transition:'opacity 0.8s ease 0.4s' }}>
              <svg viewBox="0 0 600 60" style={{ width:'100%', height:'46px', overflow:'visible' }}>
                <defs>
                  <linearGradient id="eg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#22D3EE" stopOpacity="0" />
                    <stop offset="25%"  stopColor="#22D3EE" stopOpacity="0.9" />
                    <stop offset="75%"  stopColor="#67E8F9" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline fill="none" stroke="url(#eg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className={ecgDone ? 'ecg-line-loop' : 'ecg-line-draw'}
                  points="0,30 25,30 35,30 43,10 51,50 58,30 78,30 86,30 94,20 102,40 108,30 135,30 143,6 151,54 158,30 172,30 205,30 213,16 221,44 227,30 255,30 260,4 267,56 274,30 292,30 325,30 333,18 341,42 347,30 372,30 377,8 384,52 390,30 408,30 440,30 448,20 456,40 462,30 490,30 495,12 502,48 508,30 526,30 558,30 566,16 574,44 580,30 600,30"
                />
              </svg>
            </div>

            {/* Subtitle */}
            <p style={{
              color:'rgba(165,243,252,0.55)', fontSize:'17px', lineHeight:1.75,
              maxWidth:'560px', marginBottom:'38px',
              opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(20px)',
              transition:'opacity 0.7s ease 0.35s, transform 0.7s ease 0.35s',
            }}>
              Digitise patient registration, capture structured medical history, and automatically
              prioritise emergencies with a fully transparent scoring engine.
            </p>

            {/* Buttons */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'14px', justifyContent:'center', marginBottom:'56px',
              opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(20px)',
              transition:'opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s',
            }}>
              <Link to="/register" className="btn-primary" style={{ padding:'15px 32px', borderRadius:'14px', fontSize:'15px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'9px', boxShadow:'0 6px 24px rgba(8,145,178,0.45)' }}>
                Register as Patient <ArrowRight style={{ width:'17px', height:'17px' }} />
              </Link>
              <Link to="/login?role=admin" className="btn-secondary" style={{ padding:'15px 32px', borderRadius:'14px', fontSize:'15px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'9px' }}>
                Hospital Staff Portal
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', width:'100%', maxWidth:'520px',
              opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(20px)',
              transition:'opacity 0.7s ease 0.55s, transform 0.7s ease 0.55s',
            }}>
              {[
                { value:18, suffix:'+', label:'Symptoms Tracked' },
                { value:100, suffix:'%', label:'Transparent Rules' },
                { value:12, suffix:'+', label:'Patient Features' },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="stat-card" style={{ background:'rgba(2,26,60,0.6)', border:'1px solid rgba(34,211,238,0.18)', borderRadius:'18px', padding:'20px 12px', textAlign:'center', backdropFilter:'blur(10px)', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, borderRadius:'18px', background:'radial-gradient(circle at 50% 0%, rgba(34,211,238,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
                  <div style={{ fontWeight:900, fontSize:'34px', color:'#22D3EE', lineHeight:1, letterSpacing:'-0.04em' }}>
                    <CountUp end={value} suffix={suffix} />
                  </div>
                  <div style={{ fontSize:'11px', color:'rgba(103,232,249,0.4)', marginTop:'6px', fontWeight:700, letterSpacing:'0.04em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom gradient */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'140px', background:'linear-gradient(to bottom, transparent, #020617)', pointerEvents:'none' }} />
        </section>

        {/* ── Features ── */}
        <section style={{ background:'#020617', padding:'90px 24px' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'56px' }}>
              <div style={{ fontSize:'11px', fontWeight:800, color:'rgba(34,211,238,0.5)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:'14px' }}>Everything you need</div>
              <h2 style={{ fontWeight:900, fontSize:'clamp(26px,4vw,40px)', color:'#E0F7FF', letterSpacing:'-0.03em', lineHeight:1.1 }}>
                Built for real healthcare workflows
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'18px' }}>
              {[
                { icon:Clock,    title:'Fast Digital Registration',   desc:'One-time medical profile — no repeated form filling during emergencies.', color:'#22D3EE', delay:0   },
                { icon:Shield,   title:'Transparent Risk Scoring',    desc:'Every risk level backed by explicit rules and point weights. Fully auditable.', color:'#34D399', delay:80  },
                { icon:Users,    title:'Structured Triage Dashboard', desc:'Hospital staff see all submissions sorted by risk score. High-risk first.', color:'#A78BFA', delay:160 },
                { icon:MapPin,   title:'Hospitals & Pharmacy Finder', desc:'GPS-based map with live directions, call button and opening hours.', color:'#F87171', delay:240 },
                { icon:Bell,     title:'Real-Time Notifications',     desc:'Patients notified when intakes are reviewed and appointments confirmed.', color:'#FCD34D', delay:320 },
                { icon:Heart,    title:'Health Score Card',           desc:'Animated ring chart showing your overall health score with trend tracking.', color:'#FB7185', delay:400 },
                { icon:Syringe,  title:'Vaccination Records',         desc:'Track immunisation history with overdue and upcoming dose alerts.', color:'#6EE7B7', delay:480 },
                { icon:FileText, title:'Emergency Quick-View',        desc:'One-click critical info — blood group, allergies, medications, emergency contact.', color:'#67E8F9', delay:560 },
              ].map(p => <FeatureCard key={p.title} {...p} />)}
            </div>
          </div>
        </section>

        {/* ── Risk scoring ── */}
        <section style={{ padding:'0 24px 100px' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
            <div style={{ background:'linear-gradient(135deg, rgba(2,26,60,0.92) 0%, rgba(2,12,35,0.96) 100%)', border:'1.5px solid rgba(8,145,178,0.18)', borderRadius:'28px', padding:'56px 48px', position:'relative', overflow:'hidden', textAlign:'center' }}>
              <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'320px', height:'320px', background:'rgba(34,211,238,0.04)', borderRadius:'50%', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:'220px', height:'220px', background:'rgba(52,211,153,0.04)', borderRadius:'50%', pointerEvents:'none' }} />
              <h2 style={{ fontWeight:900, fontSize:'clamp(22px,3.5vw,34px)', color:'#E0F7FF', marginBottom:'40px', letterSpacing:'-0.03em' }}>How Risk Scoring Works</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'20px' }}>
                {[
                  { level:'LOW RISK',    range:'0–30 pts',  accent:'#34D399', bg:'rgba(52,211,153,0.07)',  border:'rgba(52,211,153,0.22)',  items:['Minor symptoms','Normal vitals','No chronic conditions','Younger age'] },
                  { level:'MEDIUM RISK', range:'31–60 pts', accent:'#22D3EE', bg:'rgba(34,211,238,0.07)',  border:'rgba(34,211,238,0.22)',  items:['Moderate symptoms','Slightly abnormal vitals','Existing conditions','Age factor'] },
                  { level:'HIGH RISK',   range:'61+ pts',   accent:'#F87171', bg:'rgba(248,113,113,0.07)', border:'rgba(248,113,113,0.22)', items:['Chest pain / breathlessness','Critical vitals','Multiple conditions','Loss of consciousness'] },
                ].map(({ level, range, accent, bg, border, items }) => (
                  <div key={level} className="risk-card" style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:'18px', padding:'24px', textAlign:'left' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'8px' }}>
                      <span style={{ fontWeight:900, color:accent, fontSize:'13px', letterSpacing:'0.05em' }}>{level}</span>
                      <span style={{ fontSize:'11px', color:accent, background:`${accent}18`, padding:'3px 10px', borderRadius:'8px', fontWeight:800, border:`1px solid ${accent}28` }}>{range}</span>
                    </div>
                    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'10px' }}>
                      {items.map(item => (
                        <li key={item} style={{ display:'flex', alignItems:'center', gap:'9px', fontSize:'13px', color:'rgba(165,243,252,0.55)' }}>
                          <CheckCircle2 style={{ width:'15px', height:'15px', color:accent, flexShrink:0 }} />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{ padding:'0 24px 120px', textAlign:'center' }}>
          <div style={{ maxWidth:'620px', margin:'0 auto' }}>
            <div style={{ width:'60px', height:'60px', background:'linear-gradient(135deg,#0C7B96,#0891B2)', borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', animation:'glow-logo 3s ease-in-out infinite' }}>
              <Activity style={{ width:'26px', height:'26px', color:'#67E8F9' }} />
            </div>
            <h2 style={{ fontWeight:900, fontSize:'clamp(24px,4vw,38px)', color:'#E0F7FF', marginBottom:'14px', letterSpacing:'-0.03em' }}>Ready to get started?</h2>
            <p style={{ color:'rgba(103,232,249,0.45)', fontSize:'15px', marginBottom:'36px', lineHeight:1.7 }}>Join patients and hospitals already using MediIntake for faster, smarter emergency care.</p>
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ padding:'15px 34px', borderRadius:'14px', fontSize:'15px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'9px', boxShadow:'0 6px 24px rgba(8,145,178,0.45)' }}>
                Register as Patient <ArrowRight style={{ width:'17px', height:'17px' }} />
              </Link>
              <Link to="/login?role=admin" className="btn-secondary" style={{ padding:'15px 34px', borderRadius:'14px', fontSize:'15px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'9px' }}>
                Hospital Staff Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ background:'rgba(2,6,23,0.96)', borderTop:'1px solid rgba(8,145,178,0.12)', padding:'28px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <Activity style={{ width:'16px', height:'16px', color:'#22D3EE' }} />
            <span style={{ fontWeight:800, color:'rgba(165,243,252,0.5)', fontSize:'14px' }}>MediIntake</span>
          </div>
          <p style={{ fontSize:'12px', color:'rgba(8,145,178,0.3)' }}>Digital Healthcare Intake System — For demonstration purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
