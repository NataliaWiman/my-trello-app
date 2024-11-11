import React from "react";
import Icon from "./icons/Icon";

const Logout = () => {
  return (
    <button className="fixed bottom-4 left-4 flex gap-2 items-center z-50">
      <span className="felx-1 w-4">
        <Icon name="logout" />
      </span>
      Logout
    </button>
  );
};

export default Logout;
