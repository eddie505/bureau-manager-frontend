/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import { REACT_APP_SERVER_URL } from "../config.js";

function NuevoInquilino() {
  const [formulario, setFormulario] = useState({
    id_condominio: "",
    id_edificio: "",
    id_departamento: "",
    nombre_inquilino: "",
    apellino_paterno_inquilino: "",
    apellino_materno_inquilino: "",
    correo_inquilino: "",
    codigo_inquilino: "",
  });

  const [visible, setVisible] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);

  const [error, setError] = useState("");
  const [errorEdificio, setErrorEdificio] = useState("");
  const [errorDepartamento, setErrorDepartamento] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorApellidoP, setErrorApellidoP] = useState("");
  const [errorApellidoM, setErrorApellidoM] = useState("");
  const [errorInquilino, setErrorInquilino] = useState("");

  let numeros = "0123456789";
  let letras = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let todo = numeros + letras;

  const generarCodigo = (longitud) => {
    let codigo = "";
    for (let x = 0; x < longitud; x++) {
      let posicion = Math.floor(Math.random() * todo.length);
      codigo += todo.charAt(posicion);
    }
    return codigo;
  };

  const verificarYGenerarCodigo = async () => {
    let codigoUnico = false;
    let codigo_inquilino = "";
    while (!codigoUnico) {
      codigo_inquilino = generarCodigo(8);
      const respuestaCodigo = await axios.get(
        `${REACT_APP_SERVER_URL}/api/verificarCodigoInquilino/${codigo_inquilino}`
      );
      codigoUnico = !respuestaCodigo.data.existe;
    }
    return codigo_inquilino;
  };

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("authData"));
    const id_administrador = parseInt(authData?.id);
    axios
      .get(`${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`)
      .then((response) => {
        if (response.data.length === 0) {
          setEdificios([]);
          setDepartamentos([]);
          setCondominios([]);
          setFormulario({
            id_condominio: 0,
          });
        } else {
          setCondominios(response.data);
          setFormulario({
            id_condominio: response.data[0].id_condominio,
          });
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
                setEdificios([]);
                setDepartamentos([]);
                setFormulario({
                  id_edificio: 0,
                  nombre_edificio: "",
                });
              } else {
                setEdificios(resultado.data);
                setFormulario({
                  id_edificio: resultado.data[0].id_edificio,
                });

                const selectedEdifcio = resultado.data[0].id_edificio;
                const diccionario2 = {};
                diccionario2["id_edificio"] = parseInt(selectedEdifcio);

                axios
                  .post(
                    `${REACT_APP_SERVER_URL}/api/getDepartamentosbyEdificios`,
                    diccionario2
                  )
                  .then((resultado) => {
                    if (resultado.data.length === 0) {
                      setDepartamentos([]);
                      setFormulario({
                        id_departamento: 0,
                      });
                    } else {
                      setDepartamentos(resultado.data);
                      setFormulario({
                        id_departamento: resultado.data[0].id_departamento,
                      });
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                    alert("Error al obtener los departamentos");
                  });
              }
            })
            .catch((error) => {
              console.error(error);
              alert("Error al obtener los edificios");
            });
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.response && error.response.status === 404) {
          ///
        } else {
          alert("Error al obtener los condominios");
        }
      });
    document.body.classList.add("body4");

    return () => {
      document.body.classList.remove("body4");
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
            setDepartamentos([]);
            setFormulario({
              id_edificio: 0,
            });
          } else {
            setEdificios(resultado.data);
            setFormulario({
              id_edificio: resultado.data[0].id_edificio,
            });
            const selectedEdifcio = resultado.data[0].id_edificio;
            const diccionario2 = {};
            diccionario2["id_edificio"] = parseInt(selectedEdifcio);

            axios
              .post(
                `${REACT_APP_SERVER_URL}/api/getDepartamentosbyEdificios`,
                diccionario2
              )
              .then((resultado) => {
                if (resultado.data.length === 0) {
                  setDepartamentos([]);
                  setFormulario({
                    id_departamento: 0,
                  });
                } else {
                  setDepartamentos(resultado.data);
                  setFormulario({
                    id_departamento: resultado.data[0].id_departamento,
                  });
                }
              })
              .catch((error) => {
                console.error(error);
                alert("Error al obtener los departamentos");
              });
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
      const diccionario = {};
      diccionario["id_edificio"] = selectedEdificio.id_edificio;

      axios
        .post(
          `${REACT_APP_SERVER_URL}/api/getDepartamentosbyEdificios`,
          diccionario
        )
        .then((resultado) => {
          if (resultado.data.length === 0) {
            setDepartamentos([]);
            setFormulario({
              id_departamento: 0,
            });
          } else {
            setDepartamentos(resultado.data);
            setFormulario({
              id_departamento: resultado.data[0].id_departamento,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Error al obtener los departamentos");
        });

      setFormulario((prevState) => ({
        ...prevState,
        id_edificio: selectedEdificio.id_edificio,
      }));
    }
  };

  const handleChangeSelectDepartamentos = (event) => {
    const elegido = parseInt(event.target.value);
    const selectedDepartamento = departamentos.find(
      (c) => c.id_departamento === elegido
    );

    if (selectedDepartamento) {
      setFormulario((prevState) => ({
        ...prevState,
        id_departamento: selectedDepartamento.id_departamento,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      formulario.id_condominio === "" ||
      formulario.id_condominio === "Defecto"
    ) {
      setError("Debe tener al menos un condominio registrado");
      return;
    }
    if (formulario.id_edificio === "" || formulario.id_edificio === "Defecto") {
      setErrorEdificio("Debe tener al menos un edificio registrado");
      return;
    }
    if (
      formulario.id_departamento === "" ||
      formulario.id_departamento === "Defecto"
    ) {
      setErrorDepartamento("Debe tener al menos un departamento registrado");
      return;
    }
    if (
      !formulario.nombre_inquilino ||
      formulario.nombre_inquilino.trim() === ""
    ) {
      setErrorNombre("Debe ingresar un nombre");
      return;
    }
    if (
      !formulario.apellino_paterno_inquilino ||
      formulario.apellino_paterno_inquilino.trim() === ""
    ) {
      setErrorApellidoP("Debe ingresar un apellido paterno");
      return;
    }
    if (
      !formulario.apellino_materno_inquilino ||
      formulario.apellino_materno_inquilino.trim() === ""
    ) {
      setErrorApellidoM("Debe ingresar un apellido materno");
      return;
    }
    const trimmedNombreInquilino = formulario.nombre_inquilino.trim();
    const trimmedApellidoP = formulario.apellino_paterno_inquilino.trim();
    const trimmedApellidoM = formulario.apellino_materno_inquilino.trim();
    try {
      const response = await axios.post(
        `${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`,
        { id_departamento: formulario.id_departamento }
      );
      if (response.data.length > 0) {
        setErrorInquilino(
          "Ya existe un inquilino asignado a este departamento"
        );
        return;
      }
      const codigo = await verificarYGenerarCodigo();
      const nuevoFormulario = {
        ...formulario,
        codigo_inquilino: codigo,
        nombre_inquilino: trimmedNombreInquilino,
        apellino_paterno_inquilino: trimmedApellidoP,
        apellino_materno_inquilino: trimmedApellidoM,
      };
      const resultado = await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarInquilino`,
        nuevoFormulario
      );
      if (resultado.data === 200) {
        setVisible(true);
        window.location.reload();
      } else {
        alert(resultado.data);
      }
    } catch (error) {
      console.error(error);
      alert("Error al agregar al inquilino" + error);
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

  return (
    <form className="fromInquilino" onSubmit={handleSubmit}>
      <h1>Registrar a un Nuevo Inquilino</h1>
      <div className="select-container">
        <div className="select-item">
          <label className="labelInput">Seleccione un condominio: </label>
          <select id="opciones" onChange={handleChangeSelect}>
            {opcionesCondominio}
          </select>
          <div className="error-message">{error}</div>
        </div>
        <div className="select-item">
          <label className="labelInput">Seleccione un Edificio: </label>
          <select id="opciones" onChange={handleChangeSelectEdificios}>
            {opcionesEdificio}
          </select>
          <div className="error-message">{errorEdificio}</div>
        </div>
        <div className="select-item">
          <label className="labelInput">Seleccione un Departamento: </label>
          <select id="opciones" onChange={handleChangeSelectDepartamentos}>
            {opcionesDepartamento}
          </select>
          <div className="error-message">{errorDepartamento}</div>
        </div>
      </div>
      <div className="select-container">
        <div className="select-item">
          <label className="labelInput">Nombre del Inquilino: </label>
          <input
            type="text"
            id="nombre_inquilino"
            name="nombre_inquilino"
            placeholder="Nombre del Inquilino"
            value={formulario.nombre_inquilino}
            onChange={handleChange}
          />
          <div className="error-message">{errorNombre}</div>
        </div>
        <div className="select-item">
          <label className="labelInput">Apellido Paterno: </label>
          <input
            type="text"
            id="apellino_paterno_inquilino"
            name="apellino_paterno_inquilino"
            placeholder="Apellido Paterno"
            value={formulario.apellino_paterno_inquilino}
            onChange={handleChange}
          />
          <div className="error-message">{errorApellidoP}</div>
        </div>
        <div className="select-item">
          <label className="labelInput">Apellido Materno: </label>
          <input
            type="text"
            id="apellino_materno_inquilino"
            name="apellino_materno_inquilino"
            placeholder="Apellido Materno"
            value={formulario.apellino_materno_inquilino}
            onChange={handleChange}
          />
          <div className="error-message">{errorApellidoM}</div>
        </div>
      </div>
      <div className="select-container">
        <div className="select-item">
          <label className="labelInput">Correo del Inquilino: </label>
          <input
            type="email"
            id="correo_inquilino"
            name="correo_inquilino"
            placeholder="Correo Electrónico"
            value={formulario.correo_inquilino}
            onChange={handleChange}
            style={{ width: "240px" }}
          />
        </div>
      </div>
      <div className="error-message">{errorInquilino}</div>
      <br />
      <div style={{ display: visible ? "block" : "none" }}>
        Registro exitoso
      </div>
      <div className="botones-container">
        <button className="mi-boton2" type="submit">
          Registrar
        </button>
      </div>
    </form>
  );
}
export default NuevoInquilino;
