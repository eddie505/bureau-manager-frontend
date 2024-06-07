import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { REACT_APP_SERVER_URL } from "../config.js";
import axios from "axios";

function RegistrarCuotas() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);

  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [selectedCondominio, setSelectedCondominio] = useState("");
  const [selectedEdificio, setSelectedEdificio] = useState("");
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    id_condominio: "",
    id_edificio: "",
    cuota_base: "",
    cuota_extra: null,
  });

  useEffect(() => {
    axios
      .get(`${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`)
      .then((response) => {
        setCondominios(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener condominios", error);
      });

    document.body.classList.add("body2");
    return () => {
      document.body.classList.remove("body2");
    };
  });

  useEffect(() => {
    if (selectedCondominio) {
      axios
        .post(`${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`, {
          id_condominio: selectedCondominio,
        })
        .then((response) => {
          const edificios = response.data;
          const fetchCuotas = edificios.map((edificio) =>
            axios.get(
              `${REACT_APP_SERVER_URL}/api/obtenerCuota/${edificio.id_edificio}`
            )
          );

          Promise.all(fetchCuotas)
            .then((results) => {
              const edificiosConCuotas = results.map((res, index) => ({
                ...edificios[index],
                tieneCuota: res.data.length > 0,
              }));
              const edificiosSinCuotas = edificiosConCuotas.filter(
                (edificio) => !edificio.tieneCuota
              );
              setEdificios(edificiosSinCuotas);
              setSelectedEdificio("");
            })
            .catch((error) => {
              console.error("Error al obtener cuotas", error);
            });
        })
        .catch((error) => {
          console.error("Error al obtener edificios", error);
        });
    }
  }, [selectedCondominio]);

  const handleCondominioChange = (event) => {
    const value = event.target.value;
    setSelectedCondominio(value);
    const valorForm = parseInt(value);
    setFormulario({ ...formulario, id_condominio: valorForm });
    setError("");
  };

  const handleEdificioChange = (event) => {
    const value = event.target.value;
    setSelectedEdificio(value);
    const valorForm = parseInt(value);
    setFormulario({ ...formulario, id_edificio: valorForm });
    setError("");
  };

  const handleInputChange = (event) => {
    const { id, value } = event.target;
    setFormulario({ ...formulario, [id]: parseFloat(value.trim()) });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    for (let field in formulario) {
      if (field === "cuota_extra") continue;

      if (formulario[field] === "" || formulario[field] === 0) {
        setError(`El campo ${field} es obligatorio.`);
        return;
      }
    }
    if (formulario.cuota_extra === "" || formulario.cuota_extra === 0) {
      setFormulario({ ...formulario, cuota_extra: null });
    }
    try {
      const response = await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarCuotas`,
        formulario
      );
      if (response.status === 200) {
        alert("Registro exitoso");
        window.location.reload();
      } else {
        alert(response.status);
      }
    } catch (error) {
      console.error(error);
      alert("Error al registrar las cuotas");
    }
  };

  return (
    <div
      className="div-contenedor div-espaciado"
      style={{ marginTop: "150px" }}
    >
      <h1 style={{ color: "#163C40" }}>Asignar cuotas a cada condominio</h1>
      <Link to="/EditarCuotas">
        <button type="button" className="mi-boton2" style={{ width: "160px" }}>
          <AiOutlineEdit /> Editar Cuotas
        </button>
      </Link>
      <form className="fromInquilino" onSubmit={handleSubmit}>
        <p style={{ textAlign: "justify" }}>
          <b>NOTA: </b>Si ya se han registrado y asignado cuotas a cierto
          edificio, este ya no se mostrará entre las opciones.
        </p>
        <div className="container-cuotas">
          <div className="column-cuotas">
            <div className="item-cuotas">
              <label className="labelInput" htmlFor="condominio">
                Seleccione un condominio:
              </label>
              <br />
              <select
                onChange={handleCondominioChange}
                value={selectedCondominio}
              >
                <option value="">Seleccione un condominio</option>
                {condominios.map((condominio) => (
                  <option
                    key={condominio.id_condominio}
                    value={condominio.id_condominio}
                  >
                    {condominio.nombre_condominio}
                  </option>
                ))}
              </select>
            </div>
            <div className="item-cuotas">
              <label htmlFor="cuota_base" className="labelInput">
                Ingrese la cuota base (o sin estacionamiento):
              </label>
              <br />
              <input
                type="number"
                id="cuota_base"
                min={0}
                max={10000}
                placeholder="$"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="column-cuotas">
            <div className="item-cuotas">
              <label className="labelInput" htmlFor="condominio">
                Seleccione un edificio:
              </label>
              <br />
              <select
                onChange={handleEdificioChange}
                value={selectedEdificio}
                disabled={!selectedCondominio}
              >
                <option value="">Seleccione un edificio</option>
                {edificios.map((edificio) => (
                  <option
                    key={edificio.id_edificio}
                    value={edificio.id_edificio}
                  >
                    {edificio.nombre_edificio}
                  </option>
                ))}
              </select>
            </div>
            <div className="item-cuotas">
              <label htmlFor="cuota_extra" className="labelInput">
                Ingrese la cuota por estacionamiento (opcional):
              </label>
              <br />
              <input
                type="number"
                id="cuota_extra"
                min={0}
                max={10000}
                placeholder="$"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="error-message">{error}</div>
        <br />
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <button className="mi-boton2" type="submit">
            Registrar cuotas
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegistrarCuotas;
