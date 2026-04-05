import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { Send, MessageSquare, Search, User } from 'lucide-react'

export default function Chat() {
  const { profile, isAdmin } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activePatient, setActivePatient] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()

  useEffect(() => { loadConversations() }, [profile])

  useEffect(() => {
    if (!activePatient) return
    loadMessages()
    const ch = supabase.channel(`chat-${activePatient.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, loadMessages)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [activePatient])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConversations() {
    if (!profile) return
    if (isAdmin) {
      const { data } = await supabase.from('messages').select('from_id, to_id').or(`from_id.eq.${profile.id},to_id.eq.${profile.id}`)
      if (!data) return
      const ids = [...new Set(data.flatMap(m => [m.from_id, m.to_id]).filter(id => id !== profile.id))]
      if (ids.length > 0) {
        const { data: pData } = await supabase.from('profiles').select('id,full_name,email').in('id', ids)
        setConversations(pData || [])
      }
    } else {
      // Patient: load admins to chat with
      const { data } = await supabase.from('profiles').select('id,full_name,email').eq('role', 'admin')
      setConversations(data || [])
    }
  }

  async function loadMessages() {
    if (!profile || !activePatient) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_id.eq.${profile.id},to_id.eq.${activePatient.id}),and(from_id.eq.${activePatient.id},to_id.eq.${profile.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    // Mark as read
    await supabase.from('messages').update({ read: true }).eq('to_id', profile.id).eq('from_id', activePatient.id)
  }

  async function sendMessage() {
    if (!text.trim() || !activePatient) return
    setSending(true)
    await supabase.from('messages').insert({ from_id: profile.id, to_id: activePatient.id, subject: 'Chat', body: text.trim(), read: false })
    setText(''); setSending(false)
  }

  const filtered = conversations.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg,#059669,#10B981)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare style={{ width: '20px', height: '20px', color: 'white' }} />
          </div>
          <div>
            <h1 className="section-title">In-App Chat</h1>
            <p style={{ fontSize: '13px', color: 'rgba(103,232,249,0.45)' }}>Direct messaging between doctors and patients</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
          {/* Sidebar */}
          <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: 'rgba(103,232,249,0.3)' }} />
              <input className="input" style={{ paddingLeft: '32px', fontSize: '12px' }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filtered.length === 0 && <p style={{ fontSize: '12px', color: 'rgba(103,232,249,0.3)', textAlign: 'center', marginTop: '20px' }}>No conversations</p>}
              {filtered.map(c => (
                <button key={c.id} onClick={() => setActivePatient(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', border: `1px solid ${activePatient?.id === c.id ? 'rgba(16,185,129,0.4)' : 'rgba(8,145,178,0.15)'}`,
                    background: activePatient?.id === c.id ? 'rgba(16,185,129,0.08)' : 'rgba(2,26,60,0.5)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#0891B2,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User style={{ width: '15px', height: '15px', color: 'white' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#E0F7FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.full_name || 'User'}</p>
                    <p style={{ fontSize: '10px', color: 'rgba(103,232,249,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {!activePatient ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: 'rgba(103,232,249,0.3)' }}>
                <MessageSquare style={{ width: '40px', height: '40px' }} />
                <p style={{ fontSize: '14px' }}>Select a conversation to start chatting</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(8,145,178,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#0891B2,#22D3EE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User style={{ width: '16px', height: '16px', color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#E0F7FF' }}>{activePatient.full_name}</p>
                    <p style={{ fontSize: '11px', color: 'rgba(103,232,249,0.4)' }}>{activePatient.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'rgba(103,232,249,0.3)', fontSize: '13px', marginTop: '40px' }}>No messages yet. Say hello!</div>
                  )}
                  {messages.map(msg => {
                    const mine = msg.from_id === profile.id
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: mine ? '#0891B2' : 'rgba(2,26,60,0.9)', border: mine ? 'none' : '1px solid rgba(8,145,178,0.2)' }}>
                          <p style={{ fontSize: '13px', color: 'white', lineHeight: 1.5 }}>{msg.body}</p>
                          <p style={{ fontSize: '10px', color: mine ? 'rgba(255,255,255,0.5)' : 'rgba(103,232,249,0.35)', marginTop: '4px', textAlign: 'right' }}>
                            {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(8,145,178,0.15)', display: 'flex', gap: '10px' }}>
                  <input className="input" style={{ flex: 1 }} placeholder="Type a message…" value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
                  <button onClick={sendMessage} disabled={!text.trim() || sending} className="btn-primary"
                    style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Send style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
