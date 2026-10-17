import {
  Home,
  ArrowLeftRight,
  ChartNoAxesCombined,
  MessageCircle,
  LayoutGrid,
} from "lucide-react";

const navigation = [
  { label: "Home", icon: Home },
  { label: "Activity", icon: ArrowLeftRight },
  { label: "Budgets", icon: ChartNoAxesCombined },
  { label: "Coach", icon: MessageCircle },
  { label: "More", icon: LayoutGrid },
];

function BottomNavbar({ activeTab, onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E6F0] bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navigation.map(({ label, icon: Icon }) => {
          const isActive = activeTab === label;

          return (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition ${
                isActive
                  ? "font-extrabold text-[#5B4BEE]"
                  : "font-medium text-[#777A94] hover:bg-[#F7F7FC]"
              }`}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-xl ${
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
  );
}

export default BottomNavbar;
