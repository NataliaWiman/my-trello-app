import React from "react";
import Clock from "../icons/Clock";
import Icon from "../icons/Icon";

type DueDateProps = {
  dueDate: string;
};

const DueDate: React.FC<DueDateProps> = ({ dueDate }) => {
  const due = new Date(dueDate);
  const now = new Date();
  const timeDiff = due.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  const pastDue = daysLeft <= 5;

  let bgColor = "";

  if (pastDue) {
    bgColor = "bg-red-600 text-white";
  } else if (daysLeft > 0) {
    bgColor = "bg-gray-200 text-black";
  } else {
    bgColor = "bg-gray-200 text-black";
  }

  return (
    <div
      className={`flex gap-2 mt-auto py-2 pl-3 pr-4 rounded-full ${bgColor} text-xs bg-no-repeat`}
    >
      <span className="flex-1 w-4 h-4">
        <Icon name="clock" className="text-inherit" />
      </span>
      {due.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}
    </div>
  );
};

export default DueDate;
