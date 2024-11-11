"use client";
import React, { useEffect, useRef, useState } from "react";
import Checklist from "./Checklist";
import { ChecklistType } from "@/types";
import Icon from "../icons/Icon";

type ContentType = {
  id: string;
  desc?: string;
  checklists?: ChecklistType[];
};

const Content = ({ id, desc, checklists }: ContentType) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((desc || checklists) && descRef?.current?.scrollHeight) {
      setIsOverflowing(descRef.current.scrollHeight > 200);
    }
  }, [checklists, desc]);

  const toggleChecklist = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      ref={descRef}
      className={`relative overflow-hidden transition-all ${
        expanded ? "max-h-[5000px]" : "max-h-[200px]"
      }`}
    >
      {desc && (
        <p className="pb-4 text-sm text-gray-600 break-words whitespace-pre-wrap">
          {desc}
        </p>
      )}
      {checklists && checklists.length > 0 ? (
        <Checklist checklists={checklists} cardId={id} />
      ) : null}
      {isOverflowing && (
        <button
          onClick={toggleChecklist}
          className={`absolute bottom-0 flex items-end justify-center w-full text-sm font-semibold text-sky-700 bg-gradient-to-t from-white via-white/70 to-transparent z-10 transition-all ${
            expanded ? "relative w-6" : "h-24"
          }`}
        >
          {expanded ? "Minimize" : "Expand"}

          <Icon
            name="chevron"
            className={`block w-6 ml-2 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
};

export default Content;
