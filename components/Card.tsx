// components/Card.tsx
"use client";

import React, { useEffect, useState } from "react";
import Checklist from "./Checklist";

type CardProps = {
  id: string;
  name: string;
  url: string;
  idBoard: string;
  boardName?: string;
  listName?: string;
  idList?: string;
  desc?: string;
  due?: string | null;
  checklists?: any[];
};

type ListType = {
  id: string;
  name: string;
};

const Card: React.FC<CardProps> = ({
  id,
  name,
  url,
  boardName = "Unknown Board",
  listName = "Unknown List",
  idList,
  idBoard,
  desc,
  due,
  checklists = [],
}) => {
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [lists, setLists] = useState<ListType[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [isMovingCard, setIsMovingCard] = useState(false);
  const [listNameState, setListName] = useState(listName);

  const TRELLO_API_URL = "https://api.trello.com/1";

  console.log(lists);

  useEffect(() => {
    const fetchLists = async () => {
      setIsLoadingLists(true);
      setListError(null);
      try {
        console.log("Fetching lists for board:", idBoard);
        const response = await fetch(
          `${TRELLO_API_URL}/boards/${idBoard}/lists?key=${process.env.NEXT_PUBLIC_TRELLO_API_KEY}&token=${process.env.NEXT_PUBLIC_TRELLO_TOKEN}`
        );
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

    if (showListDropdown) {
      fetchLists();
    }
  }, [showListDropdown, idBoard]);

  const handleMoveCard = async (newListId: string, newListName: string) => {
    setIsMovingCard(true);
    try {
      const response = await fetch(
        `${TRELLO_API_URL}/cards/${id}?key=${process.env.NEXT_PUBLIC_TRELLO_API_KEY}&token=${process.env.NEXT_PUBLIC_TRELLO_TOKEN}&idList=${newListId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to move card");
      }

      // Update the list name in the UI
      setListName(newListName);
      setShowListDropdown(false);
    } catch (error: any) {
      alert(`Error moving card: ${error.message}`);
    } finally {
      setIsMovingCard(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-xl shadow-md bg-white h-full">
      <div className="relative header flex flex-col gap-1">
        <p className="text-xs text-gray-500">{boardName}</p>
        <h3 className="pr-20 text-lg leading-6 font-bold">{name}</h3>
        <button
          onClick={() => {
            if (!isMovingCard) {
              setShowListDropdown(!showListDropdown);
            }
          }}
          className={`${
            isMovingCard ? "hidden" : ""
          } absolute flex items-center justify-center py-2 px-4 pr-8 top-0 right-0 rounded-full bg-gray-100 text-xs font-medium bg-no-repeat`}
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"%3E%3Cpath d="m6 9 6 6 6-6"/%3E%3C/svg%3E')`,
            backgroundPosition: "right 12px center",
            backgroundSize: "16px",
          }}
        >
          {listNameState}
        </button>

        {isMovingCard && (
          <button className="absolute flex items-center justify-center w-20 h-8 top-0 right-0 rounded-full bg-gray-100 text-xs font-medium bg-no-repeat">
            <div className="w-4 h-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="gray"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-[spin_1.5s_linear_infinite]"
              >
                <path d="M12 2v4m4.2 1.8 2.9-2.9M18 12h4m-5.8 4.2 2.9 2.9M12 18v4m-7.1-2.9 2.9-2.9M2 12h4M4.9 4.9l2.9 2.9" />
              </svg>
            </div>
          </button>
        )}

        {showListDropdown && (
          <div className="absolute top-9 -right-2 w-32 py-3 bg-white rounded-lg shadow z-50">
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
                    onClick={() => handleMoveCard(list.id, list.name)}
                  >
                    {list.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {desc || checklists.length > 0 ? (
        <div className="body">
          <div>
            {desc && (
              <p className="text-sm text-gray-600 break-words">
                {desc.slice(0, 200)}
                {desc.length > 200 ? "..." : null}
              </p>
            )}
            <Checklist checklists={checklists} cardId={id} />
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">Description is missing...</div>
      )}

      <div className="footer flex justify-between mt-auto">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-sky-700 rounded-lg hover:bg-sky-800 focus:ring-4 focus:outline-none focus:ring-sky-300"
        >
          View on Trello
          <svg
            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </a>
        {due && (
          <div
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M13 6a1 1 0 1 0-2 0v6a1 1 0 0 0 .293.707l2.5 2.5a1 1 0 0 0 1.414-1.414L13 11.586z" fill="%23fff"/%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10m-10 8a8 8 0 1 0 0-16 8 8 0 0 0 0 16" fill="%23fff"/%3E%3C/svg%3E')`,
              backgroundPosition: "left 12px center",
              backgroundSize: "16px",
            }}
            className="mt-auto py-2 px-4 pl-8 rounded-full bg-red-600 text-white text-xs bg-no-repeat"
          >
            {new Date(due).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
