/* eslint-disable */
import React, { useEffect } from "react";
import NuevoInquilino from "./nuevoInquilino.js";
import EditoInquilino from "./edicionInquilino.js";

function ComponenteInquilino() {
  useEffect(() => {
    document.body.classList.add("body2");
    return () => {
      document.body.classList.remove("body2");
    };
  }, []);

  return (
    <div style={{ marginTop: "600px" }}>
      <h1 style={{ color: "#163C40" }}>Registro y edición de inquilinos</h1>
      <div className="container2">
        <NuevoInquilino />
      </div>
      <div className="container2" style={{ marginTop: "25px" }}>
        <EditoInquilino />
      </div>
    </div>
  );
}

export default ComponenteInquilino;
