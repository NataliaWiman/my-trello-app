import React from "react";
import Checklist from "./Checklist";
import Clock from "./Clock";
import Arrow from "./Arrow";
import Logout from "./Logout";
import Chevron from "./Chevron";
import Trello from "./Trello";

const icons = {
  arrow: Arrow,
  checklist: Checklist,
  chevron: Chevron,
  clock: Clock,
  logout: Logout,
  trello: Trello,
};

const Icon = (props: { name: keyof typeof icons; className?: string }) => {
  const SelectedIcon = icons[props.name];
  if (!SelectedIcon) return null;

  return <SelectedIcon className={props.className || "text-inherit"} />;
};

export default Icon;
