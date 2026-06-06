import React from "react";
import { Users, Heart, Megaphone, Calendar, Pill } from "lucide-react";

interface UBSTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const UBSTabs: React.FC<UBSTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: "funcionarios", label: "Funcionários", icon: Users },
    { key: "pacientes", label: "Pacientes", icon: Heart },
    { key: "campanhas", label: "Campanhas", icon: Megaphone },
    { key: "consultas", label: "Consultas", icon: Calendar },
    { key: "medicamentos", label: "Medicamentos", icon: Pill },
  ];

  return (
    <div style={{ marginBottom: "24px" }}>
      <nav
        className="flex"
        style={{
          gap: "4px",
          background: "#ffffff",
          borderRadius: "12px",
          padding: "5px",
          border: "0.5px solid #E2E8F0",
          width: "fit-content",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="flex items-center transition-all duration-150"
              style={{
                gap: "7px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "12.5px",
                fontWeight: active ? 500 : 400,
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
                background: active ? "#0A6B6B" : "transparent",
                color: active ? "#ffffff" : "#5A7A7A",
              }}
            >
              <Icon
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ opacity: active ? 1 : 0.65 }}
              />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
