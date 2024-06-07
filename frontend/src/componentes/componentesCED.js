/* eslint-disable */
import React, { useEffect } from "react";
import NuevoCondominio from "./nuevoCondominio.js";
import EdicionCondominio from "./edicionCondominio.js";
import NuevoEdificio from "./nuevoEdificio.js";
import EdicionEdificio from "./edicionEdificio.js";
import NuevoDepartamento from "./nuevoDepa.js";
import EdicionDepartamento from "./edicionDepa.js";

function ComponenteCED() {
  useEffect(() => {
    document.body.classList.add("body4");
    return () => {
      document.body.classList.remove("body4");
    };
  }, []);
  return (
    <div style={{ marginTop: "730px" }}>
      <h1 style={{ color: "#163C40" }}>Registro y edición de C/E/D</h1>
      <div className="container2">
        <div className="nuevoCondominio" style={{ marginRight: "40px" }}>
          <NuevoCondominio />
        </div>
        <div className="edicionCondominio" style={{ marginRight: "40px" }}>
          <NuevoEdificio />
        </div>
        <div>
          <NuevoDepartamento />
        </div>
      </div>
      <div className="container2" style={{ marginTop: "30px" }}>
        <div style={{ marginRight: "40px" }}>
          <EdicionCondominio />
        </div>
        <div style={{ marginRight: "40px" }}>
          <EdicionEdificio />
        </div>
        <div>
          <EdicionDepartamento />
        </div>
      </div>
    </div>
  );
}

export default ComponenteCED;
