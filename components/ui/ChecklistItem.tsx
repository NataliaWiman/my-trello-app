import React from "react";

type ChecklistItemProps = {
  item: {
    id: string;
    state: "complete" | "incomplete";
    name: string;
  };
  checklistId: string;
  loading: boolean;
  onCheckItemChange: (
    itemId: string,
    isChecked: boolean,
    checklistId: string
  ) => void;
};

const ChecklistItem: React.FC<ChecklistItemProps> = ({
  item,
  checklistId,
  loading,
  onCheckItemChange,
}) => {
  return (
    <li className="checklist-item" key={item.id}>
      <label className="flex items-center gap-2">
        <input
          className="peer w-4 min-w-4 h-4 m-0 rounded border border-gray-400 bg-gray-100 checked:bg-sky-600 checked:border-sky-600 checked:bg-checkmark bg-no-repeat bg-center appearance-none"
          type="checkbox"
          checked={item.state === "complete"}
          onChange={(e) =>
            onCheckItemChange(item.id, e.target.checked, checklistId)
          }
          disabled={loading}
        />
        <span
          className={`peer-checked:line-through peer-checked:text-gray-500 text-sm ${
            item.state === "complete" ? "line-through opacity-45" : ""
          }`}
        >
          {item.name}
        </span>
      </label>
    </li>
  );
};

export default ChecklistItem;
