import { useEffect, useState } from 'react'
import { Download, X, Smartphone, Share } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed or dismissed this session
    if (sessionStorage.getItem('pwa-dismissed')) return
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (window.navigator.standalone) return // iOS standalone

    // Detect iOS Safari
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    const safari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent)
    if (ios && safari) {
      setIsIOS(true)
      // Show iOS prompt after 3 seconds
      setTimeout(() => setShow(true), 3000)
      return
    }

    // Android / Chrome - listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 2000) // show after 2s
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setShow(false)
    setDismissed(true)
    sessionStorage.setItem('pwa-dismissed', '1')
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShow(false)
    if (outcome === 'accepted') sessionStorage.setItem('pwa-dismissed', '1')
  }

  if (!show || dismissed) return null

  // iOS instructions
  if (isIOS) {
    return (
      <div style={{
        position: 'fixed', bottom: '80px', left: '16px', right: '16px', zIndex: 9999,
        background: 'rgba(2,26,60,0.98)', border: '1.5px solid rgba(34,211,238,0.35)',
        borderRadius: '18px', padding: '18px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(16px)', fontFamily: 'Outfit,sans-serif',
        animation: 'slideUpPrompt 0.4s ease-out',
      }}>
        <style>{`@keyframes slideUpPrompt{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <button onClick={dismiss} style={{ position:'absolute', top:'12px', right:'12px', background:'none', border:'none', color:'rgba(103,232,249,0.5)', cursor:'pointer', padding:'4px' }}>
          <X style={{ width:'16px', height:'16px' }} />
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
          <div style={{ width:'40px', height:'40px', background:'linear-gradient(135deg,#0C7B96,#0891B2)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Smartphone style={{ width:'18px', height:'18px', color:'white' }} />
          </div>
          <div>
            <p style={{ color:'#E0F7FF', fontWeight:800, fontSize:'14px', margin:0 }}>Install MediIntake</p>
            <p style={{ color:'rgba(103,232,249,0.5)', fontSize:'11px', margin:0 }}>Add to your home screen</p>
          </div>
        </div>
        <div style={{ background:'rgba(8,145,178,0.1)', borderRadius:'12px', padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'28px', height:'28px', background:'rgba(34,211,238,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'14px' }}>1</span>
            </div>
            <p style={{ color:'#A5F3FC', fontSize:'12px', margin:0 }}>Tap the <Share style={{ width:'13px', height:'13px', display:'inline', verticalAlign:'middle' }} /> <strong>Share</strong> button in Safari</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'28px', height:'28px', background:'rgba(34,211,238,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'14px' }}>2</span>
            </div>
            <p style={{ color:'#A5F3FC', fontSize:'12px', margin:0 }}>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'28px', height:'28px', background:'rgba(34,211,238,0.15)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'14px' }}>3</span>
            </div>
            <p style={{ color:'#A5F3FC', fontSize:'12px', margin:0 }}>Tap <strong>"Add"</strong> — done! ✅</p>
          </div>
        </div>
      </div>
    )
  }

  // Android / Chrome install prompt
  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '16px', right: '16px', zIndex: 9999,
      background: 'rgba(2,26,60,0.98)', border: '1.5px solid rgba(34,211,238,0.35)',
      borderRadius: '18px', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(16px)', fontFamily: 'Outfit,sans-serif',
      animation: 'slideUpPrompt 0.4s ease-out',
      display: 'flex', alignItems: 'center', gap: '14px',
    }}>
      <div style={{ width:'44px', height:'44px', background:'linear-gradient(135deg,#0C7B96,#0891B2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 14px rgba(8,145,178,0.5)' }}>
        <Download style={{ width:'20px', height:'20px', color:'white' }} />
      </div>
      <div style={{ flex:1 }}>
        <p style={{ color:'#E0F7FF', fontWeight:800, fontSize:'14px', margin:'0 0 2px' }}>Install MediIntake</p>
        <p style={{ color:'rgba(103,232,249,0.5)', fontSize:'11px', margin:0 }}>Add to home screen for quick access</p>
      </div>
      <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
        <button onClick={dismiss} style={{ background:'rgba(8,145,178,0.1)', border:'1px solid rgba(8,145,178,0.25)', color:'rgba(103,232,249,0.6)', borderRadius:'8px', padding:'7px 12px', fontSize:'12px', cursor:'pointer', fontFamily:'Outfit,sans-serif' }}>
          Not now
        </button>
        <button onClick={install} style={{ background:'linear-gradient(135deg,#0C7B96,#0891B2)', border:'none', color:'white', borderRadius:'8px', padding:'7px 16px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'Outfit,sans-serif', boxShadow:'0 4px 12px rgba(8,145,178,0.4)' }}>
          Install
        </button>
      </div>
    </div>
  )
}
