
import { useState } from "react";
import {
  Home,
  ArrowLeftRight,
  ChartNoAxesCombined,
  MessageCircle,
  LayoutGrid,
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

const spendingData = [
  { name: "Food", amount: 4500, color: "#5B4BEE" },
  { name: "Transport", amount: 2200, color: "#4D8DFA" },
  { name: "Shopping", amount: 1800, color: "#F47770" },
  { name: "Other", amount: 1200, color: "#16A6A1" },
];

const transactions = [
  {
    title: "Groceries",
    category: "Food & groceries",
    date: "Today, 2:30 PM",
    amount: -850,
    icon: ReceiptText,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Money received",
    category: "M-Pesa · Income",
    date: "Today, 11:15 AM",
    amount: 3500,
    icon: ArrowDownLeft,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Transport",
    category: "Travel & transport",
    date: "Yesterday, 5:40 PM",
    amount: -250,
    icon: ArrowUpRight,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Farm supplies",
    category: "Business & farming",
    date: "Yesterday, 9:20 AM",
    amount: -1200,
    icon: Wallet,
    color: "bg-violet-100 text-violet-600",
  },
];

const navigation = [
  { label: "Home", icon: Home },
  { label: "Activity", icon: ArrowLeftRight },
  { label: "Budgets", icon: ChartNoAxesCombined },
  { label: "Coach", icon: MessageCircle },
  { label: "More", icon: LayoutGrid },
];

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);

function Hero() {
  const [activeTab, setActiveTab] = useState("Home");
  const [showBalance, setShowBalance] = useState(true);

  const totalSpending = spendingData.reduce(
    (total, item) => total + item.amount,
    0
  );

  return (
    <div className="min-h-screen bg-[#F7F7FC] pb-24 text-[#191A35]">
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
              aria-label="Notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E6F0] bg-white transition hover:bg-[#F7F7FC]"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F47770] ring-2 ring-white" />
            </button>

            <button
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
              Saturday, October 17, 2026
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back! 👋
            </h2>
            <p className="mt-1 text-sm text-[#666A85] sm:text-base">
              Let's make every shilling count.
            </p>
          </div>

          <button className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#30266F] shadow-sm ring-1 ring-[#E5E6F0] transition hover:bg-[#EEEAFE]">
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
                  onClick={() => setShowBalance(!showBalance)}
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
                {showBalance ? formatMoney(28450) : "KSh ••••••"}
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
                    {showBalance ? formatMoney(18500) : "••••••"}
                  </p>
                  <p className="mt-1 text-xs text-violet-100">This month</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="flex items-center gap-2 text-sm text-violet-100">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-400/20">
                      <ArrowUpRight size={18} />
                    </span>
                    Expenses
                  </div>
                  <p className="mt-3 text-lg font-bold sm:text-xl">
                    {showBalance ? formatMoney(9700) : "••••••"}
                  </p>
                  <p className="mt-1 text-xs text-violet-100">This month</p>
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
              <button className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#EEEAFE] p-4 text-left transition hover:bg-[#e2dcff]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#5B4BEE] shadow-sm">
                  <Plus size={21} />
                </span>
                <span className="text-sm font-bold text-[#30266F]">
                  Add money
                </span>
              </button>

              <button className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#FFF0E5] p-4 text-left transition hover:bg-[#ffe5d2]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                  <ArrowUpRight size={21} />
                </span>
                <span className="text-sm font-bold text-[#7C3D16]">
                  Add expense
                </span>
              </button>

              <button className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#EAF3FF] p-4 text-left transition hover:bg-[#dceaff]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Smartphone size={21} />
                </span>
                <span className="text-sm font-bold text-blue-900">
                  Import M-Pesa
                </span>
              </button>

              <button className="flex min-h-28 flex-col items-start justify-between rounded-2xl bg-[#E5F7F3] p-4 text-left transition hover:bg-[#d5f0e9]">
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

        {/* Spending chart and insight */}
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-[#E5E6F0] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold">Spending overview</h3>
                <p className="mt-1 text-sm text-[#666A85]">
                  See where your money goes.
                </p>
              </div>

              <span className="rounded-xl bg-[#F7F7FC] px-3 py-2 text-xs font-bold text-[#666A85]">
                This month
              </span>
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
                {spendingData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
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
                            width: `${(item.amount / totalSpending) * 100}%`,
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
                onClick={() => setActiveTab("Coach")}
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
              <h3 className="text-lg font-extrabold">Recent transactions</h3>
              <p className="mt-1 text-sm text-[#666A85]">
                Keep track of every shilling.
              </p>
            </div>

            <button
              onClick={() => setActiveTab("Activity")}
              className="inline-flex items-center gap-1 text-sm font-bold text-[#5B4BEE] hover:text-[#30266F]"
            >
              View all
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="mt-5 divide-y divide-[#F0F0F7]">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              const isIncome = transaction.amount > 0;

              return (
                <div
                  key={`${transaction.title}-${transaction.date}`}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${transaction.color}`}
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
          <CircleHelp className="mt-0.5 shrink-0 text-blue-600" size={21} />
          <div>
            <p className="text-sm font-bold text-blue-950">
              Keep your records up to date
            </p>
            <p className="mt-1 text-sm leading-5 text-blue-900">
              After importing M-Pesa messages, review each transaction and
              add what the money was used for. These sample reminders are
              static for now.
            </p>
          </div>
        </section>
      </main>

      {/* Fixed bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E6F0] bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-xl grid-cols-5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          {navigation.map(({ label, icon: Icon }) => {
            const isActive = activeTab === label;

            return (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition ${
                  isActive
                    ? "font-extrabold text-[#5B4BEE]"
                    : "font-medium text-[#777A94] hover:bg-[#F7F7FC]"
                }`}
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-[#EEEAFE]" : ""
                  }`}
                >
                  <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="text-[11px] sm:text-xs">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default Hero;
