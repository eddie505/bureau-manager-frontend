/* eslint-disable */
import React, { useState, useEffect } from "react";
import styles from "../css/styles2.css";
import { Link } from "react-router-dom";

function EdicionyRegistro() {
  useEffect(() => {
    document.body.classList.add("body1");

    return () => {
      document.body.classList.remove("body1");
    };
  }, []);
  return (
    <form>
      <h1>Edicion y Registro</h1>
      <div style={{ textAlign: "center" }}>
        <Link to="/NuevoCondominio">
          <button>Registrar nuevo condominio</button>
        </Link>
        <Link to="/EditoCondominio">
          <button>Editar condominio</button>
        </Link>
        <Link to="/NuevoEdificio">
          <button>Registrar nuevo Edificio</button>
        </Link>
        <Link to="/EditoEdificio">
          <button>Editar Edificio</button>
        </Link>
        <Link to="/NuevoDepartamento">
          <button>Registrar nuevo Departamento</button>
        </Link>
        <Link to="/EditoDepartamento">
          <button>Editar Departamento</button>
        </Link>
      </div>

      <div className="botones-container">
        <Link to="/MenuPrincipal">
          <button type="submit">Regresar</button>
        </Link>
      </div>
    </form>
  );
}
export default EdicionyRegistro;
