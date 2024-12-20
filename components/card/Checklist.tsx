"use client";
import React, { useState, useEffect } from "react";
import ChecklistItem from "./ChecklistItem";
import { ChecklistItemType, ChecklistType } from "@/types";

type ChecklistProps = {
  checklists: ChecklistType[];
  cardId: string;
};

const Checklist = ({ checklists, cardId }: ChecklistProps) => {
  const [checklistsState, setChecklistsState] =
    useState<ChecklistType[]>(checklists);
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    setChecklistsState(checklists);
  }, [checklists]);

  const handleCheckItemChange = async (
    itemId: string,
    isChecked: boolean,
    checklistId: string
  ) => {
    const newState = isChecked ? "complete" : "incomplete";

    setLoadingItems((prev) => ({ ...prev, [itemId]: true }));

    // Find the item and previous state
    let prevState: "complete" | "incomplete" = "incomplete";

    setChecklistsState((prevChecklists) =>
      prevChecklists.map((checklist) => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            checkItems: checklist.checkItems.map((checkItem) => {
              if (checkItem.id === itemId) {
                prevState = checkItem.state;
                return { ...checkItem, state: newState };
              }
              return checkItem;
            }),
          };
        }
        return checklist;
      })
    );

    try {
      const response = await fetch(`/api/cards/${cardId}/checkItem/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update check item");
      }
    } catch (error: any) {
      // Revert UI changes on error
      setChecklistsState((prevChecklists) =>
        prevChecklists.map((checklist) => {
          if (checklist.id === checklistId) {
            return {
              ...checklist,
              checkItems: checklist.checkItems.map((checkItem) => {
                if (checkItem.id === itemId) {
                  return { ...checkItem, state: prevState };
                }
                return checkItem;
              }),
            };
          }
          return checklist;
        })
      );
      console.error(error);
      alert(`Error updating checklist item: ${error.message}`);
    } finally {
      setLoadingItems((prev) => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    }
  };

  const calculateCompletion = (checkItems: ChecklistItemType[]) => {
    if (checkItems.length === 0) return 0;
    const completedItems = checkItems.filter(
      (item) => item.state === "complete"
    ).length;
    return ((completedItems / checkItems.length) * 100).toFixed(0);
  };

  return (
    <div className="relative">
      {checklistsState &&
        checklistsState.length > 0 &&
        checklistsState.map((checklist) => {
          const completed = calculateCompletion(checklist.checkItems);

          // Sort checkItems: incomplete items first
          const sortedCheckItems = [...checklist.checkItems].sort((a, b) => {
            if (a.state === b.state) return 0;
            else if (a.state === "incomplete") return -1;
            else return 1;
          });

          return (
            <div key={checklist.id}>
              <h5 className="flex items-center mb-2 text-base font-medium text-slate-700">
                <span className="inline-block w-5 h-5 mr-2">
                  {/* SVG Icon */}
                  <svg
                    className="text-slate-600"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeWidth="2.5" d="m9 11 3 3L22 4" />
                    <path
                      strokeWidth="2"
                      d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                    />
                  </svg>
                </span>
                <p>{checklist.name}</p>
              </h5>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{completed}%</span>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-sky-600 h-2.5 rounded-full"
                    style={{ width: `${completed}%` }}
                  ></div>
                </div>
              </div>
              <ul className="flex flex-col gap-2 py-4">
                {sortedCheckItems.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    checklistId={checklist.id}
                    loading={!!loadingItems[item.id]}
                    onCheckItemChange={handleCheckItemChange}
                  />
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
};

export default Checklist;
