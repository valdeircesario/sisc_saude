import React from "react";

export const SectionHeader = ({
  icon: Icon,
  title,
  color = "teal",
}: {
  icon: any;
  title: string;
  color?: string;
}) => (
  <div className="mb-6 flex items-center gap-3">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${color}-50`}
    >
      <Icon className={`h-5 w-5 text-${color}-600`} />
    </div>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
  </div>
);
