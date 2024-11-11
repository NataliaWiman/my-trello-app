// components/Card.tsx
"use client";

import React, { useState } from "react";
import Checklist from "./Checklist";
import Icon from "../icons/Icon";
import DueDate from "./DueDate";
import Lists from "./Lists";
import Content from "./Content";

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

const Card = ({
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
}: CardProps) => {
  const [showBoardsList, setShowBoardsList] = useState(false);
  const [isMovingCard, setIsMovingCard] = useState(false);
  const [listNameState, setListName] = useState(listName);

  const handleMoveCard = async (newListId: string, newListName: string) => {
    setIsMovingCard(true);
    try {
      const response = await fetch("/api/moveCard", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId: id, newListId }),
      });

      if (!response.ok) {
        throw new Error("Failed to move card");
      }

      setListName(newListName);
      setShowBoardsList(false);
    } catch (error: any) {
      alert(`Error moving card: ${error.message}`);
    } finally {
      setIsMovingCard(false);
    }
  };

  const handleCloseBoardsList = () => {
    setShowBoardsList(false);
  };

  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-xl shadow-md bg-white h-full">
      <div className="relative header flex flex-col gap-1">
        <p className="text-xs text-gray-500">{boardName}</p>
        <h3 className="pr-20 text-lg leading-6 font-bold">{name}</h3>
        <button
          onClick={() => {
            if (!isMovingCard) {
              setShowBoardsList(!showBoardsList);
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

        <Lists
          boardName={boardName}
          idBoard={idBoard}
          show={showBoardsList}
          onClose={handleCloseBoardsList}
          onSelectList={handleMoveCard}
        />
      </div>

      {desc || checklists.length > 0 ? (
        <div className="body">
          <Content id={id} desc={desc} checklists={checklists} />
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
          Open in Trello
          <span className="rtl:rotate-180 w-3.5 ml-2">
            <Icon name="arrow" />
          </span>
        </a>
        {due && <DueDate dueDate={due} />}
      </div>
    </div>
  );
};

export default Card;
