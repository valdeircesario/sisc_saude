import React from "react";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  name: string;
  key: string;
  icon: LucideIcon;
}

interface FuncionarioSidebarProps {
  navigation: NavigationItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const FuncionarioSidebar: React.FC<FuncionarioSidebarProps> = ({
  navigation,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="lg:w-56">
      <nav
        className="rounded-xl p-3 sticky top-[68px]"
        style={{
          background: "#fff",
          border: "1px solid #D9E4F0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA8C4] px-3 mb-2">
          Menu
        </p>
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onTabChange(item.key)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
                    activeTab === item.key
                      ? "text-[#1A3F72]"
                      : "text-[#5C7A9B] hover:text-[#1A3F72]"
                  }`}
                  style={
                    activeTab === item.key
                      ? {
                          background: "#EBF2FB",
                          borderLeft: "3px solid #1A3F72",
                        }
                      : { borderLeft: "3px solid transparent" }
                  }
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};