"use client";

import { useEffect, useState } from "react";
import Card from "@/components/card/Card";
import { CardType } from "@/types";

const HomePage = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/cards");
        if (!response.ok) {
          throw new Error("Failed to fetch cards");
        }
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, []);

  const toDoCards = cards.filter(
    (card) => card.listName === "To-Do" || card.listName === "Doing"
  );

  const boardCardCounts = toDoCards.reduce<Record<string, number>>(
    (acc, card) => {
      const boardName = card.boardName || "Unknown Board";
      acc[boardName] = (acc[boardName] || 0) + 1;
      return acc;
    },
    {}
  );

  const boardsWithToDoCards = Object.keys(boardCardCounts);

  const filteredCards = selectedBoard
    ? cards.filter((card) => card.boardName === selectedBoard)
    : cards;

  const sortedCards = filteredCards.sort((a, b) =>
    (a.boardName || "").localeCompare(b.boardName || "")
  );

  const toDoFilteredCards = sortedCards.filter(
    (card) => card.listName === "To-Do" || card.listName === "Doing"
  );

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <section>
          <aside className="fixed top-0 left-0 z-40 w-64 h-screen">
            <div className="h-full px-3 py-4 overflow-y-auto bg-white">
              <h1 className="flex items-center gap-2 text-sky-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M7 7h3v9H7zm7 0h3v5h-3z" />
                </svg>
                <span className="text-lg font-bold">My Trello Cards</span>
              </h1>
              <ul className="flex flex-col gap-2 mt-5 font-medium text-gray-500">
                <li
                  onClick={() => setSelectedBoard(null)}
                  className={`${
                    selectedBoard === null
                      ? "bg-sky-800 text-white hover:text-white hover:bg-sky-800"
                      : "bg-gray-100"
                  } flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer`}
                >
                  All Boards
                </li>
                {boardsWithToDoCards.map((board, index) => (
                  <li
                    key={index}
                    onClick={() => setSelectedBoard(board || null)}
                    className={`${
                      selectedBoard === board
                        ? "text-white bg-sky-800 hover:text-white hover:bg-sky-800"
                        : ""
                    } flex items-center justify-between p-2 text-gray-900 rounded-lg hover:bg-gray-100 group cursor-pointer`}
                  >
                    <span>{board}</span>
                    <span className="flex items-center justify-center w-6 h-6 ml-2 text-xs rounded-full bg-gray-100 text-gray-500">
                      {boardCardCounts[board]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <section className="ml-64 p-6 pb-10 grid grid-cols-3 gap-6">
            {toDoFilteredCards.map((card) => (
              <Card key={card.id} {...card} />
            ))}
          </section>
        </section>
      )}
    </>
  );
};

export default HomePage;
