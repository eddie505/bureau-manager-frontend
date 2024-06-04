/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_SERVER_URL } from "../config.js";

function EditoDepartamento() {
  const [formulario, setFormulario] = useState({
    id_edificio: "",
    id_departamento: "",
    nombre_departamento: "",
  });
  const [visible, setVisible] = useState(false);

  const [departamentos, setDepartamentos] = useState([]);
  const [edificios, setEdificios] = useState([]);

  const [condominios, setCondominios] = useState([]);
  const [idCondominioSeleccionado, setIdCondominioSeleccionado] = useState("");
  const [error, setError] = useState("");
  const [errorEdificio, setErrorEdificio] = useState("");
  const [errorDepartamento, setErrorDepartamento] = useState("");
  const [errorDepartamento2, setErrorDepartamento2] = useState("");

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("authData"));
    const id_administrador = parseInt(authData?.id);
    axios
      .get(`${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`)
      .then((resultado) => {
        setCondominios(resultado.data);
        if (resultado.data.length > 0) {
          setIdCondominioSeleccionado(resultado.data[0].id_condominio);
        } else {
          setError("Debes registrar antes un condominio");
        }
      })
      .catch((error) => {
        console.error(error);
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

  useEffect(() => {
    if (idCondominioSeleccionado) {
      axios
        .post(`${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`, {
          id_condominio: idCondominioSeleccionado,
        })
        .then((response) => {
          setEdificios(response.data);

          if (response.data.length > 0) {
            setFormulario((prev) => ({
              ...prev,
              id_edificio: response.data[0].id_edificio,
              id_departamento: "",
              nombre_departamento: "",
            }));

            cargarDepartamentos(response.data[0].id_edificio);
          } else {
            setErrorEdificio("Debes registrar antes un edificio");
            setDepartamentos([]);
            setFormulario((prev) => ({
              ...prev,
              id_edificio: "",
              id_departamento: "",
              nombre_departamento: "",
            }));
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Error al obtener los edificios");
        });
    }
  }, [idCondominioSeleccionado]);

  const cargarDepartamentos = (idEdificio) => {
    axios
      .post(`${REACT_APP_SERVER_URL}/api/getDepartamentosbyEdificios`, {
        id_edificio: idEdificio,
      })
      .then((resultado) => {
        setDepartamentos(resultado.data);
        if (resultado.data.length > 0) {
          setFormulario((prev) => ({
            ...prev,
            id_departamento: resultado.data[0].id_departamento,
            nombre_departamento: resultado.data[0].numero_departamento,
          }));
        } else {
          setErrorDepartamento("Debes registrar antes un departamento");
          setFormulario((prev) => ({
            ...prev,
            id_departamento: "",
            nombre_departamento: "",
          }));
          alert(
            "No hay departamentos disponibles para el edificio seleccionado."
          );
        }
      })
      .catch((error) => {
        console.error("Error al obtener los departamentos", error);
        alert("Error al obtener los departamentos");
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleChangeSelect = (event) => {
    const idEdificioSeleccionado = parseInt(event.target.value);
    setFormulario((prev) => ({ ...prev, id_edificio: idEdificioSeleccionado }));
    cargarDepartamentos(idEdificioSeleccionado);
  };

  const handleChangeSelectCondominio = (event) => {
    const idSeleccionado = parseInt(event.target.value);
    setIdCondominioSeleccionado(idSeleccionado);
    setEdificios([]);
    setFormulario((prev) => ({
      ...prev,
      id_edificio: "",
      nombre_departamento: "",
    }));
  };

  const handleChangeSelectDepartamentos = (event) => {
    const elegido = parseInt(event.target.value);
    const selectedDepartamento = departamentos.find(
      (c) => c.id_departamento === elegido
    );

    if (selectedDepartamento) {
      setErrorDepartamento("");
      setFormulario((prevState) => ({
        ...prevState,
        id_departamento: selectedDepartamento.id_departamento,
        nombre_departamento: selectedDepartamento.numero_departamento,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formulario.id_edificio === "" || formulario.id_edificio === "Defecto") {
      setErrorEdificio("*Seleccione un edificio");
      return;
    }
    if (
      formulario.id_departamento === "" ||
      formulario.id_departamento === "Defecto"
    ) {
      setErrorDepartamento("*Seleccione un departamento");
      return;
    }
    if (
      formulario.id_condominio === "" ||
      formulario.id_condominio === "Defecto"
    ) {
      setError("Debes registrar antes un condominio");
      return;
    }
    if (formulario.nombre_departamento.trim() === "") {
      setErrorDepartamento2("Ingrese un nombre/número para el departamento");
      return;
    }
    try {
      const resultado = await axios.post(
        `${REACT_APP_SERVER_URL}/api/actualizarDepartamento`,
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
      alert("Error al actualizar el departamento");
    }
  };

  let opcionesDepartamento;
  if (departamentos.length === 0) {
    opcionesDepartamento = (
      <option value="Defecto">No hay departamentos disponibles</option>
    );
  } else {
    opcionesDepartamento = departamentos.map((c) => (
      <option key={c.id_departamento} value={c.id_departamento}>
        {c.numero_departamento}
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

  return (
    <form onSubmit={handleSubmit} className="formulario2">
      <h1>Editar Departamento</h1>
      <div className="form-group">
        <label className="labelInput">Seleccione un Condominio: </label>
        <select
          id="opcionesCondominio"
          onChange={handleChangeSelectCondominio}
          value={idCondominioSeleccionado}
        >
          {opcionesCondominio}
        </select>
        <div className="error-message">{error}</div>
      </div>
      <div className="form-group">
        <label className="labelInput">Seleccione un Edificio: </label>
        <select id="opciones" onChange={handleChangeSelect}>
          {opcionesEdificio}
        </select>
        <div className="error-message">{errorEdificio}</div>
      </div>
      <div className="form-group">
        <label className="labelInput">Seleccione un Departamento: </label>
        <select id="opciones" onChange={handleChangeSelectDepartamentos}>
          {opcionesDepartamento}
        </select>
        <div className="error-message">{errorDepartamento}</div>
      </div>
      <div className="form-group">
        <label className="labelInput">Nombre/Numero del Departamento: </label>
        <input
          type="text"
          id="nombre_departamento"
          name="nombre_departamento"
          placeholder="Nombre/Numero del Departamento"
          value={formulario.nombre_departamento}
          onChange={handleChange}
        />
        <div className="error-message">{errorDepartamento2}</div>
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
export default EditoDepartamento;
