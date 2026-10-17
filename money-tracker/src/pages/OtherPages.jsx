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

  const records = [
    { title: "Groceries", category: "Food", date: "Today · 2:30 PM", amount: -850, account: "M-Pesa" },
    { title: "Money received", category: "Income", date: "Today · 11:15 AM", amount: 3500, account: "M-Pesa" },
    { title: "Transport", category: "Transport", date: "Yesterday · 5:40 PM", amount: -250, account: "Cash" },
    { title: "Farm supplies", category: "Farming", date: "Yesterday · 9:20 AM", amount: -1200, account: "M-Pesa" },
  ];

  const visibleRecords = records.filter((record) => {
    if (filter === "Income") return record.amount > 0;
    if (filter === "Expenses") return record.amount < 0;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="YOUR MONEY MOVEMENT"
        title="Activity"
        description="See the money coming in and going out of your accounts."
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-[#E5E6F0]">
          <ArrowDownLeft className="text-emerald-600" size={23} />
          <p className="mt-3 text-sm text-[#666A85]">Money received</p>
          <p className="mt-1 text-xl font-extrabold">{money(3500)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-[#E5E6F0]">
          <ArrowUpRight className="text-[#F47770]" size={23} />
          <p className="mt-3 text-sm text-[#666A85]">Money spent</p>
          <p className="mt-1 text-xl font-extrabold">{money(2300)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#E5E6F0] bg-white px-4 py-3">
          <Search size={19} className="text-[#666A85]" />
          <input
            placeholder="Search transactions"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button className="rounded-xl bg-[#5B4BEE] px-4 py-3 text-sm font-bold text-white">
          <span className="inline-flex items-center gap-2">
            <Plus size={18} /> Add transaction
          </span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "Income", "Expenses"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${
              filter === item
                ? "bg-[#5B4BEE] text-white"
                : "bg-white text-[#666A85] ring-1 ring-[#E5E6F0]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-[#E5E6F0] bg-white p-5">
        <h2 className="mb-4 text-lg font-extrabold">Recent records</h2>
        <div className="divide-y divide-[#F0F0F7]">
          {visibleRecords.map((record) => (
            <div
              key={record.title}
              className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                record.amount > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#EEEAFE] text-[#5B4BEE]"
              }`}>
                {record.amount > 0 ? <ArrowDownLeft /> : <ArrowUpRight />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{record.title}</p>
                <p className="mt-1 text-xs text-[#666A85]">
                  {record.category} · {record.account}
                </p>
                <p className="mt-1 text-xs text-[#8A8DA5]">{record.date}</p>
              </div>
              <p className={`shrink-0 text-sm font-extrabold ${
                record.amount > 0 ? "text-emerald-600" : "text-[#191A35]"
              }`}>
                {record.amount > 0 ? "+" : "−"}
                {money(Math.abs(record.amount))}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#EAF3FF] p-4 text-sm leading-6 text-blue-950">
        <Smartphone className="mb-2" size={22} />
        <p className="font-bold">M-Pesa message imports</p>
        <p className="mt-1">
          We'll add bulk message importing and a transaction review process
          here. Imported records will need reviewing before being treated as
          confirmed financial records.
        </p>
      </div>
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
