import React from "react";
import { Heart, User, LogOut } from "lucide-react";

interface PacienteSidebarProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigation: any[];
  logout: () => void;
}

export const PacienteSidebar: React.FC<PacienteSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  navigation,
  logout,
}) => {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(10, 74, 74, 0.35)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: "240px",
          background: "#ffffff",
          borderRight: "0.5px solid #E2E8F0",
        }}
      >
        {/* Logo da sidebar */}
        <div
          className="flex items-center gap-2.5"
          style={{
            height: "64px",
            padding: "0 20px",
            borderBottom: "0.5px solid #E2E8F0",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, #0A6B6B, #0E9090)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Heart className="h-4 w-4 text-white" />
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "15px",
              fontWeight: 500,
              color: "#0A4A4A",
              letterSpacing: "0.01em",
            }}
          >
            SISC Saúde
          </span>
        </div>

        {/* Avatar do paciente */}
        <div
          className="flex items-center gap-4"
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div
            className="relative flex items-center justify-center flex-shrink-0"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #0A6B6B 0%, #14B8A6 100%)",
              boxShadow: "0 8px 20px rgba(10, 107, 107, 0.20)",
            }}
          >
            {user?.nome ? (
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {user.nome
                  .split(" ")
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            ) : (
              <User className="h-6 w-6 text-white" />
            )}

            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                background: "#22C55E",
                border: "2px solid white",
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate"
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              {user?.nome || "Usuário"}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#0A6B6B",
                  background: "#E6FFFB",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  border: "1px solid #B2F5EA",
                }}
              >
                PACIENTE
              </span>
            </div>
          </div>
        </div>

        {/* Itens de navegação */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setSidebarOpen(false);
                }}
                className="group w-full flex items-center gap-2.5 transition-all duration-150"
                style={{
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: active ? 500 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                  background: active ? "#0A6B6B" : "transparent",
                  color: active ? "#ffffff" : "#4A6B6B",
                }}
              >
                <Icon
                  className="h-4 w-4 flex-shrink-0"
                  style={{ opacity: active ? 1 : 0.65 }}
                />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Botão sair */}
        <div style={{ borderTop: "0.5px solid #E2E8F0", padding: "10px" }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 transition-all duration-150"
            style={{
              padding: "9px 12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 400,
              fontFamily: "'DM Sans', sans-serif",
              background: "transparent",
              color: "#7A9B9B",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFF0F0";
              e.currentTarget.style.color = "#C0392B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#7A9B9B";
            }}
          >
            <LogOut className="h-4 w-4" />
            Sair do sistema
          </button>
        </div>
      </aside>
    </>
  );
};
