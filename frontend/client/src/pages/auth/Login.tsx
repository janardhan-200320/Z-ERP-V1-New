import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: 'Missing fields', description: 'Please enter both email and password.' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      window.location.href = '/';
    }, 1800);
  };

  return (
    <>
      <style>{`
        @keyframes floatA {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-28px) scale(1.07); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-14px) scale(1.03); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(36px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes formIn {
          from { opacity:0; transform:translateX(24px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes illusIn {
          from { opacity:0; transform:scale(0.94); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes blobMorph {
          0%,100% { border-radius:54% 46% 42% 58% / 48% 44% 56% 52%; }
          33%      { border-radius:42% 58% 58% 42% / 52% 42% 58% 48%; }
          66%      { border-radius:58% 42% 44% 56% / 44% 58% 42% 56%; }
        }
        @keyframes shimmerBtn {
          0%   { left:-60%; }
          100% { left:160%; }
        }
        @keyframes dotPop {
          0%,80%,100% { transform:scale(0); opacity:0.4; }
          40%          { transform:scale(1); opacity:1; }
        }
        @keyframes inputGlow {
          0%,100% { box-shadow:0 0 0 3px rgba(52,168,100,0.15); }
          50%      { box-shadow:0 0 0 4px rgba(52,168,100,0.30); }
        }

        .zb1 { animation:floatA 6.5s ease-in-out infinite; }
        .zb2 { animation:floatB 8.5s ease-in-out infinite; }
        .zb3 { animation:floatC 5.5s ease-in-out infinite; }
        .zb4 { animation:floatA 9s   ease-in-out 1.2s infinite; }
        .zb5 { animation:floatB 7s   ease-in-out 2s   infinite; }
        .zb6 { animation:floatC 10s  ease-in-out 0.5s infinite; }

        .z-card  { animation:cardIn 0.65s cubic-bezier(0.16,1,0.3,1) both; }
        .z-illus { animation:illusIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .z-form  { animation:formIn 0.65s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .z-blob-bg { animation:blobMorph 12s ease-in-out infinite; }

        .z-btn {
          position:relative; overflow:hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .z-btn::after {
          content:'';
          position:absolute; top:0; left:-60%;
          width:45%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent);
          animation:shimmerBtn 2.6s ease-in-out infinite;
          pointer-events:none;
        }
        .z-btn:hover:not(:disabled) {
          transform:translateY(-2px);
          box-shadow:0 12px 32px rgba(30,90,60,0.45);
        }
        .z-btn:active:not(:disabled) { transform:translateY(0); }

        .z-input {
          width:100%;
          padding:14px 18px;
          border-radius:50px;
          border:none;
          outline:none;
          font-size:14px;
          background:#253d30;
          color:#d4ece0;
          transition:background 0.25s, box-shadow 0.25s;
        }
        .z-input::placeholder { color:rgba(160,210,180,0.42); }
        .z-input:focus {
          background:#2d4a3a;
          animation:inputGlow 2s ease-in-out infinite;
        }

        .zd1 { animation:dotPop 1.2s ease-in-out 0s   infinite; }
        .zd2 { animation:dotPop 1.2s ease-in-out 0.2s infinite; }
        .zd3 { animation:dotPop 1.2s ease-in-out 0.4s infinite; }

        .z-forgot { transition:color 0.2s; }
        .z-forgot:hover { color:#a8e6c0 !important; }
        .z-terms  { transition:color 0.2s; }
        .z-terms:hover  { color:#a8e6c0 !important; }
      `}</style>

      {/* PAGE */}
      <div
        className="min-h-screen w-full flex flex-col"
        style={{background:'linear-gradient(140deg,#1a3829 0%,#1e4535 45%,#152e23 100%)'}}
      >
        {/* FLOATING BUBBLES */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{zIndex:0}}>
          <div className="zb1 absolute rounded-full"
            style={{width:240,height:240,top:'4%',left:'2%',background:'rgba(60,140,90,0.16)'}} />
          <div className="zb2 absolute rounded-full"
            style={{width:150,height:150,top:'8%',right:'5%',background:'rgba(60,140,90,0.14)'}} />
          <div className="zb3 absolute rounded-full"
            style={{width:90,height:90,bottom:'18%',left:'7%',background:'rgba(100,180,130,0.12)'}} />
          <div className="zb4 absolute rounded-full"
            style={{width:65,height:65,bottom:'28%',right:'10%',background:'rgba(60,140,90,0.16)'}} />
          <div className="zb5 absolute rounded-full"
            style={{width:180,height:180,bottom:'4%',right:'2%',background:'rgba(60,140,90,0.11)'}} />
          <div className="zb6 absolute rounded-full"
            style={{width:48,height:48,top:'46%',left:'46%',background:'rgba(100,180,130,0.10)'}} />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative" style={{zIndex:1}}>
          {/* CARD */}
          <div
            className="z-card flex overflow-hidden w-full"
            style={{
              maxWidth:880,
              minHeight:500,
              borderRadius:26,
              background:'#ffffff',
              boxShadow:'0 32px 80px rgba(0,0,0,0.38), 0 8px 28px rgba(0,0,0,0.22)',
            }}
          >
            {/* ── LEFT: ILLUSTRATION ── */}
            <div
              className="z-illus hidden md:flex flex-col justify-between relative overflow-hidden"
              style={{width:'46%', background:'#ffffff', padding:'30px 26px'}}
            >
              {/* Logo */}
              <div className="flex items-center gap-2.5 relative z-10">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0"
                  style={{background:'linear-gradient(135deg,#2a7248,#1a5232)'}}
                >
                  Z
                </div>
                <div>
                  <div className="font-black text-sm leading-tight" style={{color:'#1a4530'}}>Z-ERP</div>
                  <div className="text-xs font-medium" style={{color:'#528a68'}}>Enterprise Platform</div>
                </div>
              </div>

              {/* Organic blob background */}
              <div
                className="z-blob-bg absolute"
                style={{
                  width:320, height:320,
                  top:'50%', left:'50%',
                  transform:'translate(-50%,-50%)',
                  background:'linear-gradient(135deg,#e6f5ec 0%,#d0edda 55%,#c2e6d0 100%)',
                  zIndex:0,
                }}
              />

              {/* Decorative dots on blob */}
              <div className="absolute rounded-full zb3"
                style={{width:26,height:26,top:'22%',left:'16%',background:'rgba(100,190,140,0.38)',zIndex:1}} />
              <div className="absolute rounded-full zb1"
                style={{width:16,height:16,top:'58%',left:'10%',background:'rgba(100,190,140,0.28)',zIndex:1}} />
              <div className="absolute rounded-full zb2"
                style={{width:20,height:20,top:'28%',right:'10%',background:'rgba(100,190,140,0.32)',zIndex:1}} />
              <div className="absolute rounded-full zb4"
                style={{width:12,height:12,bottom:'26%',right:'18%',background:'rgba(100,190,140,0.22)',zIndex:1}} />

              {/* SVG ERP Illustration */}
              <div className="relative z-10 flex items-center justify-center py-4">
                <svg viewBox="0 0 300 260" width="270" height="230" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="150" cy="242" rx="108" ry="11" fill="rgba(60,120,80,0.10)" />
                  <rect x="58" y="58" width="184" height="122" rx="13" fill="#1a3829" />
                  <rect x="67" y="67" width="166" height="104" rx="8" fill="#253d30" />
                  <rect x="84"  y="120" width="17" height="42" rx="4" fill="rgba(110,210,150,0.85)" />
                  <rect x="109" y="100" width="17" height="62" rx="4" fill="rgba(80,185,125,0.9)" />
                  <rect x="134" y="112" width="17" height="50" rx="4" fill="rgba(110,210,150,0.75)" />
                  <rect x="159" y="90"  width="17" height="72" rx="4" fill="rgba(60,165,105,0.95)" />
                  <rect x="184" y="105" width="17" height="57" rx="4" fill="rgba(96,205,145,0.80)" />
                  <polyline points="84,116 109,97 134,109 159,87 184,101 208,92"
                    stroke="rgba(170,240,195,0.65)" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="159" cy="87" r="4.5" fill="#b0f0d0" />
                  <rect x="134" y="180" width="32" height="17" rx="5" fill="#1a3829" />
                  <rect x="116" y="195" width="68" height="9" rx="4.5" fill="#122a1e" />
                  <circle cx="50"  cy="175" r="13" fill="#f5c8a8" />
                  <rect x="38" y="188" width="24" height="34" rx="9" fill="#2a7248" />
                  <line x1="38" y1="200" x2="26" y2="215" stroke="#f5c8a8" strokeWidth="5.5" strokeLinecap="round" />
                  <line x1="62" y1="200" x2="72" y2="212" stroke="#f5c8a8" strokeWidth="5.5" strokeLinecap="round" />
                  <line x1="42" y1="222" x2="38" y2="242" stroke="#253d30" strokeWidth="5.5" strokeLinecap="round" />
                  <line x1="58" y1="222" x2="62" y2="242" stroke="#253d30" strokeWidth="5.5" strokeLinecap="round" />
                  <circle cx="250" cy="175" r="13" fill="#f5c8a8" />
                  <rect x="238" y="188" width="24" height="34" rx="9" fill="#478c60" />
                  <line x1="238" y1="200" x2="226" y2="212" stroke="#f5c8a8" strokeWidth="5.5" strokeLinecap="round" />
                  <line x1="262" y1="200" x2="272" y2="215" stroke="#f5c8a8" strokeWidth="5.5" strokeLinecap="round" />
                  <line x1="242" y1="222" x2="238" y2="242" stroke="#253d30" strokeWidth="5.5" strokeLinecap="round" />
                  <line x1="258" y1="222" x2="262" y2="242" stroke="#253d30" strokeWidth="5.5" strokeLinecap="round" />
                  <rect x="18" y="70" width="62" height="38" rx="9"
                    fill="white" />
                  <rect x="26" y="79" width="26" height="7" rx="3.5" fill="#c6e8d4" />
                  <rect x="26" y="92" width="18" height="5" rx="2.5" fill="#e0f2e8" />
                  <rect x="48" y="90" width="22" height="9" rx="4.5" fill="#2a7248" />
                  <rect x="220" y="60" width="68" height="40" rx="9"
                    fill="white" />
                  <circle cx="235" cy="77" r="8" fill="#c6e8d4" />
                  <rect x="248" y="70" width="30" height="6" rx="3" fill="#daeee4" />
                  <rect x="248" y="80" width="22" height="6" rx="3" fill="#eaf6f0" />
                </svg>
              </div>

              <div className="relative z-10 text-center">
                <p className="text-xs font-semibold" style={{color:'#528a68'}}>Smart Business · 2026</p>
              </div>
            </div>

            {/* ── RIGHT: LOGIN FORM ── */}
            <div
              className="z-form flex-1 flex flex-col justify-center"
              style={{padding:'44px 46px', background:'#ffffff'}}
            >
              {/* Mobile logo */}
              <div className="md:hidden flex items-center gap-2.5 mb-8">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white"
                  style={{background:'linear-gradient(135deg,#2a7248,#1a5232)'}}>Z</div>
                <span className="font-black text-xl" style={{color:'#1a4530'}}>Z-ERP</span>
              </div>

              <h1 className="text-4xl font-black mb-8"
                style={{color:'#0f2a1c', letterSpacing:'-0.025em'}}>
                Login
              </h1>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{color:'#1e3a28'}}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="z-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{color:'#1e3a28'}}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="z-input"
                      style={{paddingRight:48}}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                      style={{color:'#a8d8bc'}}
                    >
                      {showPassword
                        ? <EyeOff style={{width:17,height:17}} />
                        : <Eye    style={{width:17,height:17}} />}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                <div className="text-right">
                  <a href="/forgot-password" className="z-forgot text-xs font-semibold"
                    style={{color:'#528a68'}}>
                    Forgot Password?
                  </a>
                </div>

                {/* Sign In */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="z-btn w-full py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                  style={{
                    borderRadius:50,
                    background:'linear-gradient(135deg,#3a8a5c 0%,#2a7248 55%,#1a5232 100%)',
                    boxShadow:'0 6px 22px rgba(36,100,65,0.40)',
                    border:'none',
                    cursor:'pointer',
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="zd1 inline-block w-1.5 h-1.5 rounded-full bg-green-200" />
                      <span className="zd2 inline-block w-1.5 h-1.5 rounded-full bg-green-200" />
                      <span className="zd3 inline-block w-1.5 h-1.5 rounded-full bg-green-200" />
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <a href="#" className="z-terms text-xs" style={{color:'#7aaa90'}}>
                  Terms and Services
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className="relative flex items-center justify-between px-8 py-3 text-xs"
          style={{zIndex:1, color:'rgba(140,195,165,0.5)', borderTop:'1px solid rgba(60,140,90,0.10)'}}
        >
          <span>&#169; 2026 Z-ERP &middot; All rights reserved</span>
          <span>
            Need help?{' '}
            <a href="mailto:support@z-erp.com"
              style={{color:'rgba(140,195,165,0.6)', textDecoration:'underline'}}>
              support@z-erp.com
            </a>
          </span>
        </div>
      </div>
    </>
  );
}

