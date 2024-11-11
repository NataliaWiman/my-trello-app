import React, { useEffect, useRef, useState } from "react";
import useOnClickOutside from "@/utils/useClickOutside";
import { ListType } from "@/types";

export type ListsProps = {
  boardName: string;
  idBoard: string;
  show: boolean;
  onClose: () => void;
  onSelectList: (listId: string, listName: string) => void;
};

const Lists = ({
  boardName,
  idBoard,
  show,
  onClose,
  onSelectList,
}: ListsProps) => {
  const listRef = useRef(null);
  const [lists, setLists] = useState<ListType[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  useOnClickOutside(listRef, onClose);

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoadingLists(true);
      setListError(null);
      try {
        const response = await fetch(`/api/boards/${idBoard}/lists`);
        if (!response.ok) {
          throw new Error("Failed to fetch lists");
        }
        const data = await response.json();
        setLists(data);
      } catch (error: any) {
        setListError(error.message);
      } finally {
        setIsLoadingLists(false);
      }
    };

    if (show) {
      fetchLists();
    }
  }, [show, idBoard]);

  if (!show) {
    return null;
  }

  return (
    <div
      ref={listRef}
      className="absolute top-9 -right-2 w-32 py-3 bg-white rounded-lg shadow z-50"
    >
      <p className="mb-2 px-4 text-xs text-gray-500">{boardName}</p>
      {isLoadingLists ? (
        <div className="p-3 text-sm text-gray-500">Loading lists...</div>
      ) : listError ? (
        <div className="p-3 text-sm text-red-500">Error: {listError}</div>
      ) : (
        <ul>
          {lists.map((list) => (
            <li
              key={list.id}
              className="px-4 py-1 text-sm hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectList(list.id, list.name)}
            >
              {list.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Lists;
