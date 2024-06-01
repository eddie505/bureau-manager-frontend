/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { REACT_APP_SERVER_URL } from "../config.js";

function RegistrarCuenta() {
  const [formulario, setFormulario] = useState({
    nombre_administrador: "",
    apellido_paterno_administrador: "",
    apellido_materno_administrador: "",
    correo_administrador: "",
    contraseña_administrador: "",
  });
  const navigate = useNavigate();
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({ ...prevState, [name]: value }));
  };
  const [errors, setErrors] = useState({});

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.body.classList.add("body1");

    return () => {
      document.body.classList.remove("body1");
    };
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        const resultado = await axios.post(
          `${REACT_APP_SERVER_URL}/api/registrarCuenta`,
          formulario
        );
        if (resultado.data === "Cuenta registrada exitosamente") {
          navigate("/");
        } else {
          setErrorMessage(
            "Ya existe una cuenta registrada con este correo electrónico"
          );
        }
      } catch (error) {
        console.error(error);
        alert("Error al registrar cuenta");
      }
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    // Validar nombre
    if (formulario.nombre_administrador.trim() === "") {
      newErrors.nombre_administrador = "*Ingrese un nombre";
      valid = false;
    } else if (!isValidName(formulario.nombre_administrador)) {
      newErrors.nombre_administrador = "El Nombre solo debe contener letras";
      valid = false;
    }

    // Validar apellido paterno
    if (formulario.apellido_paterno_administrador.trim() === "") {
      newErrors.apellido_paterno_administrador = "*Ingrese un apellido paterno";
      valid = false;
    } else if (!isValidName(formulario.apellido_paterno_administrador)) {
      newErrors.apellido_paterno_administrador =
        "*El Apellido Paterno solo debe contener letras";
      valid = false;
    }

    // Validar apellido materno
    if (formulario.apellido_materno_administrador.trim() === "") {
      newErrors.apellido_materno_administrador = "*Ingrese un apellido materno";
      valid = false;
    } else if (!isValidName(formulario.apellido_materno_administrador)) {
      newErrors.apellido_materno_administrador =
        "*El Apellido Materno solo debe contener letras";
      valid = false;
    }

    // Validar correo electrónico
    if (formulario.correo_administrador.trim() === "") {
      newErrors.correo_administrador = "*Ingrese un correo electrónico";
      valid = false;
    }

    // Validar contraseña
    if (formulario.contraseña_administrador.trim() === "") {
      newErrors.contraseña_administrador = "*Ingrese una contraseña";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const isValidName = (name) => {
    const regex = /^[a-zA-Z\s]*$/;
    return regex.test(name);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h1>Registrar Nueva Cuenta</h1>
      <div className="form-group">
        <input
          type="text"
          id="nombre_administrador"
          name="nombre_administrador"
          placeholder="Nombre"
          value={formulario.nombre_administrador}
          onChange={handleChange}
        />
        {<div className="error-message">{errors.nombre_administrador}</div>}
      </div>
      <div className="form-group">
        <input
          type="text"
          id="apellido_paterno_administrador"
          name="apellido_paterno_administrador"
          placeholder="Apellido Paterno"
          value={formulario.apellido_paterno_administrador}
          onChange={handleChange}
        />
        {
          <div className="error-message">
            {errors.apellido_paterno_administrador}
          </div>
        }
      </div>
      <div className="form-group">
        <input
          type="text"
          id="apellido_materno_administrador"
          name="apellido_materno_administrador"
          placeholder="Apellido Materno"
          value={formulario.apellido_materno_administrador}
          onChange={handleChange}
        />
      </div>
      {
        <div className="error-message">
          {errors.apellido_materno_administrador}
        </div>
      }
      <div className="form-group">
        <input
          type="email"
          id="correo_administrador"
          name="correo_administrador"
          placeholder="Correo Electronico"
          value={formulario.correo_administrador}
          onChange={handleChange}
        />
        {<div className="error-message">{errors.correo_administrador}</div>}
      </div>
      <div className="form-group">
        <input
          type="password"
          id="contraseña_administrador"
          name="contraseña_administrador"
          placeholder="Contraseña"
          value={formulario.contraseña_administrador}
          onChange={handleChange}
        />
        {<div className="error-message">{errors.contraseña_administrador}</div>}
        {
          <div className="error-message" id="error-cuenta-registrada">
            {errorMessage}
          </div>
        }
      </div>
      <button type="submit">Registrarse</button>
      <p>
        ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
      </p>
    </form>
  );
}
export default RegistrarCuenta;
