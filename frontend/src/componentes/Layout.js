/* eslint-disable */
import React from "react";
import Menu from "../bmenu/Menu.js";

const Layout = ({ children }) => {
  return (
    <div>
      <Menu />
      <div>{children}</div>{" "}
      {/* Aquí irá el contenido principal de cada página */}
    </div>
  );
};

export default Layout;
