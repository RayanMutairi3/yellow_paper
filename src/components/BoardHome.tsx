import { useState } from "react";
import type { Board, Note, Section } from "../types/note";

type BoardHomeProps = {
  boards: Board[];
  notes: Note[];
  sections: Section[];
  onOpenBoard: (boardId: string) => void;
  onCreateBoard: () => void;
};

function getSectionCountLabel(count: number) {
  return count === 1 ? "قسم واحد" : `${count} أقسام`;
}

function getNoteCountLabel(count: number) {
  return count === 1 ? "ورقة واحدة" : `${count} أوراق`;
}

export function BoardHome({
  boards,
  notes,
  sections,
  onOpenBoard,
  onCreateBoard,
}: BoardHomeProps) {
  const [openingBoardId, setOpeningBoardId] = useState<string | null>(null);
  const hasSingleBoard = boards.length === 1;

  const handleOpenBoard = (boardId: string) => {
    setOpeningBoardId(boardId);
    window.setTimeout(() => onOpenBoard(boardId), 220);
  };

  return (
    <section className="mt-5 pb-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">لوحاتك</h2>
          <p className="mt-1 text-sm font-medium text-stone-500 dark:text-stone-400">
            اختر لوحة وابدأ بتثبيت أوراقك على الجدار
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateBoard}
          className="h-11 shrink-0 rounded-full bg-stone-950 px-4 text-sm font-bold text-white shadow-sm transition active:scale-95 dark:bg-stone-100 dark:text-stone-950"
        >
          لوحة جديدة
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="grid min-h-52 place-items-center rounded-3xl border border-dashed border-stone-300 bg-white/55 px-5 py-8 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900/55">
          <div>
            <p className="text-lg font-bold text-stone-800 dark:text-stone-100">
              ما عندك لوحات حتى الآن
            </p>
            <p className="mt-2 text-sm font-semibold leading-7 text-stone-500 dark:text-stone-400">
              أنشئ أول لوحة وابدأ بتجميع أوراقك
            </p>
            <button
              type="button"
              onClick={onCreateBoard}
              className="mt-5 h-12 rounded-full bg-yellow-200 px-5 text-sm font-bold text-stone-950 shadow-sm transition active:scale-95 dark:bg-yellow-300"
            >
              إنشاء لوحة
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-3 ${
            hasSingleBoard ? "max-w-md" : "sm:grid-cols-3"
          }`}
        >
          {boards.map((board) => {
            const boardSections = sections.filter(
              (section) => section.boardId === board.id,
            );
            const boardNotes = notes.filter((note) => note.boardId === board.id);

            return (
              <button
                key={board.id}
                type="button"
                onClick={() => handleOpenBoard(board.id)}
                className={`group min-h-36 transform-gpu overflow-hidden rounded-3xl border border-stone-200 bg-white p-4 text-right shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-note active:scale-[0.99] dark:border-stone-800 dark:bg-stone-900 ${
                  openingBoardId === board.id
                    ? "scale-[1.04] -translate-y-1 opacity-90 shadow-note"
                    : ""
                }`}
              >
                <div className="relative mb-5 h-14 rounded-2xl bg-[#1f1b16] p-3 shadow-inner dark:bg-[#100f0d]">
                  <span className="absolute right-4 top-4 h-9 w-9 rotate-[-5deg] rounded-lg bg-[#fff2a8] shadow-note" />
                  <span className="absolute right-12 top-7 h-9 w-9 rotate-[7deg] rounded-lg bg-[#ffd4df] shadow-note" />
                  <span className="absolute left-5 top-5 h-9 w-9 rotate-[-8deg] rounded-lg bg-[#d7ecff] shadow-note" />
                </div>

                <h3 className="text-2xl font-bold text-stone-950 transition group-hover:text-yellow-700 dark:text-stone-50 dark:group-hover:text-yellow-200">
                  {board.title}
                </h3>
                <p className="mt-2 text-sm font-semibold text-stone-500 dark:text-stone-400">
                  {getSectionCountLabel(boardSections.length)} ·{" "}
                  {getNoteCountLabel(boardNotes.length)}
                </p>
                <span className="mt-5 inline-flex h-10 items-center rounded-full bg-stone-950 px-4 text-sm font-bold text-white dark:bg-stone-100 dark:text-stone-950">
                  افتح اللوحة
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
