import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Wallet } from "lucide-react";

export default function AuthPage({ onAuthenticate }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isRegister && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    setBusy(true);
    try {
      const result = await onAuthenticate(isRegister ? "register" : "login", {
        ...(isRegister ? { fullName: fullName.trim(), phone: phone.trim() || undefined } : {}),
        email: email.trim().toLowerCase(),
        password,
      });
      if (result?.success === false) setError(result.message || "Unable to continue.");
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7FC] px-4 py-8 text-[#191A35]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-violet-100/70 md:grid-cols-2">
        <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#5B4BEE] via-[#4939C7] to-[#30266F] p-10 text-white md:flex">
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border-[42px] border-white/10" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[42px] border-white/10" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Wallet size={25} /></div>
            <div><p className="text-xl font-extrabold">SmartMoney</p><p className="text-sm text-white/70">Your money, your control.</p></div>
          </div>
          <div className="relative max-w-sm">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider"><LockKeyhole size={14} /> Private by design</p>
            <h1 className="text-4xl font-extrabold leading-tight">Make every shilling count.</h1>
            <p className="mt-4 leading-7 text-white/75">Keep track of your spending, understand your habits, and plan your money with more confidence.</p>
          </div>
          <p className="relative text-xs text-white/60">A clearer picture of your money starts here.</p>
        </section>

        <section className="p-6 sm:p-10 md:p-12">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5B4BEE] text-white"><Wallet size={23} /></div>
            <div><p className="font-extrabold">SmartMoney</p><p className="text-xs text-[#777A94]">Your money, your control.</p></div>
          </div>
          <p className="text-sm font-bold text-[#5B4BEE]">WELCOME TO SMARTMONEY</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#777A94]">{isRegister ? "Register to start managing your money securely." : "Log in to view your personal financial dashboard."}</p>

          <div className="mt-7 grid grid-cols-2 rounded-xl bg-[#F7F7FC] p-1">
            <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${!isRegister ? "bg-white text-[#30266F] shadow-sm" : "text-[#777A94]"}`}>Log In</button>
            <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${isRegister ? "bg-white text-[#30266F] shadow-sm" : "text-[#777A94]"}`}>Register</button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isRegister && <label className="block text-sm font-semibold">Full name<input autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required minLength={2} maxLength={100} className="mt-2 w-full rounded-xl border border-[#E5E6F0] px-4 py-3 outline-none transition focus:border-[#5B4BEE] focus:ring-4 focus:ring-violet-100" placeholder="Enter your full name" /></label>}
            <label className="block text-sm font-semibold">Email address<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} className="mt-2 w-full rounded-xl border border-[#E5E6F0] px-4 py-3 outline-none transition focus:border-[#5B4BEE] focus:ring-4 focus:ring-violet-100" placeholder="you@example.com" /></label>
            {isRegister && <label className="block text-sm font-semibold">Phone number <span className="font-normal text-[#777A94]">(optional)</span><input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className="mt-2 w-full rounded-xl border border-[#E5E6F0] px-4 py-3 outline-none transition focus:border-[#5B4BEE] focus:ring-4 focus:ring-violet-100" placeholder="e.g. 07XX XXX XXX" /></label>}
            <label className="block text-sm font-semibold">Password<div className="relative mt-2"><input type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-[#E5E6F0] px-4 py-3 pr-12 outline-none transition focus:border-[#5B4BEE] focus:ring-4 focus:ring-violet-100" placeholder={isRegister ? "At least 8 characters" : "Enter your password"} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#777A94]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">Check Your Connection</div>}
            <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B4BEE] px-4 py-3.5 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-[#4939C7] disabled:cursor-not-allowed disabled:opacity-70">{busy ? <><LoaderCircle size={18} className="animate-spin" /> Please Wait...</> : <>{isRegister ? "Create Acount" : "Log In "}<ArrowRight size={18} /></>}</button>
          </form>
          <p className="mt-6 text-center text-xs leading-5 text-[#777A94]">End to End data encryption</p>
        </section>
      </div>
    </main>
  );
}
