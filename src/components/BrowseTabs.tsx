import { ListKind } from '../lib/browseParams';

const TABS: { kind: ListKind; label: string }[] = [
  { kind: 'trending', label: 'Trending' },
  { kind: 'popular', label: 'Popular' },
  { kind: 'now_playing', label: 'Now playing' },
  { kind: 'discover', label: 'Discover' },
];

type BrowseTabsProps = {
  active: ListKind;
  onChange: (kind: ListKind) => void;
};

export default function BrowseTabs({ active, onChange }: BrowseTabsProps) {
  return (
    <nav className="browse-tabs" aria-label="Browse movies">
      {TABS.map(({ kind, label }) => (
        <button
          key={kind}
          type="button"
          aria-pressed={kind === active}
          onClick={() => onChange(kind)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
