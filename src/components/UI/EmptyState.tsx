
import React from "react";

export const EmptyState = ({
  icon: Icon,
  message,
}: {
  icon: any;
  message: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
      <Icon className="h-8 w-8 text-slate-300" />
    </div>
    <p className="text-sm font-medium text-slate-400">{message}</p>
  </div>
);
