/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../img/logo2.png";
import { useAuth } from "../AuthContext.js";
import { REACT_APP_SERVER_URL } from "../config.js";
//${REACT_APP_SERVER_URL}/api/api

function Formulario() {
  const [formulario, setFormulario] = useState({
    correo_administrador: "",
    contraseña_administrador: "",
  });
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [redirigir, setRedirigir] = useState(false);
  const { login } = useAuth();

  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorContraseña, setErrorContraseña] = useState("");
  const [errorCuenta, setErrorCuenta] = useState("");

  useEffect(() => {
    const localData = localStorage.getItem("authData");
    if (localData) {
      const { token } = JSON.parse(localData);
      if (token) {
        navigate("/MenuPrincipal");
      }
    }

    document.body.classList.add("body1");

    return () => {
      document.body.classList.remove("body1");
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({ ...prevState, [name]: value }));

    if (name === "correo_administrador") {
      if (value.trim() === "") {
        setErrorCorreo("*Ingrese un correo electrónico");
      } else {
        setErrorCorreo("");
      }
    }

    // Validación de contraseña
    if (name === "contraseña_administrador") {
      if (value.trim() === "") {
        setErrorContraseña("*Ingrese una contraseña");
      } else {
        setErrorContraseña("");
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formulario.correo_administrador.trim() === "") {
      setErrorCorreo("*Ingrese un correo electrónico");
    }
    if (formulario.contraseña_administrador.trim() === "") {
      setErrorContraseña("*Ingrese una contraseña");
    }
    if (
      formulario.correo_administrador.trim() !== "" &&
      formulario.contraseña_administrador.trim() !== ""
    ) {
      try {
        const resultado = await axios.post(
          `${REACT_APP_SERVER_URL}/api/getAdmin`,
          formulario
        );

        /*if (resultado.data === 1) {
            setRedirigir(true);
          } else {
            setVisible(true);
          }*/

        if (resultado.data.token) {
          login(resultado.data.token, resultado.data.id_administrador);
          const id_administrador = resultado.data.id_administrador;
          console.log(id_administrador);

          navigate("/MenuPrincipal");
        } else {
          setVisible(true);
          setErrorCuenta("Correo electrónico o contraseña incorrectos");
        }
      } catch (error) {
        console.error(error);
        setErrorCuenta("Correo electrónico o contraseña incorrectos");
      }
    }
  };

  if (redirigir) {
    navigate("/MenuPrincipal");
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="divCenter">
        <img className="imgLogo" src={logo} alt="Logo de la empresa" />
      </div>
      <h1>Bureau-Manager</h1>
      <h2>Iniciar Sesión</h2>
      <div class="form-group">
        <input
          type="email"
          id="correo_administrador"
          name="correo_administrador"
          placeholder="Correo Electrónico"
          value={formulario.correo_administrador}
          onChange={handleChange}
        />
        {<div className="error-message">{errorCorreo}</div>}
      </div>
      <div class="form-group">
        <input
          type="password"
          id="contraseña_administrador"
          name="contraseña_administrador"
          placeholder="Contraseña"
          value={formulario.contraseña_administrador}
          onChange={handleChange}
        />
        {<div className="error-message">{errorContraseña}</div>}
      </div>
      {<div className="error-message">{errorCuenta}</div>}
      <button type="submit">Iniciar Sesión</button>
      <div
        className="error-message"
        style={{ display: visible ? "block" : "none" }}
      >
        Correo electrónico o contraseña incorrectos
      </div>
      <p>
        ¿No te has registrado? <Link to="/RegistrarCuenta">Crear Cuenta</Link>
      </p>
    </form>
  );
}
export default Formulario;
