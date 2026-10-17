import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Plus,
  ChevronRight,
  PiggyBank,
  Target,
  Sparkles,
  Wallet,
  ArrowLeftRight,
  FileText,
  Settings,
  Upload,
} from "lucide-react";
import React from "react";

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


function Activity() {
  const [filter, setFilter] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);
  const [type, setType] = React.useState("Expense");
  const [transactions, setTransactions] = React.useState([
    {
      id: 1,
      title: "Groceries",
      category: "Food",
      date: "Today · 2:30 PM",
      amount: 850,
      type: "Expense",
      account: "M-Pesa",
    },
    {
      id: 2,
      title: "Money received",
      category: "Income",
      date: "Today · 11:15 AM",
      amount: 3500,
      type: "Income",
      account: "M-Pesa",
    },
    {
      id: 3,
      title: "Transport",
      category: "Transport",
      date: "Yesterday · 5:40 PM",
      amount: 250,
      type: "Expense",
      account: "Cash",
    },
    {
      id: 4,
      title: "Farm supplies",
      category: "Farming",
      date: "Yesterday · 9:20 AM",
      amount: 1200,
      type: "Expense",
      account: "M-Pesa",
    },
  ]);

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

      {/* M-Pesa import placeholder */}
      <section className="rounded-2xl border border-blue-100 bg-[#EAF3FF] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
            <Smartphone size={23} />
          </div>
          <div>
            <h3 className="font-extrabold text-blue-950">
              Import M-Pesa messages
            </h3>
            <p className="mt-1 text-sm leading-6 text-blue-900">
              Next, we'll build a bulk-import screen where you can paste
              multiple messages, review the extracted transactions and
              describe what each payment was used for.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


function Budgets() {
  const budgets = [
    { name: "Food & groceries", spent: 4500, limit: 6000, color: "#5B4BEE" },
    { name: "Transport", spent: 2200, limit: 3000, color: "#4D8DFA" },
    { name: "Shopping", spent: 1800, limit: 2000, color: "#F47770" },
    { name: "Farm supplies", spent: 1200, limit: 5000, color: "#16A6A1" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PLAN WITH PURPOSE"
        title="Budgets"
        description="Set spending limits and keep your priorities in view."
      />

      <div className="rounded-3xl bg-gradient-to-br from-[#5B4BEE] to-[#30266F] p-6 text-white">
        <p className="text-sm text-violet-100">Total planned budget</p>
        <p className="mt-2 text-3xl font-extrabold">{money(16000)}</p>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-violet-100">Sample spending</span>
          <span className="font-bold">{money(9700)}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[61%] rounded-full bg-white" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold">Your budgets</h2>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#5B4BEE] px-4 py-3 text-sm font-bold text-white">
          <Plus size={18} /> Create budget
        </button>
      </div>

      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.min(
            100,
            Math.round((budget.spent / budget.limit) * 100)
          );

          return (
            <div
              key={budget.name}
              className="rounded-2xl border border-[#E5E6F0] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{budget.name}</h3>
                  <p className="mt-1 text-sm text-[#666A85]">
                    {money(budget.spent)} of {money(budget.limit)}
                  </p>
                </div>
                <span className="text-sm font-extrabold">{percentage}%</span>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#F0F0F7]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${percentage}%`, backgroundColor: budget.color }}
                />
              </div>
              <p className="mt-3 text-xs text-[#666A85]">
                {money(Math.max(0, budget.limit - budget.spent))} remaining
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#FFF0E5] p-5">
        <Target size={24} className="text-orange-600" />
        <h3 className="mt-3 font-extrabold">Savings goals</h3>
        <p className="mt-1 text-sm leading-6 text-[#7C3D16]">
          We can add savings targets, deadlines and progress tracking next.
        </p>
      </div>
    </div>
  );
}

function Coach() {
  const [question, setQuestion] = React.useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="YOUR FINANCIAL COMPANION"
        title="Money Coach"
        description="Understand your habits and make more informed money decisions."
      />

      <div className="rounded-3xl bg-gradient-to-br from-[#5B4BEE] to-[#30266F] p-6 text-white sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
          <Sparkles size={28} />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold">Let's improve your money habits.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100">
          Your future coach will use your recorded transactions, budgets and
          goals to provide personalised insights. For now, this is a visual
          prototype with sample suggestions.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-extrabold">Ideas to explore</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Where does most of my money go?",
            "How can I reduce unnecessary spending?",
            "Am I staying within my budgets?",
            "How much could I save this month?",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setQuestion(item)}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E6F0] bg-white p-4 text-left text-sm font-semibold transition hover:border-[#5B4BEE]"
            >
              {item}
              <ChevronRight size={18} className="shrink-0 text-[#5B4BEE]" />
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="rounded-3xl border border-[#E5E6F0] bg-white p-5"
      >
        <label className="text-sm font-bold" htmlFor="coach-question">
          Ask your money coach
        </label>
        <textarea
          id="coach-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. How can I manage my weekly spending?"
          className="mt-3 min-h-28 w-full resize-y rounded-xl border border-[#E5E6F0] p-4 text-sm outline-none focus:border-[#5B4BEE]"
        />
        <button
          type="submit"
          className="mt-3 rounded-xl bg-[#5B4BEE] px-5 py-3 text-sm font-bold text-white"
        >
          Prepare question
        </button>
        <p className="mt-3 text-xs leading-5 text-[#666A85]">
          No AI response is connected yet. We'll connect the coach after the
          transaction data and calculations are in place.
        </p>
      </form>
    </div>
  );
}

function More() {
  const options = [
    { title: "My accounts", detail: "M-Pesa, cash and bank accounts", icon: Wallet },
    { title: "Import M-Pesa messages", detail: "Import and review transaction messages", icon: Upload },
    { title: "Transfers & withdrawals", detail: "Track movement between accounts", icon: ArrowLeftRight },
    { title: "Reports", detail: "Review income and spending history", icon: FileText },
    { title: "Savings goals", detail: "Track what you're working towards", icon: PiggyBank },
    { title: "Settings", detail: "Preferences and privacy controls", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MORE TOOLS"
        title="More"
        description="Manage your accounts and other money-tracking tools."
      />

      <div className="rounded-3xl border border-[#E5E6F0] bg-white p-3 sm:p-5">
        {options.map(({ title, detail, icon: Icon }) => (
          <button
            key={title}
            className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition hover:bg-[#F7F7FC]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEEAFE] text-[#5B4BEE]">
              <Icon size={22} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{title}</span>
              <span className="mt-1 block text-sm leading-5 text-[#666A85]">
                {detail}
              </span>
            </span>
            <ChevronRight size={19} className="shrink-0 text-[#8A8DA5]" />
          </button>
        ))}
      </div>
    </div>
  );
}

export { Activity, Budgets, Coach, More };
