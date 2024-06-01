/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_SERVER_URL } from "../config.js";

function NuevoCondominio() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);
  const [formulario, setFormulario] = useState({
    nombre_condominio: "",
    direccion_condominio: "",
    admin_condominio: "EDITH ROGELIA QUIÑONES BONILLA",
    id_administrador: id_administrador,
  });

  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorContraseña, setErrorContraseña] = useState("");

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.body.classList.add("body2");

    return () => {
      document.body.classList.remove("body2");
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({ ...prevState, [name]: value }));
    if (name === "nombre_condominio") {
      if (value.trim() === "") {
        setErrorCorreo("*Ingrese un nombre de condominio");
      } else {
        setErrorCorreo("");
      }
    }
    // Validación de contraseña
    if (name === "direccion_condominio") {
      if (value.trim() === "") {
        setErrorContraseña("*Ingrese una direccion de condominio");
      } else {
        setErrorContraseña("");
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formulario.nombre_condominio.trim() === "") {
      setErrorCorreo("*Ingrese un nombre de condominio");
    }
    if (formulario.direccion_condominio.trim() === "") {
      setErrorContraseña("*Ingrese una direccion de condominio");
    }
    if (
      formulario.nombre_condominio.trim() !== "" &&
      formulario.direccion_condominio.trim() !== "" &&
      formulario.id_administrador &&
      formulario.admin_condominio
    ) {
      try {
        const resultado = await axios.post(
          `${REACT_APP_SERVER_URL}/api/registrarCondominio`,
          formulario
        );
        if (resultado.data === 200) {
          setVisible(true);

          formulario.nombre_condominio = "";
          formulario.direccion_condominio = "";
          window.location.reload();
        } else {
          alert(resultado.data);
        }
      } catch (error) {
        console.error(error);
        alert("Error al registrar el condominio");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Registro de nuevo Condominio</h1>
      <div class="form-group">
        <label className="labelInput">Nombre del condominio: </label>
        <input
          type="text"
          id="nombre_condominio"
          name="nombre_condominio"
          placeholder="Nombre del Condominio"
          value={formulario.nombre_condominio}
          onChange={handleChange}
        />
        {<div className="error-message">{errorCorreo}</div>}
      </div>
      <div class="form-group">
        <label className="labelInput">Direccion del condominio: </label>
        <input
          type="text"
          id="direccion_condominio"
          name="direccion_condominio"
          placeholder="Direccion del Condominio"
          value={formulario.direccion_condominio}
          onChange={handleChange}
        />
        {<div className="error-message">{errorContraseña}</div>}
      </div>
      <div class="form-group">
        <label className="labelInput">Administrador a cargo:</label>
        <select
          id="admin_condominio"
          name="admin_condominio"
          value={formulario.admin_condominio}
          onChange={handleChange}
        >
          <option value="EDITH ROGELIA QUIÑONES BONILLA">
            Edith Rogelia Quiñones Bonilla
          </option>
          <option value="MÓNICA BERNAL MORALES">Mónica Bernal Morales</option>
        </select>
      </div>
      <br />
      <div className="botones-container">
        <button className="mi-boton2" type="submit">
          Registrar
        </button>
      </div>
      <div className="Aceptado" style={{ display: visible ? "block" : "none" }}>
        Registro exitoso
      </div>
    </form>
  );
}
export default NuevoCondominio;
