// components/Checklist.tsx
import React, { useState, useEffect } from "react";

type ChecklistItem = {
  id: string;
  state: "complete" | "incomplete";
  name: string;
};

type ChecklistType = {
  id: string;
  name: string;
  checkItems: ChecklistItem[];
};

type ChecklistProps = {
  checklists: ChecklistType[];
  cardId: string;
};

const Checklist: React.FC<ChecklistProps> = ({ checklists, cardId }) => {
  const [checklistsState, setChecklistsState] =
    useState<ChecklistType[]>(checklists);
  const [showChecklist, setShowChecklist] = useState(false);
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    setChecklistsState(checklists);
  }, [checklists]);

  const toggleChecklist = () => {
    setShowChecklist(!showChecklist);
  };

  const handleCheckItemChange = async (
    item: ChecklistItem,
    isChecked: boolean,
    checklistId: string
  ) => {
    const newState = isChecked ? "complete" : "incomplete";

    setLoadingItems((prev) => ({ ...prev, [item.id]: true }));

    const prevState = item.state;

    setChecklistsState((prevChecklists) =>
      prevChecklists.map((checklist) => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            checkItems: checklist.checkItems.map((checkItem) => {
              if (checkItem.id === item.id) {
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
      const response = await fetch(
        `https://api.trello.com/1/cards/${cardId}/checkItem/${item.id}?key=${process.env.NEXT_PUBLIC_TRELLO_API_KEY}&token=${process.env.NEXT_PUBLIC_TRELLO_TOKEN}&state=${newState}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update check item");
      }
    } catch (error) {
      setChecklistsState((prevChecklists) =>
        prevChecklists.map((checklist) => {
          if (checklist.id === checklistId) {
            return {
              ...checklist,
              checkItems: checklist.checkItems.map((checkItem) => {
                if (checkItem.id === item.id) {
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
      alert(`Error updating checklist item: ${(error as Error).message}`);
    } finally {
      setLoadingItems((prev) => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  const calculateCompletion = (checkItems: ChecklistItem[]) => {
    if (checkItems.length === 0) return 0;
    const completedItems = checkItems.filter(
      (item) => item.state === "complete"
    ).length;
    return ((completedItems / checkItems.length) * 100).toFixed(0);
  };

  return (
    <div
      className={`relative overflow-hidden transition-all ${
        showChecklist ? "max-h-[1000px]" : "max-h-36"
      }`}
    >
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
                  <li className="checklist-item" key={item.id}>
                    <label className="flex items-center gap-2">
                      <input
                        className="peer w-4 h-4 m-0 rounded border border-gray-400 bg-gray-100 checked:bg-sky-600 checked:border-sky-600 checked:bg-checkmark bg-no-repeat bg-center appearance-none"
                        type="checkbox"
                        checked={item.state === "complete"}
                        onChange={(e) =>
                          handleCheckItemChange(
                            item,
                            e.target.checked,
                            checklist.id
                          )
                        }
                        disabled={!!loadingItems[item.id]}
                      />
                      <span
                        className={`peer-checked:line-through peer-checked:text-gray-500 text-sm ${item.state} === "complete"
                            ? "line-through opacity-45"
                            : ""`}
                      >
                        {item.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      <button
        onClick={toggleChecklist}
        className={`${
          showChecklist
            ? "relative pb-4"
            : "absolute -bottom-0 pt-16 pb-4 bg-gradient-to-t from-white via-white to-transparent"
        } flex items-center justify-center w-full text-sm font-semibold text-sky-700 z-10`}
      >
        {showChecklist ? "Hide" : "Reveal"} checklist
        <span
          className={`block w-6 h-6 ml-2 bg-no-repeat ${
            showChecklist ? "rotate-180" : ""
          }`}
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%230369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Cpath d="m6 9 6 6 6-6"/%3E%3C/svg%3E')`,
            backgroundPosition: "center",
            backgroundSize: "22px",
          }}
        ></span>
      </button>
    </div>
  );
};

export default Checklist;
