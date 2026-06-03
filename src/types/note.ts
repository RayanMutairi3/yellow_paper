export type NoteColor = "yellow" | "pink" | "green" | "blue" | "purple";

export type Board = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Section = {
  id: string;
  boardId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  boardId: string;
  sectionId: string;
  text: string;
  color: NoteColor;
  pinned: boolean;
  isTask: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteDraft = Pick<Note, "text" | "color" | "sectionId">;

export type BoardDraft = Pick<Board, "title">;

export type SectionDraft = Pick<Section, "title">;

export type WorkspaceData = {
  boards: Board[];
  sections: Section[];
  notes: Note[];
};
