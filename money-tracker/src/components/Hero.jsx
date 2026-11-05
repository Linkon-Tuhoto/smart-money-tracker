
import { useState } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Smartphone,
  ReceiptText,
  ChevronRight,
  CircleHelp,
  PiggyBank,
  Menu,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);

function getKenyaMonthKey(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return year && month ? `${year}-${month}` : "";
}

function getCurrentKenyaMonth() {
  return getKenyaMonthKey(new Date());
}

function Hero({ onNavigate, transactions = [], loading = false }) {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedSpendingMonth, setSelectedSpendingMonth] = useState(getCurrentKenyaMonth);

  // The available balance remains independent of the selected reporting month.
  const allTimeIncomeTotal = transactions.filter((item) => item.amount > 0).reduce((total, item) => total + item.amount, 0);
  const allTimeExpenseTotal = transactions.filter((item) => item.amount < 0).reduce((total, item) => total + Math.abs(item.amount), 0);
  const totalBalance = allTimeIncomeTotal - allTimeExpenseTotal;
  const categoryColors = ["#5B4BEE", "#4D8DFA", "#F47770", "#16A6A1", "#A78BFA"];
  const selectedMonthTransactions = transactions.filter((item) => {
    const dateValue = item.transactionDate || item.createdAt;
    return getKenyaMonthKey(dateValue) === selectedSpendingMonth;
  });
  const incomeTotal = selectedMonthTransactions.filter((item) => item.amount > 0).reduce((total, item) => total + item.amount, 0);
  const expenseTotal = selectedMonthTransactions.filter((item) => item.amount < 0).reduce((total, item) => total + Math.abs(item.amount), 0);
  const categoryTotals = selectedMonthTransactions.filter((item) => item.amount < 0).reduce((totals, item) => {
    const category = item.category || "Uncategorised";
    totals[category] = (totals[category] || 0) + Math.abs(item.amount);
    return totals;
  }, {});
  const spendingData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount], index) => ({ name, amount, color: categoryColors[index % categoryColors.length] }));
  const totalSpending = spendingData.reduce((total, item) => total + item.amount, 0);
  const spendingMonthLabel = selectedSpendingMonth
    ? new Intl.DateTimeFormat("en-KE", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" })
        .format(new Date(`${selectedSpendingMonth}-01T12:00:00+03:00`))
    : "Selected month";

  return (
    <div className="min-h-screen bg-[#F7F7FC] pb-20 text-[#191A35] ">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E5E6F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5B4BEE] text-white shadow-md shadow-violet-200">
              <Wallet size={23} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight">
                Smart<span className="text-[#5B4BEE]">Money</span>
              </h1>
              <p className="text-xs font-medium text-[#666A85]">
                Your money, your control.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E6F0] bg-white transition hover:bg-[#F7F7FC]"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F47770] ring-2 ring-white" />
            </button>

            <button
              type="button"
              aria-label="Open menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEEAFE] text-[#5B4BEE] md:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[#EEEAFE] font-bold text-[#5B4BEE] md:flex">
              K
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#666A85]">
              Your financial overview
            </p>

            <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back! 👋
            </h2>

            <p className="mt-1 text-sm text-[#666A85] sm:text-base">
              Let's make every shilling count.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("More")}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#30266F] shadow-sm ring-1 ring-[#E5E6F0] transition hover:bg-[#EEEAFE]"
          >
            <Wallet size={18} />
            All accounts
            <ChevronRight size={16} />
          </button>
        </section>

        {/* Main balance and summary */}
        <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B4BEE] via-[#4939C7] to-[#30266F] p-6 text-white shadow-xl shadow-violet-200/60 sm:p-8">
            <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[28px] border-white/5" />
            <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-violet-100">
                  Total available balance
                </p>

                <button
                  type="button"
                  onClick={() => setShowBalance((previous) => !previous)}
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                  className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20"
                >
                  {showBalance ? (
                    <Eye size={19} />
                  ) : (
                    <EyeOff size={19} />
                  )}
                </button>
              </div>

              <h3 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {showBalance ? formatMoney(totalBalance) : "KSh ••••••"}
              </h3>

              <p className="mt-3 text-sm text-violet-100">
                Across your selected accounts
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-violet-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/20">
                      <ArrowDownLeft size={18} />
                    </span>
                    Income
                  </div>

                  <p className="mt-3 text-lg font-bold sm:text-xl">
                    {showBalance ? formatMoney(incomeTotal) : "••••••"}
                  </p>

                  <p className="mt-1 text-xs text-violet-100">
                    {spendingMonthLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-violet-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/20">
                      <ArrowUpRight size={18} />
                    </span>
                    Expenses
                  </div>

                  <p className="mt-3 text-lg font-bold sm:text-xl">
                    {showBalance ? formatMoney(expenseTotal) : "••••••"}
                  </p>

                  <p className="mt-1 text-xs text-violet-100">
                    {spendingMonthLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-3xl border border-[#E5E6F0] bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h3 className="text-lg font-extrabold">Quick actions</h3>
              <p className="mt-1 text-sm text-[#666A85]">
                What would you like to do?
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onNavigate("Activity")}
                className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#EEEAFE] p-4 text-left transition hover:bg-[#e2dcff]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#5B4BEE] shadow-sm">
                  <Plus size={21} />
                </span>
                <span className="text-sm font-bold text-[#30266F]">
                  Add money
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("Activity")}
                className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#FFF0E5] p-4 text-left transition hover:bg-[#ffe5d2]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                  <ArrowUpRight size={21} />
                </span>
                <span className="text-sm font-bold text-[#7C3D16]">
                  Add expense
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("More")}
                className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#EAF3FF] p-4 text-left transition hover:bg-[#dceaff]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Smartphone size={21} />
                </span>
                <span className="text-sm font-bold text-blue-900">
                  Import M-Pesa
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("Budgets")}
                className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#E5F7F3] p-4 text-left transition hover:bg-[#d5f0e9]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                  <PiggyBank size={21} />
                </span>
                <span className="text-sm font-bold text-teal-900">
                  Savings goal
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Spending overview */}
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#E5E6F0] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">
                  Spending overview
                </h3>
                <p className="mt-1 text-sm text-[#666A85]">
                  See where your money goes.
                </p>
              </div>

              <label className="flex items-center gap-2 rounded-xl bg-[#F7F7FC] px-3 py-2 text-xs font-bold text-[#666A85]">
                <span className="whitespace-nowrap">Month</span>
                <input
                  type="month"
                  value={selectedSpendingMonth}
                  max={getCurrentKenyaMonth()}
                  onChange={(event) => setSelectedSpendingMonth(event.target.value)}
                  aria-label="Choose spending overview month"
                  className="min-w-0 bg-transparent text-xs font-bold text-[#30266F] outline-none"
                />
              </label>
            </div>

            <div className="mt-4 grid items-center gap-4 sm:grid-cols-2">
              <div className="relative h-56 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {spendingData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => formatMoney(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-medium text-[#666A85]">
                    Total spent
                  </span>
                  <span className="mt-1 text-lg font-extrabold">
                    {formatMoney(totalSpending)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {spendingData.length === 0 && (
                  <p className="text-sm leading-6 text-[#666A85]">
                    No expenses recorded for {spendingMonthLabel}. Choose another month or add transactions to see the spending breakdown.
                  </p>
                )}
                {spendingData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F0F0F7]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>

                    <span className="text-sm font-bold">
                      {formatMoney(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Money tip */}
          <div className="relative overflow-hidden rounded-3xl bg-[#EEEAFE] p-6 sm:p-7">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/40" />

            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#5B4BEE] shadow-sm">
                <PiggyBank size={25} />
              </span>

              <p className="mt-5 text-sm font-bold uppercase tracking-wider text-[#5B4BEE]">
                Your money tip
              </p>

              <h3 className="mt-2 text-xl font-extrabold leading-snug">
                Small savings can make a big difference.
              </h3>

              <p className="mt-3 text-sm leading-6 text-[#555273]">
                Review your spending regularly. Identifying one expense to
                reduce can help you build a stronger savings habit.
              </p>

              <button
                type="button"
                onClick={() => onNavigate("Coach")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5B4BEE] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4939C7]"
              >
                Explore money coach
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {/* Recent transactions */}
        <section className="rounded-3xl border border-[#E5E6F0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">
                Recent transactions
              </h3>
              <p className="mt-1 text-sm text-[#666A85]">
                Keep track of every shilling.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("Activity")}
              className="inline-flex items-center gap-1 text-sm font-bold text-[#5B4BEE] hover:text-[#30266F]"
            >
              View all
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="mt-5 divide-y divide-[#F0F0F7]">
            {!loading && transactions.length === 0 && <div className="rounded-2xl bg-[#F7F7FC] p-5 text-sm leading-6 text-[#666A85]">Your balance starts at KSh 0.00. Import your M-Pesa messages or add transactions to see your real activity here.</div>}
            {loading && <p className="py-4 text-sm text-[#666A85]">Loading your transactions…</p>}
            {transactions.slice(0, 5).map((transaction) => {
              const isIncome = transaction.amount > 0;
              const Icon = isIncome ? ArrowDownLeft : ReceiptText;
              const color = isIncome ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600";

              return (
                <div
                  key={`${transaction.title}-${transaction.date}`}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}
                  >
                    <Icon size={21} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {transaction.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#666A85]">
                      {transaction.category}
                    </p>
                    <p className="mt-1 text-xs text-[#8A8DA5]">
                      {transaction.date}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-extrabold sm:text-base ${
                      isIncome ? "text-emerald-600" : "text-[#191A35]"
                    }`}
                  >
                    {isIncome ? "+" : "−"}
                    {formatMoney(Math.abs(transaction.amount))}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Reminder */}
        <section className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-[#EAF3FF] p-4">
          <CircleHelp
            className="mt-0.5 shrink-0 text-blue-600"
            size={21}
          />

          <div>
            <p className="text-sm font-bold text-blue-950">
              Keep your records up to date
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-900">
              After importing M-Pesa messages, review each transaction and
              add what the money was used for. These reminders are in development
              for now.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Hero;
