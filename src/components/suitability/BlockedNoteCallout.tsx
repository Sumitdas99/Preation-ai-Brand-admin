import type { BlockedNoteView } from "./types";

interface Props {
  data: BlockedNoteView;
}

export function BlockedNoteCallout({ data }: Props) {
  const { prefix, rest } = splitNotePrefix(data.title);
  return (
    <div
      role="note"
      className="rounded-r-md border-l-4 border-l-red-500 bg-red-50 px-4 py-3 text-sm leading-relaxed"
    >
      {prefix ? (
        <span className="text-base font-bold text-red-800">{prefix}</span>
      ) : null}
      {rest ? (
        <span className="font-[650] text-red-900/90">
          {prefix ? " " : ""}
          {rest}
        </span>
      ) : null}{" "}
      <span className="font-[650] text-red-900/90">{data.body}</span>
    </div>
  );
}

function splitNotePrefix(title: string): { prefix: string; rest: string } {
  const colonIdx = title.indexOf(":");
  if (colonIdx === -1) return { prefix: "", rest: title };
  return {
    prefix: title.slice(0, colonIdx + 1),
    rest: title.slice(colonIdx + 1).trim(),
  };
}
