import React from "react";
import {
  LayoutDashboard,
  Users,
  Heart,
  Megaphone,
  Calendar,
  Pill,
} from "lucide-react";

interface UBSTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const UBSTabs: React.FC<UBSTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "sky",
    },
    {
      key: "funcionarios",
      label: "Funcionários",
      icon: Users,
      color: "emerald",
    },
    { key: "pacientes", label: "Pacientes", icon: Heart, color: "rose" },
    { key: "campanhas", label: "Campanhas", icon: Megaphone, color: "amber" },
    { key: "consultas", label: "Consultas", icon: Calendar, color: "sky" },
    { key: "medicamentos", label: "Medicamentos", icon: Pill, color: "violet" },
    { key: "relatorios", label: "Relatórios", icon: Calendar, color: "violet" },
  ];

  return (
    <div className="sticky top-16 z-40 mb-8 w-full bg-white/95 backdrop-blur-sm">
      <nav className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap
                ${
                  active
                    ? "bg-teal-600 text-white shadow-md shadow-teal-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <Icon
                className={`h-4 w-4 ${active ? "text-white" : "text-gray-400"}`}
              />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
