/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_SERVER_URL } from "../config.js";

function EditoEdificio() {
  const [formulario, setFormulario] = useState({
    id_edificio: "",
    numero_departamento: "",
  });
  const [visible, setVisible] = useState(false);

  const [edificios, setEdificios] = useState([]);

  const [condominios, setCondominios] = useState([]);
  const [idCondominioSeleccionado, setIdCondominioSeleccionado] =
    useState(null);
  const [error, setError] = useState("");
  const [errorEdificio, setErrorEdificio] = useState("");
  const [errorDepa, setErrorDepa] = useState("");

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("authData"));
    const id_administrador = parseInt(authData?.id);
    axios
      .get(`${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`)
      .then((resultado) => {
        if (resultado.data.length > 0) {
          setCondominios(resultado.data);
          setIdCondominioSeleccionado(resultado.data[0]?.id_condominio);
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

  /*useEffect(() => {
        axios.get(`${REACT_APP_SERVER_URL}/api/getEdificios`)
          .then(resultado => {
            if (resultado.data.length === 0) {
              setFormulario({
                id_edificio: 0
              });
            } else {
              setEdificios(resultado.data);
              setFormulario({
                id_edificio: resultado.data[0].id_edificio
              });
            }
          })
          .catch(error => {
            console.error(error);
            alert('Error al obtener los edificios');
          });
  }, []);*/

  useEffect(() => {
    if (idCondominioSeleccionado) {
      axios
        .post(`${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`, {
          id_condominio: idCondominioSeleccionado,
        })
        .then((resultado) => {
          if (resultado.data.length > 0) {
            setEdificios(resultado.data);
            setFormulario((prevState) => ({
              ...prevState,
              id_edificio: resultado.data[0]?.id_edificio,
            }));
          } else {
            setErrorEdificio("Debes registrar antes un edificio");
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Error al obtener los edificios");
        });
    }
  }, [idCondominioSeleccionado]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleChangeSelectEdificios = (event) => {
    const elegido = parseInt(event.target.value);
    const selectedEdificio = edificios.find((c) => c.id_edificio === elegido);

    if (selectedEdificio) {
      setErrorEdificio("");
      setFormulario((prevState) => ({
        ...prevState,
        id_edificio: selectedEdificio.id_edificio,
      }));
    }
  };

  const handleChangeSelectCondominios = (event) => {
    setIdCondominioSeleccionado(parseInt(event.target.value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formulario.id_edificio === "" || formulario.id_edificio === "Defecto") {
      setErrorEdificio("Debes registrar antes un edificio");
      return;
    }
    if (
      formulario.id_condominio === "" ||
      formulario.id_condominio === "Defecto"
    ) {
      setError("Debes registrar antes un condominio");
      return;
    }
    if (formulario.numero_departamento.trim() === "") {
      setErrorDepa("Ingrese un nombre/numero del departamento");
      return;
    }
    try {
      const resultado = await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarDepartamento`,
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
      alert("Error al registrar el Departamento");
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
      <option value="Defecto">No hay edificios registrados</option>
    );
  } else {
    opcionesEdificio = edificios.map((c) => (
      <option key={c.id_edificio} value={c.id_edificio}>
        {c.nombre_edificio}
      </option>
    ));
  }
  return (
    <form onSubmit={handleSubmit} className="formulario">
      <h1>Nuevo Departamento</h1>
      <div className="form-group">
        <label className="labelInput">Seleccione un Condominio: </label>
        <select id="condominios" onChange={handleChangeSelectCondominios}>
          {opcionesCondominio}
        </select>
        <div className="error-message">{error}</div>
      </div>
      <br></br>
      <div className="form-group">
        <label className="labelInput">Seleccione un Edificio: </label>
        <select id="opciones" onChange={handleChangeSelectEdificios}>
          {opcionesEdificio}
        </select>
        <div className="error-message">{errorEdificio}</div>
      </div>
      <br></br>
      <div className="form-group">
        <label className="labelInput">Nombre/Numero del Departamento: </label>
        <input
          type="text"
          id="numero_departamento"
          name="numero_departamento"
          placeholder="Nombre/Numero del Departamento"
          value={formulario.numero_departamento}
          onChange={handleChange}
        />
        <div className="error-message">{errorDepa}</div>
      </div>
      <div className="botones-container">
        <button className="mi-boton2" type="submit">
          Registrar
        </button>
      </div>
      <div style={{ display: visible ? "block" : "none" }}>
        Registro exitoso
      </div>
    </form>
  );
}
export default EditoEdificio;
