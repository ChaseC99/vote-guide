import type { SourceLink } from '../data/schema';

export function SourceLinks({ links }: { links: SourceLink[] }) {
  return <ul className="source-links">{links.map((link) => <li key={link.label}>{link.url
    ? <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
    : <span className="unavailable-source">{link.label}</span>}
  </li>)}</ul>;
}
