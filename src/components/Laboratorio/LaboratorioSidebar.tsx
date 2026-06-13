import React from "react";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  name: string;
  key: string;
  icon: LucideIcon;
}

interface LaboratorioSidebarProps {
  navigation: NavigationItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const LaboratorioSidebar: React.FC<LaboratorioSidebarProps> = ({
  navigation,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="lg:w-64">
      <nav className="bg-white rounded-2xl shadow-lg p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onTabChange(item.key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === item.key
                      ? "bg-sky-600 text-white shadow-md shadow-sky-200"
                      : "text-slate-600 hover:bg-sky-50 hover:text-sky-600"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${activeTab === item.key ? "text-white" : "text-slate-400 group-hover:text-sky-600"}`} />
                  <span className="font-semibold">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
