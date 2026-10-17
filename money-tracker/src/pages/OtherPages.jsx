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
  const [budgets, setBudgets] = React.useState([
    { id: 1, name: "Food & groceries", spent: 4500, limit: 6000, color: "#5B4BEE" },
    { id: 2, name: "Transport", spent: 2200, limit: 3000, color: "#4D8DFA" },
    { id: 3, name: "Shopping", spent: 1800, limit: 2000, color: "#F47770" },
    { id: 4, name: "Farm supplies", spent: 1200, limit: 5000, color: "#16A6A1" },
  ]);

  const [showForm, setShowForm] = React.useState(false);
  const [budgetName, setBudgetName] = React.useState("Food & groceries");
  const [customName, setCustomName] = React.useState("");
  const [budgetLimit, setBudgetLimit] = React.useState("");
  const [period, setPeriod] = React.useState("Monthly");
  const [message, setMessage] = React.useState("");

  const [goals, setGoals] = React.useState([
    { id: 1, name: "Emergency fund", target: 20000, saved: 8000 },
    { id: 2, name: "Farm investment", target: 50000, saved: 12500 },
  ]);

  const [showGoalForm, setShowGoalForm] = React.useState(false);
  const [goalName, setGoalName] = React.useState("");
  const [goalTarget, setGoalTarget] = React.useState("");

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

  function createBudget(event) {
    event.preventDefault();

    const name =
      budgetName === "Other" ? customName.trim() : budgetName;

    const limit = Number(budgetLimit);

    if (!name || !Number.isFinite(limit) || limit <= 0) {
      setMessage("Enter a category and a valid budget amount.");
      return;
    }

    if (
      budgets.some(
        (budget) => budget.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setMessage("A budget with that category already exists.");
      return;
    }

    const colors = ["#5B4BEE", "#4D8DFA", "#F47770", "#16A6A1"];

    setBudgets((previous) => [
      ...previous,
      {
        id: Date.now(),
        name,
        spent: 0,
        limit,
        color: colors[previous.length % colors.length],
      },
    ]);

    setBudgetLimit("");
    setCustomName("");
    setBudgetName("Food & groceries");
    setMessage(`${name} budget created successfully.`);
    setShowForm(false);
  }

  function createGoal(event) {
    event.preventDefault();

    const target = Number(goalTarget);

    if (!goalName.trim() || !Number.isFinite(target) || target <= 0) {
      return;
    }

    setGoals((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: goalName.trim(),
        target,
        saved: 0,
      },
    ]);

    setGoalName("");
    setGoalTarget("");
    setShowGoalForm(false);
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="PLAN WITH PURPOSE"
        title="Budgets & savings"
        description="Give every shilling a purpose and work towards your financial goals."
      />

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

        {/* Individual budget cards */}
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

          <button
            type="button"
            onClick={() => setShowGoalForm((previous) => !previous)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E6F0] bg-white px-4 py-3 text-sm font-bold text-[#30266F] hover:bg-[#EEEAFE]"
          >
            <Plus size={18} />
            New savings goal
          </button>
        </div>

        {showGoalForm && (
          <form
            onSubmit={createGoal}
            className="mt-4 grid gap-4 rounded-2xl border border-[#E5E6F0] bg-white p-5 sm:grid-cols-2"
          >
            <label className="text-sm font-semibold">
              Goal name
              <input
                required
                value={goalName}
                onChange={(event) => setGoalName(event.target.value)}
                placeholder="e.g. Buy a sheep"
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] p-3 outline-none focus:border-[#5B4BEE]"
              />
            </label>

            <label className="text-sm font-semibold">
              Target amount (KSh)
              <input
                required
                type="number"
                min="1"
                step="1"
                value={goalTarget}
                onChange={(event) => setGoalTarget(event.target.value)}
                placeholder="e.g. 15000"
                className="mt-2 w-full rounded-xl border border-[#E5E6F0] p-3 outline-none focus:border-[#5B4BEE]"
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-[#5B4BEE] px-5 py-3 font-bold text-white sm:col-span-2"
            >
              Create savings goal
            </button>
          </form>
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
              Budget alerts and savings progress currently use sample data.
              Later, we'll calculate them from your actual reviewed
              transactions and account balances.
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
