import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdAppRegistration } from "react-icons/md";
import { REACT_APP_SERVER_URL } from "../config.js";
import axios from "axios";

function EditarCuotas() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);

  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [selectedCondominio, setSelectedCondominio] = useState("");
  const [selectedEdificio, setSelectedEdificio] = useState("");
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    cuota_base: "",
    cuota_extra: null,
    id_edificio: "",
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
              const edificiosConCuotasFiltrados = edificiosConCuotas.filter(
                (edificio) => edificio.tieneCuota
              );
              setEdificios(edificiosConCuotasFiltrados);
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

  useEffect(() => {
    if (selectedEdificio) {
      axios
        .get(`${REACT_APP_SERVER_URL}/api/obtenerCuota/${selectedEdificio}`)
        .then((response) => {
          const cuota = response.data[0];
          setFormulario({
            cuota_base: cuota.cuota_base || "",
            cuota_extra: cuota.cuota_extra || "",
            id_edificio: selectedEdificio,
          });
        })
        .catch((error) => {
          console.error("Error al obtener la cuota del edificio", error);
        });
    }
  }, [selectedEdificio]);

  const handleCondominioChange = (event) => {
    const value = event.target.value;
    setSelectedCondominio(value);
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
        `${REACT_APP_SERVER_URL}/api/actualizarCuotas`,
        formulario
      );
      if (response.status === 200) {
        alert("Se han actualizado las cuotas con éxito");
        window.location.reload();
      } else {
        alert(response.status);
      }
    } catch (error) {
      console.error(error);
      alert("Error al actualizar las cuotas");
    }
  };

  return (
    <div
      className="div-contenedor div-espaciado"
      style={{ marginTop: "150px" }}
    >
      <h1 style={{ color: "#163C40" }}>Editar cuotas</h1>
      <Link to="/RegistrarCuotas">
        <button type="button" className="mi-boton2" style={{ width: "160px" }}>
          <MdAppRegistration /> Registrar Cuotas
        </button>
      </Link>
      <form className="fromInquilino" onSubmit={handleSubmit}>
        <p style={{ textAlign: "justify" }}>
          <b>NOTA: </b>Solo se mostrán en las opciones los edificios que ya
          tengan cuotas asignadas.
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
                Ingrese la nueva cuota base (o sin estacionamiento):
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
                value={formulario.cuota_base}
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
                Ingrese la nueva cuota por estacionamiento (opcional):
              </label>
              <br />
              <input
                type="number"
                id="cuota_extra"
                min={0}
                max={10000}
                placeholder="$"
                onChange={handleInputChange}
                value={formulario.cuota_extra}
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

export default EditarCuotas;
