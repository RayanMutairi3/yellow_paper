import { useEffect, useMemo, useRef, useState } from "react";
import {
  BoardActionSheet,
  type SheetMode,
} from "./components/BoardActionSheet";
import { BoardHome } from "./components/BoardHome";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { Header } from "./components/Header";
import { SectionPanel } from "./components/SectionPanel";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toast, type ToastState } from "./components/Toast";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type {
  Board,
  BoardDraft,
  Note,
  NoteDraft,
  Section,
  SectionDraft,
  WorkspaceData,
} from "./types/note";

const WORKSPACE_KEY = "yellow-paper-workspace";

const createId = (prefix: string) => {
  if ("randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function getSectionCountLabel(count: number) {
  return count === 1 ? "قسم واحد" : `${count} أقسام`;
}

function getNoteCountLabel(count: number) {
  return count === 1 ? "ورقة واحدة" : `${count} أوراق`;
}

function normalizeArabicCopy(text: string) {
  return text.replace(/الورقه الصفراء/g, "الورقة الصفراء");
}

function createInitialWorkspace(): WorkspaceData {
  return {
    boards: [],
    sections: [],
    notes: [],
  };
}

function App() {
  const [workspace, setWorkspace] = useLocalStorage<WorkspaceData>(
    WORKSPACE_KEY,
    createInitialWorkspace,
  );
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>(
    "yellow-paper-dark-mode",
    false,
  );
  const [activeBoardId, setActiveBoardId] = useLocalStorage<string | null>(
    "yellow-paper-active-board",
    null,
  );
  const [sheetMode, setSheetMode] = useState<SheetMode>("menu");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [initialNoteSectionId, setInitialNoteSectionId] = useState<string | null>(
    null,
  );
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [isBoardClosing, setIsBoardClosing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const lockedScrollYRef = useRef(0);

  useEffect(() => {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!isSheetOpen) return;

    lockedScrollYRef.current = window.scrollY;

    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollYRef.current}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(0, lockedScrollYRef.current);
    };
  }, [isSheetOpen]);

  const activeBoard = useMemo(
    () => workspace.boards.find((board) => board.id === activeBoardId) ?? null,
    [activeBoardId, workspace.boards],
  );

  const boardSections = useMemo(() => {
    if (!activeBoard) return [];

    return workspace.sections.filter(
      (section) => section.boardId === activeBoard.id,
    );
  }, [activeBoard, workspace.sections]);

  const boardNotes = useMemo(() => {
    if (!activeBoard) return [];

    return workspace.notes.filter((note) => note.boardId === activeBoard.id);
  }, [activeBoard, workspace.notes]);

  const openSectionCreator = () => {
    setEditingNote(null);
    setEditingSection(null);
    setInitialNoteSectionId(null);
    setSheetMode("section");
    setIsSheetOpen(true);
  };

  const openBoardCreator = () => {
    setEditingNote(null);
    setEditingSection(null);
    setInitialNoteSectionId(null);
    setSheetMode("board");
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setEditingNote(null);
    setEditingSection(null);
    setInitialNoteSectionId(null);
    setSheetMode("menu");
  };

  const closeBoard = () => {
    setIsBoardClosing(true);
    window.setTimeout(() => {
      setActiveBoardId(null);
      setIsBoardClosing(false);
    }, 180);
  };

  const openNoteCreator = (sectionId: string) => {
    setEditingNote(null);
    setEditingSection(null);
    setInitialNoteSectionId(sectionId);
    setSheetMode("note");
    setIsSheetOpen(true);
  };

  const openNoteEditor = (note: Note) => {
    setEditingNote(note);
    setEditingSection(null);
    setInitialNoteSectionId(null);
    setSheetMode("note");
    setIsSheetOpen(true);
  };

  const openSectionEditor = (section: Section) => {
    setEditingNote(null);
    setEditingSection(section);
    setInitialNoteSectionId(null);
    setSheetMode("section");
    setIsSheetOpen(true);
  };

  const saveSection = (draft: SectionDraft) => {
    if (!activeBoard) return;

    const now = new Date().toISOString();

    setWorkspace((currentWorkspace) => {
      if (editingSection) {
        return {
          ...currentWorkspace,
          sections: currentWorkspace.sections.map((section) =>
            section.id === editingSection.id
              ? {
                  ...section,
                  title: normalizeArabicCopy(draft.title),
                  updatedAt: now,
                }
              : section,
          ),
        };
      }

      const newSection: Section = {
        id: createId("section"),
        boardId: activeBoard.id,
        title: normalizeArabicCopy(draft.title),
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...currentWorkspace,
        sections: [...currentWorkspace.sections, newSection],
        boards: currentWorkspace.boards.map((board) =>
          board.id === activeBoard.id ? { ...board, updatedAt: now } : board,
        ),
      };
    });

    closeSheet();
  };

  const saveBoard = (draft: BoardDraft) => {
    const now = new Date().toISOString();
    const newBoard: Board = {
      id: createId("board"),
      title: normalizeArabicCopy(draft.title),
      createdAt: now,
      updatedAt: now,
    };

    setWorkspace((currentWorkspace) => ({
      ...currentWorkspace,
      boards: [...currentWorkspace.boards, newBoard],
    }));
    setActiveBoardId(newBoard.id);
    closeSheet();
  };

  const deleteSection = (section: Section) => {
    setSectionToDelete(section);
  };

  const confirmDeleteSection = () => {
    if (!sectionToDelete) return;

    setWorkspace((currentWorkspace) => ({
      ...currentWorkspace,
      sections: currentWorkspace.sections.filter(
        (currentSection) => currentSection.id !== sectionToDelete.id,
      ),
      notes: currentWorkspace.notes.filter(
        (note) => note.sectionId !== sectionToDelete.id,
      ),
    }));
    setSectionToDelete(null);
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    if (!activeBoard) return;

    setWorkspace((currentWorkspace) => {
      const activeBoardSections = currentWorkspace.sections.filter(
        (section) => section.boardId === activeBoard.id,
      );
      const currentIndex = activeBoardSections.findIndex(
        (section) => section.id === sectionId,
      );
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (
        currentIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= activeBoardSections.length
      ) {
        return currentWorkspace;
      }

      const reorderedSections = [...activeBoardSections];
      const [movedSection] = reorderedSections.splice(currentIndex, 1);
      reorderedSections.splice(targetIndex, 0, movedSection);

      let nextSectionIndex = 0;

      return {
        ...currentWorkspace,
        sections: currentWorkspace.sections.map((section) =>
          section.boardId === activeBoard.id
            ? reorderedSections[nextSectionIndex++]
            : section,
        ),
      };
    });
  };

  const saveNote = (draft: NoteDraft) => {
    if (!activeBoard) return;

    const now = new Date().toISOString();

    setWorkspace((currentWorkspace) => {
      if (editingNote) {
        return {
          ...currentWorkspace,
          notes: currentWorkspace.notes.map((note) =>
            note.id === editingNote.id
              ? { ...note, ...draft, updatedAt: now }
              : note,
          ),
        };
      }

      const newNote: Note = {
        id: createId("note"),
        boardId: activeBoard.id,
        sectionId: draft.sectionId,
        text: draft.text,
        color: draft.color,
        pinned: false,
        isTask: false,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...currentWorkspace,
        notes: [...currentWorkspace.notes, newNote],
        boards: currentWorkspace.boards.map((board) =>
          board.id === activeBoard.id ? { ...board, updatedAt: now } : board,
        ),
      };
    });

    closeSheet();
  };

  const updateNote = (id: string, update: (note: Note) => Note) => {
    setWorkspace((currentWorkspace) => ({
      ...currentWorkspace,
      notes: currentWorkspace.notes.map((note) =>
        note.id === id ? update(note) : note,
      ),
    }));
  };

  const syncEditingNote = (id: string, update: (note: Note) => Note) => {
    setEditingNote((currentNote) =>
      currentNote?.id === id ? update(currentNote) : currentNote,
    );
  };

  const togglePin = (id: string) => {
    const update = (note: Note): Note => ({
      ...note,
      pinned: !note.pinned,
      updatedAt: new Date().toISOString(),
    });

    updateNote(id, update);
    syncEditingNote(id, update);
  };

  const toggleComplete = (id: string) => {
    const update = (note: Note): Note => ({
      ...note,
      completed: !note.completed,
      updatedAt: new Date().toISOString(),
    });

    updateNote(id, update);
    syncEditingNote(id, update);
  };

  const convertToTask = (id: string) => {
    const update = (note: Note): Note => ({
      ...note,
      isTask: true,
      completed: false,
      updatedAt: new Date().toISOString(),
    });

    updateNote(id, update);
    syncEditingNote(id, update);
  };

  const deleteNote = (id: string) => {
    const deletedIndex = workspace.notes.findIndex((note) => note.id === id);
    const deletedNote = workspace.notes[deletedIndex];

    if (!deletedNote) return;

    setWorkspace((currentWorkspace) => ({
      ...currentWorkspace,
      notes: currentWorkspace.notes.filter((note) => note.id !== id),
    }));
    setToast({
      id: createId("toast"),
      message: "تم حذف الورقة",
      actionLabel: "تراجع",
      onAction: () => {
        setWorkspace((currentWorkspace) => {
          const restoredNotes = [...currentWorkspace.notes];
          restoredNotes.splice(deletedIndex, 0, deletedNote);

          return { ...currentWorkspace, notes: restoredNotes };
        });
      },
    });
  };

  if (!activeBoard) {
    return (
      <main className="animate-page-enter min-h-screen overflow-x-hidden bg-[#fbf7ed] text-stone-950 transition-colors dark:bg-[#171512] dark:text-stone-50">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-12 sm:px-6">
          <Header
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((currentValue) => !currentValue)}
          />
          <BoardHome
            boards={workspace.boards}
            sections={workspace.sections}
            notes={workspace.notes}
            onOpenBoard={setActiveBoardId}
            onCreateBoard={openBoardCreator}
          />
        </div>
        <BoardActionSheet
          isOpen={isSheetOpen}
          mode={sheetMode}
          sections={[]}
          editingNote={null}
          editingSection={null}
          onClose={closeSheet}
          onSelectMode={setSheetMode}
          onSaveBoard={saveBoard}
          onSaveNote={saveNote}
          onSaveSection={saveSection}
          onToggleNotePin={togglePin}
          onToggleNoteComplete={toggleComplete}
          onConvertNoteToTask={convertToTask}
          onDeleteNote={(id) => {
            deleteNote(id);
            closeSheet();
          }}
        />
      </main>
    );
  }

  return (
    <main className={`${isBoardClosing ? "animate-page-exit" : "animate-page-enter"} min-h-screen overflow-x-hidden bg-[#f5eedc] text-stone-950 transition-colors dark:bg-[#13110f] dark:text-white`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(160,120,28,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(90,120,170,0.1),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(247,223,132,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(135,171,219,0.12),transparent_30%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-24 sm:px-6">
        <header className="sticky top-0 z-20 -mx-4 mb-5 bg-[#f5eedc]/[0.88] px-4 pb-4 pt-5 backdrop-blur-xl dark:bg-[#13110f]/[0.86] sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeBoard}
              className="h-11 rounded-full bg-stone-950/10 px-4 text-sm font-bold text-stone-800 ring-1 ring-stone-950/10 transition active:scale-95 dark:bg-white/10 dark:text-white dark:ring-white/[0.15]"
            >
              رجوع
            </button>
            <ThemeToggle
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode((currentValue) => !currentValue)}
            />
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700 dark:text-yellow-200/80">
              الورقة الصفراء
            </p>
            <h1 className="mt-2 text-3xl font-bold text-stone-950 dark:text-white">
              {normalizeArabicCopy(activeBoard.title)}
            </h1>
            <p className="mt-2 text-sm font-medium text-stone-600 dark:text-stone-300">
              {getSectionCountLabel(boardSections.length)} ·{" "}
              {getNoteCountLabel(boardNotes.length)} على الجدار
            </p>
          </div>
        </header>

        {boardSections.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {boardSections.map((section, sectionIndex) => (
              <SectionPanel
                key={section.id}
                section={section}
                isDarkMode={isDarkMode}
                canMoveUp={sectionIndex > 0}
                canMoveDown={sectionIndex < boardSections.length - 1}
                notes={boardNotes.filter((note) => note.sectionId === section.id)}
                onAddNote={openNoteCreator}
                onRenameSection={openSectionEditor}
                onDeleteSection={deleteSection}
                onMoveSection={moveSection}
                onEditNote={openNoteEditor}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-[2rem] border border-dashed border-stone-300 bg-white/60 px-5 py-8 text-center dark:border-white/[0.15] dark:bg-white/[0.04]">
            <div>
              <p className="text-xl font-bold">هذه اللوحة فارغة</p>
              <p className="mt-2 text-sm font-semibold text-stone-500 dark:text-stone-300">
                أضف أول قسم وابدأ بتثبيت أوراقك
              </p>
              <button
                type="button"
                onClick={() => {
                  openSectionCreator();
                }}
                className="mt-5 h-12 rounded-full bg-[#f7df84] px-5 text-sm font-bold text-stone-950 shadow-sm transition active:scale-95"
              >
                إضافة قسم
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openSectionCreator}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] left-1/2 z-30 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-[#f7df84] text-3xl font-medium leading-none text-stone-950 shadow-2xl shadow-black/25 transition hover:-translate-y-0.5 active:scale-95"
        aria-label="إضافة قسم"
        title="إضافة قسم"
      >
        +
      </button>

      <BoardActionSheet
        isOpen={isSheetOpen}
        mode={sheetMode}
        sections={boardSections}
        initialNoteSectionId={initialNoteSectionId}
        editingNote={editingNote}
        editingSection={editingSection}
        onClose={closeSheet}
        onSelectMode={setSheetMode}
        onSaveBoard={saveBoard}
        onSaveNote={saveNote}
        onSaveSection={saveSection}
        onToggleNotePin={togglePin}
        onToggleNoteComplete={toggleComplete}
        onConvertNoteToTask={convertToTask}
        onDeleteNote={(id) => {
          deleteNote(id);
          closeSheet();
        }}
      />
      <ConfirmDialog
        isOpen={Boolean(sectionToDelete)}
        title="حذف القسم؟"
        description="سيتم حذف القسم والأوراق داخله."
        cancelLabel="إلغاء"
        confirmLabel="حذف"
        onCancel={() => setSectionToDelete(null)}
        onConfirm={confirmDeleteSection}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}

export default App;
