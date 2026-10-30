import {
  Wallet,
  Smartphone,
  Building2,
  Plus,
  ArrowLeft,
  ArrowLeftRight,
  ArrowDownLeft,
  Upload,
  FileText,
  PiggyBank,
  Settings,
  ChartNoAxesCombined,
  Target,
  Sparkles,
  MessageCircle,
  Send,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Eye,
  Bell,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CircleHelp,
} from "lucide-react";
import React from "react";
import { accountApi, transactionApi, budgetApi } from "../services/api";

const money = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);

function PageHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#5B4BEE]">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm leading-6 text-[#666A85] sm:text-base">
        {description}
      </p>
    </div>
  );
}


function Activity({ transactions: sharedTransactions, onRefresh, loading = false }) {
  const [filter, setFilter] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [type, setType] = React.useState("Expense");
  const [transactions, setTransactions] = React.useState([]);
  React.useEffect(() => { if (Array.isArray(sharedTransactions)) setTransactions(sharedTransactions); }, [sharedTransactions]);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);
  const [transactionError, setTransactionError] = React.useState("");

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoadingTransactions(true);
      setTransactionError("");
      try {
        const result = await transactionApi.list({ page: 1, limit: 100 });
        const rows = result?.transactions || result?.data?.transactions || [];
        if (active) setTransactions(rows.map((item) => {
          const rawType = String(item.type || "").toLowerCase();
          const rawAmount = Number(item.amount ?? (Number(item.amountMinor || 0) / 100));
          const amount = Math.abs(rawAmount);
          const dateValue = item.transactionDate || item.createdAt;
          return {
            id: item.id || item._id,
            title: item.description || item.merchant || item.category || "Transaction",
            category: item.category || "Uncategorised",
            date: dateValue ? new Date(dateValue).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" }) : "Date unavailable",
            amount,
            type: rawType === "income" ? "Income" : rawType === "expense" ? "Expense" : rawType,
            account: item.paymentMethod || item.source || "M-Pesa",
          };
        }));
      } catch (error) {
        if (active) setTransactionError(error.message || "Unable to load transactions.");
      } finally {
        if (active) setLoadingTransactions(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const [form, setForm] = React.useState({
    title: "",
    category: "Food",
    amount: "",
    account: "M-Pesa",
  });

  const money = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const income = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const visibleTransactions = transactions.filter((item) => {
    const matchesFilter =
      filter === "All" || item.type === filter;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.account.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title: form.title.trim(),
      category: form.category,
      date: "Just now",
      amount,
      type,
      account: form.account,
    };

    setTransactions((previous) => [
      newTransaction,
      ...previous,
    ]);

    setForm({
      title: "",
      category: "Food",
      amount: "",
      account: "M-Pesa",
    });

    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-[#5B4BEE]">
            YOUR MONEY MOVEMENT
          </p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            Activity
          </h1>
          <p className="mt-2 text-sm text-[#666A85] sm:text-base">
            Every transaction tells a story. Keep yours organised.
          </p>
        </div>

        <button
          onClick={() => setShowForm((previous) => !previous)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B4BEE] px-5 py-3 font-bold text-white transition hover:bg-[#4939C7]"
        >
          <Plus size={19} />
          Add transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E5E6F0] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ArrowDownLeft size={23} />
          </div>
          <p className="mt-4 text-sm font-medium text-[#666A85]">
            Total income
          </p>
          <p className="mt-1 text-2xl font-extrabold">
            {money(income)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E6F0] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <ArrowUpRight size={23} />
          </div>
          <p className="mt-4 text-sm font-medium text-[#666A85]">
            Total expenses
          </p>
          <p className="mt-1 text-2xl font-extrabold">
            {money(expenses)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E5E6F0] bg-white p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEEAFE] text-[#5B4BEE]">
            <Wallet size={23} />
          </div>
          <p className="mt-4 text-sm font-medium text-[#666A85]">
            Net movement
          </p>
          <p className="mt-1 text-2xl font-extrabold">
            {money(income - expenses)}
          </p>
        </div>
      </div>

      {/* Add transaction form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-[#E5E6F0] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">
              Record a transaction
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-[#666A85] hover:bg-[#F7F7FC]"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Transaction type
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white p-3 outline-none focus:border-[#5B4BEE]"
              >
                <option>Expense</option>
                <option>Income</option>
              </select>
            </label>

            <label className="text-sm font-semibold">
              Description
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                placeholder="e.g. Farm labour"
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] p-3 outline-none focus:border-[#5B4BEE]"
              />
            </label>

            <label className="text-sm font-semibold">
              Amount (KSh)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                placeholder="e.g. 1500"
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] p-3 outline-none focus:border-[#5B4BEE]"
              />
            </label>

            <label className="text-sm font-semibold">
              Category
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white p-3 outline-none focus:border-[#5B4BEE]"
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Farming</option>
                <option>Salary</option>
                <option>Business</option>
                <option>Tithe & giving</option>
                <option>Other</option>
              </select>
            </label>

            <label className="text-sm font-semibold sm:col-span-2">
              Account
              <select
                value={form.account}
                onChange={(event) =>
                  setForm({ ...form, account: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white p-3 outline-none focus:border-[#5B4BEE]"
              >
                <option>M-Pesa</option>
                <option>Cash</option>
                <option>Bank</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#5B4BEE] px-5 py-3 font-bold text-white transition hover:bg-[#4939C7] sm:w-auto"
          >
            Save transaction
          </button>
        </form>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl border border-[#E5E6F0] bg-white px-4 py-3">
        <Search size={20} className="shrink-0 text-[#666A85]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by description, category or account..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", "Income", "Expense"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              filter === item
                ? "bg-[#5B4BEE] text-white"
                : "border border-[#E5E6F0] bg-white text-[#666A85] hover:bg-[#EEEAFE]"
            }`}
          >
            {item === "Expense" ? "Expenses" : item}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <section className="rounded-3xl border border-[#E5E6F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold">
              Transactions
            </h2>
            <p className="mt-1 text-sm text-[#666A85]">
              {visibleTransactions.length} records shown
            </p>
          </div>
        </div>

        {transactionError && <p className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{transactionError}</p>}
        {(loadingTransactions || loading) && <p className="py-3 text-sm text-[#666A85]">Loading your saved transactions…</p>}
        {visibleTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <Search className="mx-auto text-[#8A8DA5]" size={30} />
            <p className="mt-3 font-bold">No transactions found</p>
            <p className="mt-1 text-sm text-[#666A85]">
              Try another search or filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0F7]">
            {visibleTransactions.map((item) => {
              const isIncome = item.type === "Income";

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isIncome
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-[#EEEAFE] text-[#5B4BEE]"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft size={21} />
                    ) : (
                      <ArrowUpRight size={21} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{item.title}</p>
                    <p className="mt-1 text-xs text-[#666A85]">
                      {item.category} · {item.account}
                    </p>
                    <p className="mt-1 text-xs text-[#8A8DA5]">
                      {item.date}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-extrabold sm:text-base ${
                      isIncome ? "text-emerald-600" : "text-[#191A35]"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {money(item.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* M-Pesa import is available under More → Import M-Pesa messages. */}
      <section className="rounded-2xl border border-blue-100 bg-[#EAF3FF] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
            <Smartphone size={23} />
          </div>
          <div>
            <h3 className="font-extrabold text-blue-950">Import M-Pesa messages</h3>
            <p className="mt-1 text-sm leading-6 text-blue-900">
              Open More → Import M-Pesa messages to import your actual messages. Only successfully saved transactions will appear here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


function Budgets() {
  // Start empty and load only budgets saved for the signed-in user.
  const [budgets, setBudgets] = React.useState([]);
  const [loadingBudgets, setLoadingBudgets] = React.useState(true);
  const [budgetError, setBudgetError] = React.useState("");

  const loadBudgets = React.useCallback(async () => {
    setLoadingBudgets(true);
    setBudgetError("");
    try {
      const result = await budgetApi.list();
      const rows = result?.budgets || result?.data?.budgets || result?.data || [];
      const list = Array.isArray(rows) ? rows : [];
      setBudgets(list.map((item, index) => ({
        ...item,
        id: item.id || item._id || `budget-${index}`,
        name: item.name || item.category || "Budget",
        limit: Number(item.limit ?? item.amount ?? item.monthlyLimit ?? 0),
        spent: Number(item.spent ?? item.spentAmount ?? 0),
        color: item.color || ["#5B4BEE", "#4D8DFA", "#F47770", "#16A6A1"][index % 4],
      })));
    } catch (error) {
      setBudgets([]);
      setBudgetError(error.message || "Could not load your saved budgets.");
    } finally {
      setLoadingBudgets(false);
    }
  }, []);

  React.useEffect(() => { loadBudgets(); }, [loadBudgets]);

  const [showForm, setShowForm] = React.useState(false);
  const [budgetName, setBudgetName] = React.useState("Food & groceries");
  const [customName, setCustomName] = React.useState("");
  const [budgetLimit, setBudgetLimit] = React.useState("");
  const [period, setPeriod] = React.useState("Monthly");
  const [message, setMessage] = React.useState("");

  // No sample goals: the backend currently exposes no savings-goal API.
  const [goals] = React.useState([]);


  const money = (amount) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(amount);

  const totalLimit = budgets.reduce(
    (sum, budget) => sum + budget.limit,
    0
  );

  const totalSpent = budgets.reduce(
    (sum, budget) => sum + budget.spent,
    0
  );

  const totalRemaining = totalLimit - totalSpent;

  async function createBudget(event) {
    event.preventDefault();

    const name = budgetName === "Other" ? customName.trim() : budgetName;
    const limit = Number(budgetLimit);

    if (!name || !Number.isFinite(limit) || limit <= 0) {
      setMessage("Enter a category and a valid budget amount.");
      return;
    }

    if (budgets.some((budget) => budget.name.toLowerCase() === name.toLowerCase())) {
      setMessage("A budget with that category already exists.");
      return;
    }

    try {
      await budgetApi.create({ category: name, name, limit, period: period.toLowerCase() });
      await loadBudgets();
      setBudgetLimit("");
      setCustomName("");
      setBudgetName("Food & groceries");
      setMessage(`${name} budget saved successfully.`);
      setShowForm(false);
    } catch (error) {
      setMessage(error.message || "Could not save this budget to your account.");
    }
  }


  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="PLAN WITH PURPOSE"
        title="Budgets & savings"
        description="Give every shilling a purpose and work towards your financial goals."
      />

      {budgetError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{budgetError}</p>}

      {/* Budget overview */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B4BEE] to-[#30266F] p-6 text-white shadow-lg shadow-violet-200/50 sm:p-8">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-white/5" />

        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-medium text-violet-100">
            <ChartNoAxesCombined size={19} />
            Total budget allocation
          </div>

          <p className="mt-3 text-3xl font-extrabold sm:text-4xl">
            {money(totalLimit)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-violet-100">Spent so far</p>
              <p className="mt-2 text-lg font-extrabold">
                {money(totalSpent)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-violet-100">Remaining</p>
              <p className="mt-2 text-lg font-extrabold">
                {money(totalRemaining)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-violet-100">Overall budget used</span>
            <span className="font-bold">
              {totalLimit > 0
                ? Math.round((totalSpent / totalLimit) * 100)
                : 0}%
            </span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{
                width: `${
                  totalLimit > 0
                    ? Math.min(100, (totalSpent / totalLimit) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Budget list heading */}
      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold">Your budgets</h2>
            <p className="mt-1 text-sm text-[#666A85]">
              Monitor spending by category.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((previous) => !previous);
              setMessage("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5B4BEE] px-5 py-3 font-bold text-white transition hover:bg-[#4939C7]"
          >
            <Plus size={19} />
            Create budget
          </button>
        </div>

        {/* Create budget form */}
        {showForm && (
          <form
            onSubmit={createBudget}
            className="mt-5 space-y-4 rounded-3xl border border-[#E5E6F0] bg-white p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold">
                Set up a budget
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm font-bold text-[#666A85]"
              >
                Cancel
              </button>
            </div>

            <label className="block text-sm font-semibold">
              Category
              <select
                value={budgetName}
                onChange={(event) => setBudgetName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white p-3 outline-none focus:border-[#5B4BEE]"
              >
                <option>Food & groceries</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Farm supplies</option>
                <option>Entertainment</option>
                <option>Bills</option>
                <option>Other</option>
              </select>
            </label>

            {budgetName === "Other" && (
              <label className="block text-sm font-semibold">
                Custom category name
                <input
                  required
                  value={customName}
                  onChange={(event) => setCustomName(event.target.value)}
                  placeholder="e.g. School fees"
                  className="mt-2 w-full rounded-xl border border-[#E5E6F0] p-3 outline-none focus:border-[#5B4BEE]"
                />
              </label>
            )}

            <label className="block text-sm font-semibold">
              Budget limit (KSh)
              <input
                required
                type="number"
                min="1"
                step="1"
                value={budgetLimit}
                onChange={(event) => setBudgetLimit(event.target.value)}
                placeholder="e.g. 5000"
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] p-3 outline-none focus:border-[#5B4BEE]"
              />
            </label>

            <label className="block text-sm font-semibold">
              Budget period
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white p-3 outline-none focus:border-[#5B4BEE]"
              >
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </label>

            <p className="text-xs leading-5 text-[#666A85]">
              Selected period: {period}. Periods are currently for display
              only; automatic period resets will be added later.
            </p>

            {message && (
              <p role="status" className="text-sm font-semibold text-[#5B4BEE]">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#5B4BEE] px-5 py-3 font-bold text-white hover:bg-[#4939C7]"
            >
              Save budget
            </button>
          </form>
        )}

        {message && !showForm && (
          <p role="status" className="mt-3 text-sm font-semibold text-[#5B4BEE]">
            {message}
          </p>
        )}

        {/* Only budgets returned by the backend are displayed. */}
        {loadingBudgets && <p className="mt-5 text-sm text-[#666A85]">Loading your saved budgets…</p>}
        {!loadingBudgets && !budgetError && budgets.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-[#D8D9E8] bg-white p-8 text-center">
            <PiggyBank className="mx-auto text-[#8A8DA5]" size={32} />
            <h3 className="mt-3 font-extrabold">No budgets yet</h3>
            <p className="mt-1 text-sm text-[#666A85]">Create a budget to start tracking spending. Your totals will update when real transactions are recorded.</p>
          </div>
        )}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {budgets.map((budget) => {
            const percentage = Math.round(
              (budget.spent / budget.limit) * 100
            );

            const exceeded = budget.spent > budget.limit;
            const nearLimit = percentage >= 80 && !exceeded;

            return (
              <article
                key={budget.id}
                className="rounded-2xl border border-[#E5E6F0] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-11 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <div>
                      <h3 className="font-extrabold">{budget.name}</h3>
                      <p className="mt-1 text-sm text-[#666A85]">
                        {money(budget.spent)} spent of {money(budget.limit)}
                      </p>
                    </div>
                  </div>

                  <span className="text-lg font-extrabold">
                    {percentage}%
                  </span>
                </div>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#F0F0F7]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: exceeded
                        ? "#F47770"
                        : nearLimit
                        ? "#E9A23B"
                        : budget.color,
                    }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      exceeded
                        ? "text-red-600"
                        : nearLimit
                        ? "text-amber-700"
                        : "text-[#666A85]"
                    }`}
                  >
                    {exceeded
                      ? `${money(budget.spent - budget.limit)} over budget`
                      : nearLimit
                      ? "Approaching budget limit"
                      : `${money(budget.limit - budget.spent)} remaining`}
                  </p>

                  {(nearLimit || exceeded) && (
                    <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                      {exceeded ? "Limit exceeded" : "Watch spending"}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Savings goals */}
      <section>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold">Savings goals</h2>
            <p className="mt-1 text-sm text-[#666A85]">
              Small steps towards bigger plans.
            </p>
          </div>


        </div>


        {goals.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-[#D8D9E8] bg-white p-6 text-sm leading-6 text-[#666A85]">
            No savings goals yet. Sample goals have been removed so this section does not show made-up amounts. Persistent savings goals need a backend endpoint before they can be saved safely.
          </div>
        )}
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const percentage = Math.round(
              (goal.saved / goal.target) * 100
            );

            return (
              <article
                key={goal.id}
                className="rounded-2xl border border-[#E5E6F0] bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEEAFE] text-[#5B4BEE]">
                    <PiggyBank size={24} />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-extrabold">{goal.name}</h3>
                    <p className="mt-1 text-sm text-[#666A85]">
                      {money(goal.saved)} saved
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-[#5B4BEE]">
                    {percentage}%
                  </span>
                </div>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#F0F0F7]">
                  <div
                    className="h-full rounded-full bg-[#5B4BEE]"
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <span className="text-[#666A85]">
                    Target: {money(goal.target)}
                  </span>
                  <span className="font-bold">
                    {money(Math.max(0, goal.target - goal.saved))} to go
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-[#EAF3FF] p-5">
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 shrink-0 text-blue-600" size={23} />
          <div>
            <h3 className="font-extrabold text-blue-950">
              Your plan, your pace
            </h3>
            <p className="mt-1 text-sm leading-6 text-blue-900">
              Budget totals are loaded from your saved budgets. Savings-goal tracking will be enabled once a persistent savings-goal API is available.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


function Coach() {
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      role: "coach",
      text: "Hello! 👋 I'm your Money Coach. I can help you think through your spending habits, budgets and savings goals. What would you like to work on today?",
    },
  ]);

  const suggestions = [
    "Where does most of my money go?",
    "How can I reduce my spending?",
    "How can I save more money?",
    "Help me plan my monthly budget",
  ];

  function getDemoReply(text) {
    const value = text.toLowerCase();

    if (value.includes("save")) {
      return "A useful first step is to set a realistic savings target and review your spending categories. Try choosing an amount you can set aside regularly without neglecting essential expenses. This is a demo suggestion, not an analysis of your actual finances.";
    }

    if (value.includes("budget") || value.includes("plan")) {
      return "Start by listing essential expenses, such as food, housing, transport and bills. Set reasonable limits for each category, then leave room for unexpected costs. Once your actual transactions are connected, this coach can help you compare your spending against those limits.";
    }

    if (value.includes("reduce") || value.includes("spending")) {
      return "Review your recent purchases and identify expenses you could reduce without affecting your essential needs. Small, consistent changes may help. Your actual spending records will be needed before I can identify which categories offer the best opportunity.";
    }

    if (value.includes("most") || value.includes("money go")) {
      return "Your dashboard currently contains sample spending figures. To identify where most of your money goes accurately, we will need to analyse your reviewed transactions and group them by category.";
    }

    return "That's a good question to explore. A helpful starting point is to review your recorded income, expenses and budget limits. This demo coach does not yet analyse your personal financial records, but we'll connect that functionality later.";
  }

  function sendMessage(event) {
    event.preventDefault();

    const text = question.trim();

    if (!text) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    const coachMessage = {
      id: Date.now() + 1,
      role: "coach",
      text: getDemoReply(text),
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      coachMessage,
    ]);

    setQuestion("");
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <PageHeader
        eyebrow="YOUR FINANCIAL COMPANION"
        title="Money Coach"
        description="Build healthier money habits, one decision at a time."
      />

      {/* Coach welcome card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B4BEE] via-[#4939C7] to-[#30266F] p-6 text-white shadow-lg shadow-violet-200/50 sm:p-8">
        <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border-[26px] border-white/5" />
        <div className="absolute -bottom-16 right-32 h-36 w-36 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Sparkles size={29} />
          </div>

          <p className="mt-5 text-sm font-bold text-violet-100">
            YOUR MONEY, YOUR FUTURE
          </p>

          <h2 className="mt-2 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
            Make better money decisions with confidence.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100 sm:text-base">
            Explore practical ways to budget, save and understand your
            financial habits. Your personalised insights will become
            available when your real transaction data is connected.
          </p>
        </div>
      </section>

      {/* Demo notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#EAF3FF] p-4">
        <CircleHelp className="mt-0.5 shrink-0 text-blue-600" size={22} />
        <div>
          <p className="font-bold text-blue-950">
            Interactive demo
          </p>
          <p className="mt-1 text-sm leading-6 text-blue-900">
            Replies below are predefined examples, not AI-generated financial
            analysis. Your actual account data has not been connected.
          </p>
        </div>
      </div>

      {/* Sample insights */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold">Your financial toolkit</h2>
          <p className="mt-1 text-sm text-[#666A85]">
            A few areas to focus on as you build good money habits.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[#E5E6F0] bg-white p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEEAFE] text-[#5B4BEE]">
              <Wallet size={23} />
            </span>
            <h3 className="mt-4 font-extrabold">Understand your spending</h3>
            <p className="mt-2 text-sm leading-6 text-[#666A85]">
              Record purchases with useful descriptions so you can see
              which categories receive the most money.
            </p>
          </article>

          <article className="rounded-2xl border border-[#E5E6F0] bg-white p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5F7F3] text-teal-700">
              <PiggyBank size={23} />
            </span>
            <h3 className="mt-4 font-extrabold">Build your savings</h3>
            <p className="mt-2 text-sm leading-6 text-[#666A85]">
              Set achievable goals and monitor your progress as you
              put money aside.
            </p>
          </article>

          <article className="rounded-2xl border border-[#E5E6F0] bg-white p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E5] text-orange-600">
              <ChartNoAxesCombined size={23} />
            </span>
            <h3 className="mt-4 font-extrabold">Stay within your budget</h3>
            <p className="mt-2 text-sm leading-6 text-[#666A85]">
              Review your category limits regularly and adjust them
              when your circumstances change.
            </p>
          </article>
        </div>
      </section>

      {/* Chat interface */}
      <section className="overflow-hidden rounded-3xl border border-[#E5E6F0] bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-[#E5E6F0] p-5 sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEEAFE] text-[#5B4BEE]">
            <MessageCircle size={25} />
          </div>

          <div className="flex-1">
            <h2 className="font-extrabold">Chat with your coach</h2>
            <p className="mt-1 text-xs text-[#666A85]">
              Demo conversation · Sample responses
            </p>
          </div>

          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        </div>

        {/* Suggested questions */}
        <div className="border-b border-[#E5E6F0] p-4 sm:p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#666A85]">
            Try asking
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuestion(suggestion)}
                className="rounded-xl border border-[#E5E6F0] bg-[#F7F7FC] px-3 py-2.5 text-left text-sm font-semibold text-[#30266F] transition hover:border-[#5B4BEE] hover:bg-[#EEEAFE]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div
          aria-live="polite"
          className="max-h-[480px] min-h-64 space-y-5 overflow-y-auto bg-[#FAFAFE] p-4 sm:p-6"
        >
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isUser ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isUser
                      ? "bg-[#EAF3FF] text-blue-700"
                      : "bg-[#EEEAFE] text-[#5B4BEE]"
                  }`}
                >
                  {isUser ? (
                    <UserRound size={19} />
                  ) : (
                    <Sparkles size={19} />
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 sm:max-w-[78%] ${
                    isUser
                      ? "rounded-tr-sm bg-[#5B4BEE] text-white"
                      : "rounded-tl-sm border border-[#E5E6F0] bg-white text-[#191A35]"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message input */}
        <form
          onSubmit={sendMessage}
          className="border-t border-[#E5E6F0] bg-white p-4 sm:p-5"
        >
          <label htmlFor="coach-message" className="sr-only">
            Your question
          </label>

          <div className="flex items-end gap-2 rounded-2xl border border-[#E5E6F0] bg-[#F7F7FC] p-2 focus-within:border-[#5B4BEE]">
            <textarea
              id="coach-message"
              rows={2}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  event.currentTarget.form.requestSubmit();
                }
              }}
              placeholder="Ask about budgeting, spending or savings..."
              className="max-h-32 min-h-12 flex-1 resize-y bg-transparent px-2 py-3 text-sm outline-none"
            />

            <button
              type="submit"
              disabled={!question.trim()}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5B4BEE] text-white transition hover:bg-[#4939C7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={19} />
            </button>
          </div>

          <p className="mt-3 text-xs text-[#8A8DA5]">
            Press Enter to send, or Shift + Enter for a new line.
          </p>
        </form>
      </section>
    </div>
  );
}



function More({ onTransactionsImported }) {
  const [section, setSection] = React.useState("menu");

  const [accounts, setAccounts] = React.useState([]);
  const [accountsLoading, setAccountsLoading] = React.useState(true);
  const [accountError, setAccountError] = React.useState("");
  const [totalBalanceFromApi, setTotalBalanceFromApi] = React.useState(0);
  const [importingMessages, setImportingMessages] = React.useState(false);
  const [importResult, setImportResult] = React.useState(null);

  const [accountName, setAccountName] = React.useState("");
  const [accountType, setAccountType] = React.useState("Cash");
  const [showAccountForm, setShowAccountForm] = React.useState(false);

  const [messages, setMessages] = React.useState("");
  const [importCount, setImportCount] = React.useState(null);

  const [transfer, setTransfer] = React.useState({
    amount: "",
    from: "M-Pesa",
    to: "Cash",
    purpose: "",
  });
  const [transferMessage, setTransferMessage] = React.useState("");

  const [notifications, setNotifications] = React.useState(true);
  const [privacy, setPrivacy] = React.useState(true);
  const [currency, setCurrency] = React.useState("KSh");

  const money = (amount) =>
    `${currency} ${Number(amount).toLocaleString("en-KE")}`;

  const totalBalance = totalBalanceFromApi;

  React.useEffect(() => {
    let active = true;
    async function loadAccounts() {
      setAccountsLoading(true);
      setAccountError("");
      try {
        const result = await accountApi.balances();
        if (!active) return;
        const list = result?.accounts || result?.data?.accounts || [];
        setAccounts(list.map((account) => ({ ...account, balance: Number(account.balance || 0) })));
        setTotalBalanceFromApi(Number(result?.totalBalance || 0));
      } catch (error) {
        if (active) {
          setAccounts([]);
          setTotalBalanceFromApi(0);
          setAccountError(error.message || "Could not load account balances.");
        }
      } finally {
        if (active) setAccountsLoading(false);
      }
    }
    loadAccounts();
    return () => { active = false; };
  }, []);

  const options = [
    {
      title: "My accounts",
      detail: "View your money across different accounts",
      icon: Wallet,
      color: "bg-[#EEEAFE] text-[#5B4BEE]",
      section: "accounts",
    },
    {
      title: "Import M-Pesa messages",
      detail: "Paste messages and prepare them for review",
      icon: Smartphone,
      color: "bg-[#EAF3FF] text-[#4D8DFA]",
      section: "import",
    },
    {
      title: "Transfers & withdrawals",
      detail: "Record money moving between accounts",
      icon: ArrowLeftRight,
      color: "bg-[#FFF0E5] text-[#D97735]",
      section: "transfers",
    },
    {
      title: "Reports",
      detail: "Understand your income and spending",
      icon: FileText,
      color: "bg-[#E0F7F3] text-[#16A6A1]",
      section: "reports",
    },
    {
      title: "Savings goals",
      detail: "See what you are saving towards",
      icon: PiggyBank,
      color: "bg-[#FCE7F3] text-[#C02676]",
      section: "goals",
    },
    {
      title: "Settings & privacy",
      detail: "Manage your preferences",
      icon: Settings,
      color: "bg-[#F0F0F6] text-[#666A85]",
      section: "settings",
    },
  ];

  const goBack = () => {
    setSection("menu");
    setTransferMessage("");
  };

  const addAccount = async (event) => {
    event.preventDefault();
    const name = accountName.trim();
    if (!name) return;

    const typeMap = {
      "Mobile money": "mpesa",
      Cash: "cash",
      Bank: "bank",
      Other: "other",
    };

    try {
      await accountApi.create({
        name,
        type: typeMap[accountType] || "other",
        openingBalance: 0,
        currency: "KES",
      });
      const result = await accountApi.balances();
      const list = result?.accounts || [];
      setAccounts(list.map((account) => ({ ...account, balance: Number(account.balance || 0) })));
      setTotalBalanceFromApi(Number(result?.totalBalance || 0));
      setAccountName("");
      setShowAccountForm(false);
      setAccountError("");
    } catch (error) {
      setAccountError(error.message || "Could not save this account.");
    }
  };

  const previewMessages = async () => {
    const lines = messages.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return;
    setImportCount(lines.length);
    setImportingMessages(true);
    setImportResult(null);
    const results = { imported: 0, failed: [] };
    try {
      for (const message of lines) {
        try {
          await transactionApi.importMpesaMessage(message);
          results.imported += 1;
        } catch (error) {
          results.failed.push({ message: message.slice(0, 90), reason: error.message || "Import failed" });
        }
      }
      setImportResult(results);
      if (results.imported > 0 && onTransactionsImported) await onTransactionsImported();
      if (results.imported > 0) {
        try {
          const balances = await accountApi.balances();
          setAccounts((balances?.accounts || []).map((account) => ({ ...account, balance: Number(account.balance || 0) })));
          setTotalBalanceFromApi(Number(balances?.totalBalance || 0));
        } catch { /* keep the import result visible even if balances cannot refresh */ }
      }
    } finally {
      setImportingMessages(false);
    }
  };

  const recordTransfer = (event) => {
    event.preventDefault();

    const amount = Number(transfer.amount);

    if (!amount || amount <= 0) {
      setTransferMessage("Enter a valid amount greater than zero.");
      return;
    }

    if (transfer.from === transfer.to) {
      setTransferMessage("Choose two different accounts.");
      return;
    }

    const source = accounts.find((a) => a.name === transfer.from);
    const destination = accounts.find((a) => a.name === transfer.to);

    if (!source || !destination) {
      setTransferMessage("Select two existing accounts.");
      return;
    }

    if (source.balance < amount) {
      setTransferMessage(
        "The demo source account does not have enough balance."
      );
      return;
    }

    setTransferMessage(
      "Transfers are not connected to the backend yet, so nothing was saved. Your balances have not been changed."
    );

    setTransfer({
      amount: "",
      from: transfer.from,
      to: transfer.to,
      purpose: "",
    });
  };

  const heading = {
    accounts: "My accounts",
    import: "Import M-Pesa messages",
    transfers: "Transfers & withdrawals",
    reports: "Reports",
    goals: "Savings goals",
    settings: "Settings & privacy",
  };

  const SectionHeader = ({ title }) => (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={goBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E6F0] bg-white text-[#30266F] hover:bg-[#F7F7FC]"
        aria-label="Back to More menu"
      >
        <ArrowLeft size={20} />
      </button>
      <div>
        <h2 className="text-xl font-extrabold text-[#191A35]">{title}</h2>
        <p className="text-sm text-[#777A94]">Manage your money tracker</p>
      </div>
    </div>
  );

  const SettingRow = ({ icon: Icon, title, detail, checked, onChange }) => (
    <div className="flex items-center gap-3 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F7FC] text-[#5B4BEE]">
        <Icon size={19} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-[#191A35]">{title}</p>
        <p className="text-xs leading-5 text-[#777A94]">{detail}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#5B4BEE]" : "bg-[#D5D6E2]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-4xl pb-6">
      {section === "menu" && (
        <>
          <div className="mb-7">
            <p className="mb-1 text-sm font-semibold text-[#5B4BEE]">
              YOUR MONEY, YOUR CONTROL
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#191A35]">
              More
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#777A94]">
              Manage accounts, import transactions, and customise your tracker.
            </p>
          </div>

          <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#30266F] to-[#5B4BEE] p-5 text-white shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/75">Total across your accounts</p>
                <h2 className="mt-2 text-3xl font-extrabold">
                  {money(totalBalance)}
                </h2>
                <p className="mt-2 text-xs text-white/70">
                  Calculated from your saved accounts and transactions
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Wallet size={28} />
              </div>
            </div>
            <button
              onClick={() => setSection("accounts")}
              className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#30266F] hover:bg-[#F3F0FF]"
            >
              View accounts <ChevronRight size={17} />
            </button>
          </div>

          <div className="space-y-3">
            {options.map(({ title, detail, icon: Icon, color, section: target }) => (
              <button
                key={target}
                onClick={() => setSection(target)}
                className="flex w-full items-center gap-4 rounded-2xl border border-[#E5E6F0] bg-white p-4 text-left transition hover:border-[#C9C2FF] hover:shadow-sm sm:p-5"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                  <Icon size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[#191A35]">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-[#777A94]">{detail}</p>
                </div>
                <ChevronRight size={20} className="shrink-0 text-[#999BB0]" />
              </button>
            ))}
          </div>
        </>
      )}

      {section === "accounts" && (
        <>
          <SectionHeader title={heading.accounts} />

          <div className="mb-5 rounded-2xl bg-[#EEEAFE] p-5">
            <p className="text-sm font-medium text-[#666A85]">Combined account balance</p>
            <h3 className="mt-1 text-3xl font-extrabold text-[#30266F]">
              {money(totalBalance)}
            </h3>
          </div>

          {accountError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{accountError}</p>}
          {accountsLoading && <p className="py-4 text-sm text-[#666A85]">Loading your account balances…</p>}
          {!accountsLoading && accounts.length === 0 && <div className="mb-4 rounded-2xl bg-[#F7F7FC] p-5 text-sm leading-6 text-[#666A85]">Your accounts start at KSh 0.00. Once accounts and transactions are saved, their balances will appear here.</div>}
          <div className="space-y-3">
            {accounts.map((account) => {
              const Icon =
                String(account.type).toLowerCase() === "bank"
                  ? Building2
                  : ["mpesa", "mobile money", "mobile_money"].includes(String(account.type).toLowerCase())
                    ? Smartphone
                    : Wallet;

              return (
                <div
                  key={account.name}
                  className="flex items-center gap-3 rounded-2xl border border-[#E5E6F0] bg-white p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F7FC] text-[#5B4BEE]">
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#191A35]">{account.name}</p>
                    <p className="text-sm text-[#777A94]">{account.type}</p>
                  </div>
                  <p className="font-extrabold text-[#191A35]">
                    {money(account.balance)}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowAccountForm(!showAccountForm)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B4BEE] px-4 py-3 font-bold text-white hover:bg-[#4939DB]"
          >
            <Plus size={19} /> Add an account
          </button>

          {showAccountForm && (
            <form
              onSubmit={addAccount}
              className="mt-4 space-y-4 rounded-2xl border border-[#E5E6F0] bg-white p-5"
            >
              <h3 className="font-bold text-[#191A35]">New account</h3>

              <label className="block text-sm font-semibold text-[#555873]">
                Account name
                <input
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Savings account"
                  className="mt-2 w-full rounded-xl border border-[#E5E6F0] px-3 py-3 font-normal outline-none focus:border-[#5B4BEE]"
                />
              </label>

              <label className="block text-sm font-semibold text-[#555873]">
                Account type
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white px-3 py-3 font-normal outline-none focus:border-[#5B4BEE]"
                >
                  <option>Cash</option>
                  <option>Mobile money</option>
                  <option>Bank</option>
                  <option>Other</option>
                </select>
              </label>

              <p className="text-xs leading-5 text-[#777A94]">
                New accounts start at KSh 0.00. Balances are calculated from saved transactions.
              </p>

              <button className="w-full rounded-xl bg-[#30266F] px-4 py-3 font-bold text-white">
                Save account
              </button>
            </form>
          )}
        </>
      )}

      {section === "import" && (
        <>
          <SectionHeader title={heading.import} />

          <div className="mb-5 rounded-2xl border border-[#C9E7FF] bg-[#EAF3FF] p-4">
            <div className="flex gap-3">
              <Smartphone size={22} className="shrink-0 text-[#4D8DFA]" />
              <div>
                <h3 className="font-bold text-[#191A35]">Import transaction messages</h3>
                <p className="mt-1 text-sm leading-6 text-[#666A85]">
                  Paste your M-Pesa SMS messages below, one complete message per line. Each message is sent to your secured backend for parsing and saved only if it passes validation.
                </p>
              </div>
            </div>
          </div>

          <label className="block text-sm font-bold text-[#191A35]">
            Paste messages
            <textarea
              value={messages}
              onChange={(e) => {
                setMessages(e.target.value);
                setImportCount(null);
              }}
              rows={8}
              placeholder={"Example:\nPaste an M-Pesa transaction message here...\nPaste another message on the next line..."}
              className="mt-2 w-full resize-y rounded-2xl border border-[#E5E6F0] bg-white p-4 text-sm leading-6 outline-none focus:border-[#5B4BEE]"
            />
          </label>

          <button
            onClick={previewMessages}
            disabled={!messages.trim() || importingMessages}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B4BEE] px-4 py-3 font-bold text-white hover:bg-[#4939DB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={19} /> {importingMessages ? "Importing messages…" : "Import and save messages"}
          </button>

          {importCount !== null && (
            <div className="mt-4 rounded-2xl border border-[#BDE9DD] bg-[#E0F7F3] p-4">
              <div className="flex items-center gap-2 font-bold text-[#126E68]">
                <CheckCircle2 size={20} />
                {importCount} message{importCount === 1 ? "" : "s"} submitted
              </div>
              {importResult && <div className="mt-2 text-sm leading-6 text-[#356D69]">
                Successfully imported: <strong>{importResult.imported}</strong>. Failed or duplicate messages: <strong>{importResult.failed.length}</strong>.
                {importResult.failed.length > 0 && <ul className="mt-2 list-disc pl-5">{importResult.failed.slice(0, 5).map((item, index) => <li key={`${index}-${item.message}`}>{item.reason}</li>)}</ul>}
              </div>}
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-[#F2D7B9] bg-[#FFF0E5] p-4">
            <div className="flex gap-2">
              <ShieldCheck size={21} className="shrink-0 text-[#C46B2B]" />
              <p className="text-sm leading-6 text-[#80512E]">
                Never paste your M-Pesa PIN, password, or other login
                credentials. Imported message text alone cannot prove that a
                transaction is genuine.
              </p>
            </div>
          </div>
        </>
      )}

      {section === "transfers" && (
        <>
          <SectionHeader title={heading.transfers} />

          <div className="mb-5 rounded-2xl bg-[#EEEAFE] p-4">
            <h3 className="font-bold text-[#30266F]">Move money between accounts</h3>
            <p className="mt-1 text-sm leading-6 text-[#666A85]">
              An internal transfer changes account balances but is not income
              or spending.
            </p>
          </div>

          <form
            onSubmit={recordTransfer}
            className="space-y-4 rounded-2xl border border-[#E5E6F0] bg-white p-5"
          >
            <label className="block text-sm font-semibold text-[#555873]">
              Amount ({currency})
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={transfer.amount}
                onChange={(e) =>
                  setTransfer({ ...transfer, amount: e.target.value })
                }
                placeholder="e.g. 500"
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] px-3 py-3 outline-none focus:border-[#5B4BEE]"
              />
            </label>

            <label className="block text-sm font-semibold text-[#555873]">
              From account
              <select
                value={transfer.from}
                onChange={(e) =>
                  setTransfer({ ...transfer, from: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white px-3 py-3 outline-none focus:border-[#5B4BEE]"
              >
                {accounts.map((account) => (
                  <option key={account.name} value={account.name}>
                    {account.name} — {money(account.balance)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-[#555873]">
              To account
              <select
                value={transfer.to}
                onChange={(e) =>
                  setTransfer({ ...transfer, to: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] bg-white px-3 py-3 outline-none focus:border-[#5B4BEE]"
              >
                {accounts.map((account) => (
                  <option key={account.name} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-[#555873]">
              Note (optional)
              <input
                value={transfer.purpose}
                onChange={(e) =>
                  setTransfer({ ...transfer, purpose: e.target.value })
                }
                placeholder="e.g. Cash for transport"
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] px-3 py-3 font-normal outline-none focus:border-[#5B4BEE]"
              />
            </label>

            <button className="w-full rounded-xl bg-[#5B4BEE] px-4 py-3 font-bold text-white hover:bg-[#4939DB]">
              Record demo transfer
            </button>
          </form>

          {transferMessage && (
            <p className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-[#555873]">
              {transferMessage}
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-[#777A94]">
            This prototype updates the balances shown on this screen only.
            It does not save a transaction record or persist changes after refresh.
          </p>
        </>
      )}

      {section === "reports" && (
        <>
          <SectionHeader title={heading.reports} />
          <div className="mb-5 rounded-2xl border border-dashed border-[#D8D9E8] bg-white p-6 text-center">
            <FileText size={30} className="mx-auto text-[#8A8DA5]" />
            <h3 className="mt-3 font-extrabold text-[#191A35]">No report data yet</h3>
            <p className="mt-2 text-sm leading-6 text-[#666A85]">
              Reports will appear after you save or import real transactions. No sample income or expense figures are shown here.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E5E6F0] bg-white p-5">
            <h3 className="font-bold text-[#191A35]">Planned reports</h3>
            <ul className="mt-3 space-y-3 text-sm text-[#666A85]">
              <li>• Spending by category</li>
              <li>• Weekly and monthly comparisons</li>
              <li>• Account balances over time</li>
              <li>• Downloadable transaction reports</li>
            </ul>
          </div>
        </>
      )}

      {section === "goals" && (
        <>
          <SectionHeader title={heading.goals} />
          <div className="mb-5 rounded-2xl bg-[#EEEAFE] p-5">
            <PiggyBank size={28} className="text-[#5B4BEE]" />
            <h3 className="mt-3 text-xl font-extrabold text-[#30266F]">Build towards your goals</h3>
            <p className="mt-2 text-sm leading-6 text-[#666A85]">
              Savings goals will be displayed here once they can be saved to your account. No example goals or made-up balances are shown.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-[#D8D9E8] bg-white p-6 text-center text-sm text-[#666A85]">
            You have no savings goals recorded yet.
          </div>
        </>
      )}

      {section === "settings" && (
        <>
          <SectionHeader title={heading.settings} />

          <div className="mb-5 rounded-2xl border border-[#E5E6F0] bg-white px-4">
            <SettingRow
              icon={Bell}
              title="Reminders"
              detail="Allow spending and transaction reminders"
              checked={notifications}
              onChange={setNotifications}
            />
            <div className="border-t border-[#E5E6F0]" />
            <SettingRow
              icon={Eye}
              title="Privacy-first display"
              detail="Prefer hiding sensitive amounts in the interface"
              checked={privacy}
              onChange={setPrivacy}
            />
          </div>

          <div className="mb-5 rounded-2xl border border-[#E5E6F0] bg-white p-5">
            <label className="block text-sm font-bold text-[#191A35]">
              Display currency
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-3 w-full rounded-xl border border-[#E5E6F0] bg-white px-3 py-3 font-normal outline-none focus:border-[#5B4BEE]"
              >
                <option value="KSh">Kenyan Shilling (KSh)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </label>
            <p className="mt-2 text-xs leading-5 text-[#777A94]">
              This changes the display label only; it does not convert amounts.
            </p>
          </div>

          <div className="rounded-2xl border border-[#BDE9DD] bg-[#E0F7F3] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck size={22} className="shrink-0 text-[#16A6A1]" />
              <div>
                <h3 className="font-bold text-[#126E68]">Your financial privacy matters</h3>
                <p className="mt-1 text-sm leading-6 text-[#356D69]">
                  Your requests use the authenticated backend. Never paste your M-Pesa PIN, passwords, or other login credentials. Imported SMS text alone cannot prove that a transaction is genuine.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}



export { Activity, Budgets, Coach, More };
