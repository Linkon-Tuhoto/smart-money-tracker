import { useState } from "react";

import Hero from "./components/Hero";
import BottomNavbar from "./components/BottomNavbar";

import {
  Activity,
  Budgets,
  Coach,
  More,
} from "./pages/OtherPages";

function App() {
  const [activeTab, setActiveTab] = useState("Home");

  const renderPage = () => {
    switch (activeTab) {
      case "Activity":
        return <Activity />;
      case "Budgets":
        return <Budgets />;
      case "Coach":
        return <Coach />;
      case "More":
        return <More />;
      default:
        return <Hero onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FC] text-[#191A35]">
      {activeTab === "Home" ? (
        renderPage()
      ) : (
        <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-8">
          {renderPage()}
        </main>
      )}

      <BottomNavbar
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />
    </div>
  );
}

export default App;
