import type { Note } from "../types/note";

const noteColors: Record<Note["color"], string> = {
  yellow:
    "bg-[#fff2a8] text-stone-900 border-[#f2d96d] dark:bg-[#f0d979] dark:text-stone-950 dark:border-[#d8bd55]",
  pink:
    "bg-[#ffd4df] text-stone-900 border-[#efaabd] dark:bg-[#efb4c6] dark:text-stone-950 dark:border-[#d28da2]",
  green:
    "bg-[#d9f3c7] text-stone-900 border-[#aad88e] dark:bg-[#bee6a8] dark:text-stone-950 dark:border-[#93bf75]",
  blue:
    "bg-[#d7ecff] text-stone-900 border-[#a8cdeb] dark:bg-[#b8daf5] dark:text-stone-950 dark:border-[#8bb4d3]",
  purple:
    "bg-[#e7dcff] text-stone-900 border-[#c5b1ec] dark:bg-[#d1c0f3] dark:text-stone-950 dark:border-[#aa91dd]",
};

type NoteCardProps = {
  note: Note;
  onOpen: (note: Note) => void;
};

function getRotation(id: string) {
  const rotations = [-2.5, 1.75, -1, 2.25, -1.75, 1];
  const index = id.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return rotations[index % rotations.length];
}

function shouldShowMore(text: string) {
  return text.length > 115 || text.split("\n").length > 4;
}

export function NoteCard({
  note,
  onOpen,
}: NoteCardProps) {
  const isTask = note.isTask;
  const rotation = getRotation(note.id);
  const hasMoreText = shouldShowMore(note.text);

  return (
    <button
      type="button"
      onClick={() => onOpen(note)}
      className={`animate-note-in relative flex h-32 flex-col rounded-2xl border p-2.5 text-right shadow-note transition duration-200 before:absolute before:left-1/2 before:top-1.5 before:h-1.5 before:w-1.5 before:-translate-x-1/2 before:rounded-full before:bg-white/70 before:shadow-sm hover:-translate-y-1 active:scale-[0.99] dark:shadow-note-dark ${noteColors[note.color]} ${
        note.completed ? "opacity-65" : ""
      }`}
      style={{ rotate: `${rotation}deg` }}
    >
      <div className="mb-1.5 flex items-start justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/[0.65] px-2 py-0.5 text-[10px] font-bold ring-1 ring-black/5">
            {isTask ? "مهمة" : "ملاحظة"}
          </span>
          {note.pinned ? (
            <span
              className="rounded-full bg-white/[0.55] px-2 py-0.5 text-[10px] font-bold"
              aria-label="مثبتة"
              title="مثبتة"
            >
              مثبتة
            </span>
          ) : null}
          {note.completed ? (
            <span className="rounded-full bg-white/[0.55] px-2 py-0.5 text-[10px] font-bold">
              تم
            </span>
          ) : null}
        </div>

        {isTask ? (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.55] text-xs font-bold">
            {note.completed ? "✓" : ""}
          </span>
        ) : null}
      </div>

      <p
        className={`note-card-text whitespace-pre-wrap break-words text-sm font-medium leading-6 ${
          note.completed ? "line-through decoration-2" : ""
        }`}
      >
        {note.text}
      </p>

      {hasMoreText ? (
        <span className="mt-auto inline-flex w-fit rounded-full bg-white/[0.55] px-2 py-0.5 text-[10px] font-bold text-stone-700 ring-1 ring-black/5">
          عرض المزيد
        </span>
      ) : null}

    </button>
  );
}
