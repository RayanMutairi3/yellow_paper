import { useEffect, useRef, useState } from "react";
import { NoteCard } from "./NoteCard";
import type { Note, Section } from "../types/note";
import { sortNotes } from "../utils/sortNotes";

function normalizeArabicCopy(text: string) {
  return text.replace(/الورقه الصفراء/g, "الورقة الصفراء");
}

const LONG_PRESS_MS = 520;

type SectionPanelProps = {
  section: Section;
  notes: Note[];
  isDarkMode: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAddNote: (sectionId: string) => void;
  onRenameSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onEditNote: (note: Note) => void;
};

export function SectionPanel({
  section,
  notes,
  isDarkMode,
  canMoveUp,
  canMoveDown,
  onAddNote,
  onRenameSection,
  onDeleteSection,
  onMoveSection,
  onEditNote,
}: SectionPanelProps) {
  const sortedNotes = sortNotes(notes);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current === null) return;

    window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const startLongPressTimer = () => {
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      setIsReorderOpen(true);
      longPressTimerRef.current = null;
    }, LONG_PRESS_MS);
  };

  const moveAndClose = (direction: "up" | "down") => {
    onMoveSection(section.id, direction);
    setIsReorderOpen(false);
  };

  useEffect(() => clearLongPressTimer, []);

  return (
    <section className={`animate-board-enter rounded-[1.5rem] p-2.5 backdrop-blur-sm ${
      isDarkMode
        ? "border border-white/[0.12] bg-white/[0.06] shadow-[0_24px_70px_-40px_rgba(0,0,0,0.8)]"
        : "border border-stone-300/80 bg-white/70 shadow-[0_22px_60px_-42px_rgba(80,70,45,0.55)]"
    }`}>
      <div className={`mb-2 rounded-2xl px-2 py-2 ${
        isDarkMode ? "bg-black/15" : "bg-white/60"
      }`}>
        <div
          className="flex select-none items-center justify-between gap-2"
          onPointerDown={startLongPressTimer}
          onPointerUp={clearLongPressTimer}
          onPointerLeave={clearLongPressTimer}
          onPointerCancel={clearLongPressTimer}
          onContextMenu={(event) => event.preventDefault()}
        >
          <h3 className="min-w-0 flex-1 truncate rounded-full border border-yellow-200/40 bg-[#f7df84] px-3.5 py-2 text-sm font-bold text-stone-950 shadow-sm">
            {normalizeArabicCopy(section.title)}
          </h3>
          <div className={`flex shrink-0 gap-1 rounded-full p-1 ${
            isDarkMode ? "bg-white/[0.1]" : "bg-stone-950/[0.08]"
          }`}>
            <button
              type="button"
              onClick={() => onAddNote(section.id)}
              onPointerDown={(event) => event.stopPropagation()}
              className="grid h-9 w-9 place-items-center rounded-full bg-stone-950 text-lg font-bold leading-none text-white transition active:scale-95 dark:bg-stone-100 dark:text-stone-950"
              aria-label="إضافة ورقة"
              title="إضافة ورقة"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => onRenameSection(section)}
              onPointerDown={(event) => event.stopPropagation()}
              className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition active:scale-95"
              aria-label="تعديل القسم"
              title="تعديل القسم"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => onDeleteSection(section)}
              onPointerDown={(event) => event.stopPropagation()}
              className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-red-700 transition active:scale-95 dark:text-red-200"
              aria-label="حذف القسم"
              title="حذف القسم"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {sortedNotes.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(7.25rem,1fr))] gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]">
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onOpen={onEditNote}
            />
          ))}
        </div>
      ) : (
        <div className={`grid min-h-20 place-items-center rounded-2xl border border-dashed px-4 py-4 text-center ${
          isDarkMode
            ? "border-white/[0.15] bg-black/10"
            : "border-stone-300 bg-white/50"
        }`}>
          <p className={`text-sm font-semibold leading-7 ${isDarkMode ? "text-stone-300" : "text-stone-500"}`}>
            هذا القسم فارغ. أضف أول ورقة هنا.
          </p>
        </div>
      )}

      <div
        className={`fixed inset-0 z-50 transition ${
          isReorderOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isReorderOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 h-full w-full bg-stone-950/45 backdrop-blur-[2px] transition-opacity ${
            isReorderOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsReorderOpen(false)}
          aria-label="إلغاء"
        />
        <section
          className={`absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] rounded-[1.5rem] bg-[#fffaf0] p-3 text-right shadow-2xl transition duration-200 dark:bg-stone-900 sm:right-1/2 sm:max-w-sm sm:translate-x-1/2 ${
            isReorderOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="ترتيب القسم"
        >
          <p className="px-1 pb-2 text-sm font-bold text-stone-700 dark:text-stone-200">
            {normalizeArabicCopy(section.title)}
          </p>
          <div className="grid gap-2">
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={() => moveAndClose("up")}
              className="h-12 rounded-2xl bg-stone-950 px-4 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 dark:bg-stone-100 dark:text-stone-950"
            >
              نقل للأعلى
            </button>
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={() => moveAndClose("down")}
              className="h-12 rounded-2xl bg-white px-4 text-sm font-bold text-stone-800 ring-1 ring-stone-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 dark:bg-stone-800 dark:text-stone-100 dark:ring-stone-700"
            >
              نقل للأسفل
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
