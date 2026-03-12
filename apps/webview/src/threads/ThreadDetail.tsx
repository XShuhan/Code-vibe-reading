import type { Citation, ThreadMessage, WebviewThreadState } from "@code-vibe/shared";

interface ThreadDetailProps {
  state: WebviewThreadState;
  onOpenCitation: (citation: Citation) => void;
}

export function ThreadDetail({ state, onOpenCitation }: ThreadDetailProps) {
  return (
    <main className="detail-shell">
      <section className="detail-panel">
        <p className="eyebrow">Thread</p>
        <h1>{state.thread.title}</h1>
        <p className="muted">
          Updated {new Date(state.thread.updatedAt).toLocaleString()}
        </p>
      </section>

      {state.thread.messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          onOpenCitation={onOpenCitation}
        />
      ))}
    </main>
  );
}

function MessageCard({
  message,
  onOpenCitation
}: {
  message: ThreadMessage;
  onOpenCitation: (citation: Citation) => void;
}) {
  return (
    <section className="detail-panel">
      <p className="eyebrow">{message.role}</p>
      <pre className="detail-content">{message.content}</pre>
      {message.citations.length > 0 ? (
        <>
          <h2>Source references</h2>
          <div className="chip-grid">
            {message.citations.map((citation) => (
              <button
                key={citation.id}
                className="chip"
                onClick={() => onOpenCitation(citation)}
              >
                {citation.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

