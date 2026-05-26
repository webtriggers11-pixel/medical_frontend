interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
            ${
              activeKey === tab.key
                ? 'bg-surface text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeKey === tab.key
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
