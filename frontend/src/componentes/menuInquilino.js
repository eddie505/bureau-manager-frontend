/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

//Prueba de cambio

function MenuInquilino() {
  useEffect(() => {
    document.body.classList.add("body1");

    return () => {
      document.body.classList.remove("body1");
    };
  }, []);
  return (
    <form>
      <h1>Administrar Inquilino</h1>
      <div style={{ textAlign: "center" }}>
        <Link to="/NuevoInquilino">
          <button>Registrar nuevo Inquilino</button>
        </Link>
        <Link to="/EditoInquilino">
          <button>Editar Inquilino</button>
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
export default MenuInquilino;
