import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, MessageCircle, Send, Info, LogOut } from 'lucide-react';

const AskQuestion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const params = new URLSearchParams(location.search);
  const collegeId = params.get('collegeId');
  const collegeName = params.get('collegeName');
  const branchCode = params.get('branchCode');
  const branchName = params.get('branchName');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState('You will get a reply within one hour.');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversation = async () => {
      setLoading(true);
      try {
        const url = collegeId ? `/chat/conversation?collegeId=${collegeId}` : '/chat/conversation';
        const { data } = await api.get(url);
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to fetch conversation', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [collegeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    setError(null);
    try {
      const { data } = await api.post('/chat/questions', {
        college_id: collegeId,
        college_name: collegeName,
        branch_code: branchCode,
        branch_name: branchName,
        question: message.trim()
      });

      setConversation(data.query);
      setMessages(data.messages || []);
      setStatusMessage('Your question has been submitted. You will get a reply within one hour.');
      setMessage('');
    } catch (err) {
      console.error('Send Question Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unable to send your message. Please try again.';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-xl">
          <h2 className="text-2xl font-black text-slate-900 mb-4">Login Required</h2>
          <p className="text-slate-500 mb-6">Please log in as a student to ask questions.</p>
          <button onClick={() => navigate('/student-login')} className="btn-primary px-6 py-3">Go to Login</button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.06),_transparent_18%),linear-gradient(180deg,#f8fafc,#f1f5f9)] text-slate-800">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-slate-800 uppercase tracking-[0.24em] text-sm">
            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-cyan-500 text-white">Q</div>
            <span>Student Support</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">{user?.name}</span>
            <button onClick={logout} className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link to="/results" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-semibold mb-3">
              <ChevronLeft size={16} /> Back to results
            </Link>
            <h1 className="text-4xl font-black text-slate-900">Ask a Question</h1>
            <p className="mt-3 text-slate-500 max-w-2xl">
              {collegeName ? (
                <>Send your question about <span className="font-semibold text-slate-900">{collegeName}</span> and our admin team will reply within an hour.</>
              ) : (
                'Send your question and our admin team will reply within an hour.'
              )}
            </p>
          </div>
          {collegeName && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-600">
              <MessageCircle size={18} className="text-cyan-500" />
              <span className="font-semibold">College</span>
            </div>
            <div className="text-slate-800 font-bold text-lg">{collegeName}</div>
            <div className="mt-2 text-sm text-slate-500">{branchName ? `${branchName} • ${branchCode}` : branchCode}</div>
          </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-8">
          <section className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle size={20} className="text-cyan-500" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">Conversation</h2>
                <p className="text-sm text-slate-500">Your questions and replies are shown here.</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map((n) => (
                  <div key={n} className="h-16 rounded-3xl bg-slate-100 animate-pulse"></div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="text-slate-500">No messages yet. Ask your first question below.</div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`rounded-3xl p-4 ${msg.sender === 'admin' ? 'bg-slate-100 self-start' : 'bg-cyan-600 text-white self-end'} max-w-[92%]`}> 
                    <div className="text-sm leading-relaxed">{msg.message}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-slate-500">{msg.sender === 'admin' ? 'Admin reply' : 'You'}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <Info size={18} className="text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900">Ready to ask?</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">Our admin team will receive your question immediately. Please keep the message clear and specific.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your question here..."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none focus:border-cyan-500 focus:bg-white transition"
              />
              {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-3 rounded-3xl bg-cyan-600 px-5 py-4 text-white font-semibold shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={18} />
                {sending ? 'Sending...' : 'Send Question'}
              </button>
            </form>

            <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50 p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Answer Time</p>
              <p className="mt-2">{statusMessage}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AskQuestion;
