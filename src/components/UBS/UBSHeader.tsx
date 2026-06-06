import React from "react";
import { Building2, LogOut } from "lucide-react";

interface UBSHeaderProps {
  userNome?: string;
  onLogout: () => void;
}

export const UBSHeader: React.FC<UBSHeaderProps> = ({ userNome, onLogout }) => {
  return (
    <header style={{ background: "#0A6B6B" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex justify-between items-center"
          style={{ height: "60px" }}
        >
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "rgba(255,255,255,0.12)",
                borderRadius: "9px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "16px",
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "0.01em",
              }}
            >
              UBS Dashboard
            </h1>
          </div>

          <div className="flex items-center" style={{ gap: "16px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
              Olá,{" "}
              <strong style={{ color: "#ffffff", fontWeight: 500 }}>
                {userNome}
              </strong>
            </span>
            <button
              onClick={onLogout}
              className="flex items-center"
              style={{
                gap: "7px",
                padding: "7px 14px",
                borderRadius: "8px",
                border: "0.5px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "12px",
                fontWeight: 400,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.16)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
