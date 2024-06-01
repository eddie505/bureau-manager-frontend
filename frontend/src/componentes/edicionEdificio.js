/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { REACT_APP_SERVER_URL } from "../config.js";

function EditoEdificio() {
  const [formulario, setFormulario] = useState({
    id_condominio: "",
    id_edificio: "",
    nombre_edificio: "",
  });
  const [visible, setVisible] = useState(false);

  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [error, setError] = useState("");
  const [errorEdificio, setErrorEdificio] = useState("");
  const [errorEdificio2, setErrorEdificio2] = useState("");

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("authData"));
    const id_administrador = parseInt(authData?.id);
    axios
      .get(`${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`)
      .then((response) => {
        if (response.data.length === 0) {
          setFormulario({
            id_condominio: 0,
          });
        } else if (response.data.length > 0) {
          setCondominios(response.data);
          setFormulario((prevState) => ({
            ...prevState,
            id_condominio: response.data[0].id_condominio,
          }));
        } else {
          setError("Debes registrar antes un condominio");
        }

        // Mueve el segundo axios.get() dentro del then() del primer axios.get()
        const selectedCondominio = response.data[0].id_condominio;
        const diccionario = {};
        diccionario["id_condominio"] = parseInt(selectedCondominio);

        axios
          .post(
            `${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`,
            diccionario
          )
          .then((resultado) => {
            if (resultado.data.length === 0) {
              setFormulario({
                id_edificio: 0,
                nombre_edificio: "",
              });
            } else if (resultado.data.length > 0) {
              setEdificios(resultado.data);
              setFormulario((prevState) => ({
                ...prevState,
                id_edificio: resultado.data[0].id_edificio,
                nombre_edificio: resultado.data[0].nombre_edificio,
              }));
            } else {
              setErrorEdificio("Debes registrar antes un edificio");
            }
          })
          .catch((error) => {
            console.error(error);
            alert("Error al obtener los edificios");
          });
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 404) {
          setError("Debes registrar antes un condominio");
        } else {
          alert("Error al obtener los condominios");
        }
      });
    document.body.classList.add("body2");

    return () => {
      document.body.classList.remove("body2");
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleChangeSelect = (event) => {
    const elegido = parseInt(event.target.value);
    const selectedCondominio = condominios.find(
      (c) => c.id_condominio === elegido
    );

    if (selectedCondominio) {
      setError("");
      const diccionario = {};
      diccionario["id_condominio"] = selectedCondominio.id_condominio;

      axios
        .post(
          `${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`,
          diccionario
        )
        .then((resultado) => {
          if (resultado.data.length === 0) {
            setEdificios([]);
            setFormulario({
              id_edificio: 0,
              nombre_edificio: "",
            });
          } else if (resultado.data.length > 0) {
            setEdificios(resultado.data);
            setFormulario((prevState) => ({
              ...prevState,
              id_edificio: resultado.data[0].id_edificio,
              nombre_edificio: resultado.data[0].nombre_edificio,
            }));
          } else {
            setErrorEdificio("Debes registrar antes un edificio");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Error al obtener los edificios");
        });

      setFormulario((prevState) => ({
        ...prevState,
        id_condominio: selectedCondominio.id_condominio,
      }));
    }
  };

  const handleChangeSelectEdificios = (event) => {
    const elegido = parseInt(event.target.value);
    const selectedEdificio = edificios.find((c) => c.id_edificio === elegido);

    if (selectedEdificio) {
      setErrorEdificio("");
      setFormulario((prevState) => ({
        ...prevState,
        id_edificio: selectedEdificio.id_edificio,
        nombre_edificio: selectedEdificio.nombre_edificio,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      formulario.id_condominio === "" ||
      formulario.id_condominio === "Defecto"
    ) {
      setError("Debes registrar antes un condominio");
      return;
    }
    if (formulario.id_edificio === "" || formulario.id_edificio === "Defecto") {
      setErrorEdificio("Debes registrar antes un edificio");
      return;
    }
    if (formulario.nombre_edificio.trim() === "") {
      setErrorEdificio2("Debes ingresar un nombre para el edificio");
      return;
    }
    try {
      const resultado = await axios.post(
        `${REACT_APP_SERVER_URL}/api/actualizarEdificio`,
        formulario
      );
      if (resultado.data === 200) {
        setVisible(true);
        window.location.reload();
      } else {
        alert(resultado.data);
      }
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el edificio");
    }
  };

  let opcionesCondominio;
  if (condominios.length === 0) {
    opcionesCondominio = (
      <option value="Defecto">No hay condominios disponibles</option>
    );
  } else {
    opcionesCondominio = condominios.map((c) => (
      <option key={c.id_condominio} value={c.id_condominio}>
        {c.nombre_condominio}
      </option>
    ));
  }

  let opcionesEdificio;
  if (edificios.length === 0) {
    opcionesEdificio = (
      <option value="Defecto">No hay edificios en el condominio</option>
    );
  } else {
    opcionesEdificio = edificios.map((c) => (
      <option key={c.id_edificio} value={c.id_edificio}>
        {c.nombre_edificio}
      </option>
    ));
  }
  return (
    <form onSubmit={handleSubmit} className="formulario2">
      <h1>Editar Edificio</h1>
      <div class="form-group">
        <label className="labelInput">Seleccione un condominio: </label>
        <select id="opciones" onChange={handleChangeSelect}>
          {opcionesCondominio}
        </select>
        <div className="error-message">{error}</div>
      </div>
      <div class="form-group">
        <label className="labelInput">Seleccione un Edificio: </label>
        <select id="opciones" onChange={handleChangeSelectEdificios}>
          {opcionesEdificio}
        </select>
        <div className="error-message">{errorEdificio}</div>
      </div>
      <div class="form-group">
        <label className="labelInput">Nombre del Edificio: </label>
        <input
          type="text"
          id="nombre_edificio"
          name="nombre_edificio"
          placeholder="Nombre del Edificio"
          value={formulario.nombre_edificio}
          onChange={handleChange}
        />
        <div className="error-message">{errorEdificio2}</div>
      </div>
      <div className="botones-container">
        <button className="mi-boton2" type="submit">
          Actualizar
        </button>
      </div>
      <div style={{ display: visible ? "block" : "none" }}>
        Actualizacion exitosa
      </div>
    </form>
  );
}
export default EditoEdificio;
