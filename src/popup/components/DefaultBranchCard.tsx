import React, { useState } from 'react';
import { GitBranch, Check } from 'lucide-react';

interface Props {
  branch: string;
  onChange: (branch: string) => void;
  disabled: boolean;
}

export function DefaultBranchCard({ branch, onChange, disabled }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(branch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onChange(value.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-slate-500" />
        <h2 className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Default Target</h2>
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-500 mb-3">Used when a project doesn't have its own configuration.</p>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              onBlur={handleSubmit}
            />
          </form>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="group flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-sm font-medium text-slate-900 font-mono">{branch}</span>
            <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
          </div>
        )}
      </div>
    </div>
  );
}
