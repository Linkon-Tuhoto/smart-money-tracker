import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import Hero from "./components/Hero";
import BottomNavbar from "./components/BottomNavbar";
import AuthPage from "./pages/AuthPage";
import { authApi, transactionApi } from "./services/api";
import { Activity, Budgets, Coach, More } from "./pages/OtherPages";

function getUserFromResponse(result) {
  return result?.user || result?.data?.user || result?.data || null;
}

function App() {
  const [activeTab, setActiveTab] = useState("Home");
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const checkSession = useCallback(async () => {
    setCheckingSession(true);
    setSessionError("");
    try {
      const result = await authApi.me();
      setUser(getUserFromResponse(result));
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        setUser(null);
      } else {
        setUser(null);
        setSessionError(error.message);
      }
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loadTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }
    setTransactionsLoading(true);
    try {
      const result = await transactionApi.list({ page: 1, limit: 100 });
      const rows = result?.transactions || result?.data?.transactions || [];
      setTransactions(rows.map((item) => {
        const rawType = String(item.type || "").toLowerCase();
        const amount = Number(item.amount ?? (Number(item.amountMinor || 0) / 100) ?? 0);
        const isIncome = rawType === "income";
        const isExpense = ["expense", "tithe", "withdrawal"].includes(rawType);
        const signedAmount = isIncome ? Math.abs(amount) : isExpense ? -Math.abs(amount) : 0;
        const dateValue = item.transactionDate || item.createdAt;
        return {
          ...item,
          id: item.id || item._id || `${dateValue || "transaction"}-${item.description || "entry"}`,
          title: item.description || item.merchant || item.category || (isIncome ? "Money received" : "Transaction"),
          category: item.category || (item.source === "mpesa" ? "M-Pesa" : "Uncategorised"),
          date: dateValue ? new Date(dateValue).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable",
          amount: signedAmount,
          type: rawType,
          account: item.paymentMethod || item.source || "M-Pesa",
        };
      }));
    } catch (error) {
      console.error("Unable to load transactions:", error.message);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadTransactions();
    else setTransactions([]);
  }, [user, loadTransactions]);

  async function handleAuthenticate(action, formData) {
    const result = action === "register"
      ? await authApi.register(formData)
      : await authApi.login(formData);

    // Some APIs return the user immediately; otherwise verify the cookie via /me.
    const returnedUser = getUserFromResponse(result);
    if (returnedUser) setUser(returnedUser);
    else {
      const session = await authApi.me();
      setUser(getUserFromResponse(session));
    }
    setSessionError("");
    setActiveTab("Home");
    return result;
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch (error) {
      // Clear the local view even if the network is unavailable; the server cookie
      // will still expire according to the backend's cookie policy.
      console.error("Logout request failed:", error.message);
    } finally {
      setUser(null);
      setActiveTab("Home");
      setLoggingOut(false);
    }
  }

  if (checkingSession) {
    return <main className="flex min-h-screen items-center justify-center bg-[#F7F7FC] text-[#30266F]"><div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm"><LoaderCircle className="animate-spin" size={22} /><span className="text-sm font-semibold">Checking your secure session...</span></div></main>;
  }

  if (!user) {
    return <div><AuthPage onAuthenticate={handleAuthenticate} />{sessionError && <div className="fixed bottom-3 left-3 right-3 mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 shadow-lg">Backend connection: Unable to connect. Check Your Internet<button className="ml-2 font-bold underline" onClick={checkSession}>Retry</button></div>}</div>;
  }

  const renderPage = () => {
    switch (activeTab) {
      case "Activity": return <Activity transactions={transactions} onRefresh={loadTransactions} loading={transactionsLoading} />;
      case "Budgets": return <Budgets />;
      case "Coach": return <Coach />;
      case "More": return <More onTransactionsImported={loadTransactions} />;
      default: return <Hero onNavigate={setActiveTab} transactions={transactions} loading={transactionsLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#191A35]">
      <div className="sticky top-0 z-50 flex items-center justify-end gap-3 border-b border-[#E5E6F0] bg-white/95 px-4 py-2 backdrop-blur">
        <span className="max-w-[60vw] truncate text-xs font-semibold text-[#666A85]">{user.fullName || user.name || user.email || "Signed in"}</span>
        <button type="button" onClick={handleLogout} disabled={loggingOut} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#5B4BEE] hover:bg-[#EEEAFE] disabled:opacity-60"><LogOut size={15} />{loggingOut ? "Logging out..." : "Log out"}</button>
      </div>
      {activeTab === "Home" ? renderPage() : <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8">{renderPage()}</main>}
      <BottomNavbar activeTab={activeTab} onNavigate={setActiveTab} />
    </div>
  );
}

export default App;
