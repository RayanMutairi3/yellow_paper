import { useEffect, useState } from "react";
import type {
  BoardDraft,
  Note,
  NoteColor,
  NoteDraft,
  Section,
  SectionDraft,
} from "../types/note";

export type SheetMode = "menu" | "note" | "section" | "board";

const colorOptions: Array<{ label: string; value: NoteColor; className: string }> =
  [
    { label: "أصفر", value: "yellow", className: "bg-[#fff2a8]" },
    { label: "وردي", value: "pink", className: "bg-[#ffd4df]" },
    { label: "أخضر", value: "green", className: "bg-[#d9f3c7]" },
    { label: "أزرق", value: "blue", className: "bg-[#d7ecff]" },
    { label: "بنفسجي", value: "purple", className: "bg-[#e7dcff]" },
  ];

type BoardActionSheetProps = {
  isOpen: boolean;
  mode: SheetMode;
  sections: Section[];
  initialNoteSectionId?: string | null;
  editingNote: Note | null;
  editingSection: Section | null;
  onClose: () => void;
  onSelectMode: (mode: SheetMode) => void;
  onSaveBoard: (draft: BoardDraft) => void;
  onSaveNote: (draft: NoteDraft) => void;
  onSaveSection: (draft: SectionDraft) => void;
  onToggleNotePin: (id: string) => void;
  onToggleNoteComplete: (id: string) => void;
  onConvertNoteToTask: (id: string) => void;
  onDeleteNote: (id: string) => void;
};

const getDefaultNoteDraft = (
  sections: Section[],
  initialNoteSectionId?: string | null,
): NoteDraft => ({
  text: "",
  color: "yellow",
  sectionId:
    sections.find((section) => section.id === initialNoteSectionId)?.id ??
    sections[0]?.id ??
    "",
});

function normalizeArabicCopy(text: string) {
  return text.replace(/الورقه الصفراء/g, "الورقة الصفراء");
}

export function BoardActionSheet({
  isOpen,
  mode,
  sections,
  initialNoteSectionId,
  editingNote,
  editingSection,
  onClose,
  onSelectMode,
  onSaveBoard,
  onSaveNote,
  onSaveSection,
  onToggleNotePin,
  onToggleNoteComplete,
  onConvertNoteToTask,
  onDeleteNote,
}: BoardActionSheetProps) {
  const [noteDraft, setNoteDraft] = useState<NoteDraft>(() =>
    getDefaultNoteDraft(sections, initialNoteSectionId),
  );
  const [sectionDraft, setSectionDraft] = useState<SectionDraft>({ title: "" });
  const [boardDraft, setBoardDraft] = useState<BoardDraft>({ title: "" });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "note") {
      setNoteDraft(
        editingNote
          ? {
              text: editingNote.text,
              color: editingNote.color,
              sectionId: editingNote.sectionId,
            }
          : getDefaultNoteDraft(sections, initialNoteSectionId),
      );
    }

    if (mode === "section") {
      setSectionDraft({ title: editingSection?.title ?? "" });
    }

    if (mode === "board") {
      setBoardDraft({ title: "" });
    }
  }, [editingNote, editingSection, initialNoteSectionId, isOpen, mode, sections]);

  const canSaveNote = noteDraft.text.trim().length > 0 && Boolean(noteDraft.sectionId);
  const canSaveSection = sectionDraft.title.trim().length > 0;
  const canSaveBoard = boardDraft.title.trim().length > 0;
  const selectedSection = sections.find(
    (section) => section.id === noteDraft.sectionId,
  );

  return (
    <div
      className={`fixed inset-0 z-40 transition ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        className={`absolute inset-0 h-full w-full bg-stone-950/55 backdrop-blur-[3px] transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
      />

      <section
        className={`absolute inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] flex max-h-[calc(100svh-6rem)] min-h-0 flex-col overflow-hidden rounded-[1.75rem] bg-[#fffaf0] px-4 pb-4 pt-3 shadow-2xl transition duration-300 dark:bg-stone-900 sm:inset-x-0 sm:bottom-0 sm:right-1/2 sm:max-h-[90dvh] sm:max-w-xl sm:translate-x-1/2 ${
          isOpen ? "translate-y-0" : "translate-y-[calc(100%+6rem)]"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="إضافة على اللوحة"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700" />

        <div className="sticky top-0 z-10 -mx-4 mb-3 flex items-center justify-between gap-3 bg-[#fffaf0]/95 px-4 pb-3 pt-1 backdrop-blur dark:bg-stone-900/95">
          <h2 className="text-lg font-bold text-stone-950 dark:text-stone-50">
            {mode === "menu"
              ? "إضافة قسم"
              : mode === "board"
                ? "لوحة جديدة"
              : mode === "note"
                ? editingNote
                  ? "تعديل الورقة"
                  : "ورقة جديدة"
                : editingSection
                  ? "تعديل القسم"
                  : "قسم جديد"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-xl text-stone-700 transition active:scale-95 dark:bg-stone-800 dark:text-stone-200"
            aria-label="إلغاء"
          >
            ×
          </button>
        </div>

        {mode === "menu" ? (
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => onSelectMode("section")}
              className="flex min-h-14 items-center justify-between rounded-2xl bg-stone-950 px-4 text-right text-sm font-bold text-white transition active:scale-[0.98] dark:bg-stone-100 dark:text-stone-950"
            >
              <span>إضافة قسم</span>
              <span className="text-xl leading-none">□</span>
            </button>
          </div>
        ) : null}

        {mode === "board" ? (
          <div className="flex min-h-0 flex-col">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                اسم اللوحة
              </span>
              <input
                value={boardDraft.title}
                onChange={(event) =>
                  setBoardDraft({ title: event.target.value.slice(0, 50) })
                }
                className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
                placeholder="مثال: مشروع جديد"
                maxLength={50}
              />
            </label>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 bg-[#fffaf0]/95 pt-1 backdrop-blur dark:bg-stone-900/95">
              <button
                type="button"
                disabled={!canSaveBoard}
                onClick={() =>
                  canSaveBoard && onSaveBoard({ title: boardDraft.title.trim() })
                }
                className="h-12 rounded-2xl bg-stone-950 px-5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-950"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-2xl bg-stone-100 px-5 text-sm font-bold text-stone-700 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : null}

        {mode === "section" ? (
          <div className="flex min-h-0 flex-col">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                عنوان القسم
              </span>
              <input
                value={sectionDraft.title}
                onChange={(event) =>
                  setSectionDraft({ title: event.target.value.slice(0, 60) })
                }
                className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
                placeholder="مثال: Graphics"
                maxLength={60}
              />
            </label>
            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 bg-[#fffaf0]/95 pt-1 backdrop-blur dark:bg-stone-900/95">
              <button
                type="button"
                disabled={!canSaveSection}
                onClick={() =>
                  canSaveSection &&
                  onSaveSection({ title: sectionDraft.title.trim() })
                }
                className="h-12 rounded-2xl bg-stone-950 px-5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-950"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-2xl bg-stone-100 px-5 text-sm font-bold text-stone-700 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200"
              >
                إلغاء
              </button>
            </div>

          </div>
        ) : null}

        {mode === "note" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-1">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-stone-700 dark:text-stone-200">
                نص الورقة
              </span>
              <textarea
                value={noteDraft.text}
                onChange={(event) =>
                  setNoteDraft((currentDraft) => ({
                    ...currentDraft,
                    text: event.target.value.slice(0, 260),
                  }))
                }
                className="min-h-24 w-full resize-none rounded-2xl border border-stone-200 bg-white p-3.5 text-base leading-7 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-200/70 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-50"
                placeholder="اكتب الورقة هنا..."
                maxLength={260}
              />
            </label>

            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-stone-700 dark:text-stone-200">
                القسم
              </p>
              {!editingNote && initialNoteSectionId ? (
                <div className="rounded-2xl bg-yellow-100 px-4 py-3 text-sm font-bold text-stone-800 ring-1 ring-yellow-200 dark:bg-yellow-300/15 dark:text-yellow-100 dark:ring-yellow-200/20">
                  ستضاف إلى: {normalizeArabicCopy(selectedSection?.title ?? "")}
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {sections.map((section) => {
                    const isSelected = noteDraft.sectionId === section.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() =>
                          setNoteDraft((currentDraft) => ({
                            ...currentDraft,
                            sectionId: section.id,
                          }))
                        }
                        className={`h-10 shrink-0 rounded-full px-4 text-xs font-bold transition active:scale-95 ${
                          isSelected
                            ? "bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950"
                            : "bg-white text-stone-600 ring-1 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700"
                        }`}
                      >
                        {normalizeArabicCopy(section.title)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-stone-700 dark:text-stone-200">
                لون الورقة
              </p>
              <div className="flex gap-2">
                {colorOptions.map((option) => {
                  const isSelected = noteDraft.color === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setNoteDraft((currentDraft) => ({
                          ...currentDraft,
                          color: option.value,
                        }))
                      }
                      className={`relative grid h-10 flex-1 place-items-center rounded-2xl border-2 transition active:scale-95 ${option.className} ${
                        isSelected
                          ? "scale-[1.04] border-stone-950 ring-2 ring-stone-950 ring-offset-2 ring-offset-[#fffaf0] dark:border-white dark:ring-white dark:ring-offset-stone-900"
                          : "border-white/70"
                      }`}
                      aria-label={`${option.label}${isSelected ? " محدد" : ""}`}
                      title={option.label}
                    >
                      {isSelected ? (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-stone-950 text-xs font-bold text-white shadow-sm dark:bg-white dark:text-stone-950">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {editingNote ? (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onToggleNotePin(editingNote.id)}
                  className="h-11 rounded-2xl bg-white px-3 text-xs font-bold text-stone-700 ring-1 ring-stone-200 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                >
                  {editingNote.pinned ? "إلغاء التثبيت" : "تثبيت"}
                </button>
                {editingNote.isTask ? (
                  <button
                    type="button"
                    onClick={() => onToggleNoteComplete(editingNote.id)}
                    className="h-11 rounded-2xl bg-white px-3 text-xs font-bold text-stone-700 ring-1 ring-stone-200 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                  >
                    {editingNote.completed ? "إلغاء الإكمال" : "تمت"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConvertNoteToTask(editingNote.id)}
                    className="h-11 rounded-2xl bg-white px-3 text-xs font-bold text-stone-700 ring-1 ring-stone-200 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700"
                  >
                    تحويل لمهمة
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteNote(editingNote.id)}
                  className="col-span-2 h-11 rounded-2xl bg-red-50 px-3 text-xs font-bold text-red-700 ring-1 ring-red-100 transition active:scale-[0.98] dark:bg-red-950/30 dark:text-red-200 dark:ring-red-900"
                >
                  حذف الورقة
                </button>
              </div>
            ) : null}

            <div className="sticky bottom-0 mt-4 grid grid-cols-[1fr_auto] gap-2 bg-[#fffaf0]/95 pt-3 backdrop-blur dark:bg-stone-900/95">
              <button
                type="button"
                disabled={!canSaveNote}
                onClick={() =>
                  canSaveNote &&
                  onSaveNote({ ...noteDraft, text: noteDraft.text.trim() })
                }
                className="h-12 rounded-2xl bg-stone-950 px-5 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-stone-100 dark:text-stone-950"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-12 rounded-2xl bg-stone-100 px-5 text-sm font-bold text-stone-700 transition active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
