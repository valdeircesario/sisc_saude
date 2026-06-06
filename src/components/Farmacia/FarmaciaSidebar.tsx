import React from "react";
import { Home, Search, History, Info } from "lucide-react";
import { NavButton } from "./FarmaciaUtils";

type ActiveTab = "dashboard" | "consultar" | "historico" | "informacoes";

interface FarmaciaSidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const FarmaciaSidebar: React.FC<FarmaciaSidebarProps> = ({
  activeTab,
  onTabChange,
}) => (
  <aside className="w-56 flex-shrink-0">
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.04] sticky top-20">
      <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-2.5">
        Navegação
      </p>
      <NavButton
        active={activeTab === "dashboard"}
        onClick={() => onTabChange("dashboard")}
        icon={<Home size={16} />}
        label="Painel de Controle"
      />
      <NavButton
        active={activeTab === "consultar"}
        onClick={() => onTabChange("consultar")}
        icon={<Search size={16} />}
        label="Consultar Receita"
      />
      <NavButton
        active={activeTab === "historico"}
        onClick={() => onTabChange("historico")}
        icon={<History size={16} />}
        label="Histórico"
      />
      <NavButton
        active={activeTab === "informacoes"}
        onClick={() => onTabChange("informacoes")}
        icon={<Info size={16} />}
        label="Informações"
      />
    </div>
  </aside>
);
