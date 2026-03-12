import type { Citation, WebviewCardState } from "@code-vibe/shared";

interface CardDetailProps {
  state: WebviewCardState;
  onOpenEvidence: (citation: Citation) => void;
}

export function CardDetail({ state, onOpenEvidence }: CardDetailProps) {
  const { card } = state;

  return (
    <main className="detail-shell">
      <section className="detail-panel">
        <p className="eyebrow">{card.type}</p>
        <h1>{card.title}</h1>
        <p className="muted">Tags: {card.tags.join(", ") || "none"}</p>
        <pre className="detail-content">{card.summary}</pre>
      </section>

      <section className="detail-panel">
        <h2>Evidence</h2>
        <div className="chip-grid">
          {card.evidenceRefs.map((citation) => (
            <button
              key={citation.id}
              className="chip"
              onClick={() => onOpenEvidence(citation)}
            >
              {citation.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

