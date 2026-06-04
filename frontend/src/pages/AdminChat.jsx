import { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import { Users, MessageCircle, Send, BookOpen, ChevronRight, Circle } from 'lucide-react';

const AdminChat = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/chat/admin/queries');
      setQueries(data.queries || []);
      if (data.queries?.length > 0) {
        setSelectedQueryId(data.queries[0].id);
      }
    } catch (err) {
      console.error('Failed to load student questions', err);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (queryId) => {
    if (!queryId) return;
    try {
      const { data } = await api.get(`/chat/admin/messages/${queryId}`);
      setSelectedQuery(data.query);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load chat thread', err);
      setSelectedQuery(null);
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    if (selectedQueryId) fetchMessages(selectedQueryId);
  }, [selectedQueryId]);

  const handleReplySend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQueryId) return;

    setSending(true);
    setError(null);
    try {
      const { data } = await api.post(`/chat/admin/reply/${selectedQueryId}`, { message: replyText.trim() });
      setMessages(data.messages || []);
      setSelectedQuery(data.query);
      setReplyText('');
      await fetchQueries();
    } catch (err) {
      console.error('Admin reply error', err);
      setError('Unable to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.04),_transparent_24%),linear-gradient(180deg,#f8fafc,#f1f5f9)] text-slate-800">
      <AdminSidebar />

      <main className="flex-1 p-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Student Questions</h1>
            <p className="text-slate-500 max-w-2xl">View all incoming student queries and answer them directly through this chat interface.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-slate-500 text-sm">Total requests</div>
            <div className="text-3xl font-black text-slate-900">{queries.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
          <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-slate-700">
              <MessageCircle size={20} className="text-cyan-500" />
              <h2 className="font-bold text-lg">Pending Questions</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map((item) => (
                  <div key={item} className="h-20 rounded-[1.5rem] bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : queries.length === 0 ? (
              <div className="text-slate-500">No student questions yet.</div>
            ) : (
              <div className="space-y-3">
                {queries.map((query) => (
                  <button
                    key={query.id}
                    onClick={() => setSelectedQueryId(query.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${selectedQueryId === query.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="font-semibold text-slate-900">{query.student_name || 'Student'}</div>
                        <div className="text-slate-500 text-sm">{query.mobile_number}</div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${query.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {query.status}
                      </span>
                    </div>
                    <div className="text-slate-600 text-sm">{query.college_name} {query.branch_name ? `• ${query.branch_name}` : ''}</div>
                    <div className="mt-3 flex items-center gap-2 text-slate-500 text-xs">
                      <Circle size={10} className="text-slate-400" />
                      {query.latest_message || 'No message yet.'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            {selectedQuery ? (
              <>
                <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-slate-500 text-sm uppercase tracking-[0.24em]">Active thread</div>
                      <h2 className="text-2xl font-black text-slate-900">{selectedQuery.student_name}</h2>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase ${selectedQuery.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {selectedQuery.status}
                    </span>
                  </div>
                  <div className="text-slate-500 text-sm">{selectedQuery.college_name} {selectedQuery.branch_name ? `• ${selectedQuery.branch_name}` : ''}</div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Users size={14} />
                    <span>{selectedQuery.mobile_number}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                  <div className="space-y-4 h-[520px] overflow-y-auto pr-2">
                    {messages.length === 0 ? (
                      <div className="text-slate-500">No messages in this conversation yet.</div>
                    ) : (
                      messages.map((msg, index) => (
                        <div key={index} className={`max-w-[85%] rounded-3xl px-5 py-4 ${msg.sender === 'admin' ? 'ml-auto bg-cyan-600 text-white' : 'bg-white text-slate-900 shadow-sm'}`}>
                          <div className="text-sm leading-relaxed">{msg.message}</div>
                          <div className="mt-3 text-[11px] uppercase tracking-[0.24em] text-slate-500">{msg.sender === 'admin' ? 'You' : selectedQuery.student_name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <form onSubmit={handleReplySend} className="mt-6 space-y-4">
                  {error && <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply here..."
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-3xl bg-cyan-600 px-5 py-4 text-white font-semibold shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={18} />
                    {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                <BookOpen size={38} className="mb-4 text-slate-400" />
                <h3 className="text-xl font-bold text-slate-900">Select a question to answer</h3>
                <p className="mt-3 max-w-md">Choose a student thread from the left panel to review their college query and send a response.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminChat;
