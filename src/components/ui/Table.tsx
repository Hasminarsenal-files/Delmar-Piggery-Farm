"use client";

import React from "react";

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({
  className = "",
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-xl border border-slate-100 dark:border-[#182620] bg-white dark:bg-[#0f1412]">
    <table className={`w-full text-sm border-collapse text-left ${className}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  ...props
}) => <thead className={`bg-slate-50 dark:bg-[#080d0a]/50 border-b border-slate-100 dark:border-[#182620] text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${className}`} {...props} />;

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  ...props
}) => <tbody className={`divide-y divide-slate-100 dark:divide-[#182620] ${className}`} {...props} />;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  ...props
}) => (
  <tr
    className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-[#182620]/25 data-[state=selected]:bg-slate-50 dark:data-[state=selected]:bg-[#182620]/40 ${className}`}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  ...props
}) => <th className={`px-6 py-4 font-semibold text-slate-600 dark:text-slate-350 ${className}`} {...props} />;

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className = "",
  ...props
}) => <td className={`px-6 py-4 text-slate-700 dark:text-slate-300 align-middle ${className}`} {...props} />;
