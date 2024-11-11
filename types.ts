export type BoardType = {
  id: string;
  name: string;
};

export type CardType = {
  id: string;
  name: string;
  url: string;
  boardName?: string;
  idBoard: string;
  listName?: string;
  idList: string;
  desc?: string;
  due?: string | null;
  dateLastActivity: string;
  checklists?: ChecklistType[];
};

export type ChecklistType = {
  id: string;
  name: string;
  checkItems: ChecklistItemType[];
};

export type ChecklistItemType = {
  id: string;
  state: "complete" | "incomplete";
  name: string;
};

export type CheckItemType = {
  id: string;
  name: string;
  state: string;
  due?: string | null;
};

export type ListType = {
  id: string;
  name: string;
};
