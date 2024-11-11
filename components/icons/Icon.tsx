import React from "react";
import Checklist from "./Checklist";
import Clock from "./Clock";
import Arrow from "./Arrow";
import Logout from "./Logout";

const icons = {
  checklist: Checklist,
  clock: Clock,
  arrow: Arrow,
  logout: Logout,
};

const Icon = (props: { name: keyof typeof icons; className?: string }) => {
  const SelectedIcon = icons[props.name];
  if (!SelectedIcon) return null;

  return <SelectedIcon className={props.className || "text-inherit"} />;
};

export default Icon;
