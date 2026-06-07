import React from "react";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const getStatusColor = (status: string) => {
  switch (status) {
    case "cancelada":
      return "bg-amber-50 text-amber-900 ring-1 ring-amber-200";
    case "pendente":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "avaliando":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    case "agendado":
    case "agendada":
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    case "realizado":
    case "realizada":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "cancelado":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "confirmada":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "solicitada":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-slate-50 text-slate-600 ring-1 ring-slate-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "realizado":
    case "realizada":
      return <CheckCircle className="h-3.5 w-3.5" />;
    case "agendado":
    case "agendada":
      return <Clock className="h-3.5 w-3.5" />;
    case "solicitada":
      return <AlertCircle className="h-3.5 w-3.5" />;
    default:
      return <Clock className="h-3.5 w-3.5" />;
  }
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(status)}`}
  >
    {getStatusIcon(status)}
    <span className="capitalize">{status}</span>
  </span>
);
