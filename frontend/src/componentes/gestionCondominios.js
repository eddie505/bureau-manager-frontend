/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { REACT_APP_SERVER_URL } from "../config.js";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";

function CondominiosComponent() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);

  const [condominios, setCondominios] = useState([]);
  const [selectedCondominio, setSelectedCondominio] = useState(null);
  const [selectedEdificio, setSelectedEdificio] = useState(null);
  const [inquilinos, setInquilinos] = useState([]);
  const [cuotas, setCuotas] = useState([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10);

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const inquilinosActuales = inquilinos.slice(
    indicePrimerRegistro,
    indiceUltimoRegistro
  );

  const cambiarPagina = (numeroPagina) => setPaginaActual(numeroPagina);

  useEffect(() => {
    fetchCondominios();
    document.body.classList.add("body2");
    return () => {
      document.body.classList.remove("body2");
    }
  }, []);

  const fetchCondominios = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`
      );
      setCondominios(response.data);
    } catch (error) {
      console.error("Error al obtener condominios", error);
    }
  };

  const selectCondominio = async (condominio) => {
    if (
      selectedCondominio &&
      selectedCondominio.id_condominio === condominio.id_condominio
    ) {
      setSelectedCondominio(null);
      setSelectedEdificio(null);
    } else {
      try {
        const response = await axios.post(
          `${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`,
          { id_condominio: condominio.id_condominio }
        );
        setSelectedCondominio({ ...condominio, edificios: response.data });
        setSelectedEdificio(null);
        fetchInquilinosByCondominio(condominio.id_condominio);
      } catch (error) {
        console.error("Error al obtener edificios", error);
      }
    }
  };

  const selectEdificio = async (edificio) => {
    if (
      selectedEdificio &&
      selectedEdificio.id_edificio === edificio.id_edificio
    ) {
      setSelectedEdificio(null);
    } else {
      try {
        const response = await axios.post(
          `${REACT_APP_SERVER_URL}/api/getDepartamentosbyEdificios`,
          { id_edificio: edificio.id_edificio }
        );
        setSelectedEdificio({ ...edificio, departamentos: response.data });
        fetchCuotasByEdificio(edificio.id_edificio);
      } catch (error) {
        console.error("Error al obtener departamentos", error);
      }
    }
  };

  const fetchCuotasByEdificio = async (id_edificio) => {
    try {
      const results = await axios.get(
        `${REACT_APP_SERVER_URL}/api/obtenerCuota/${id_edificio}`
      );
      setCuotas(results.data[0]);
      console.log(cuotas);
    } catch (error) {
      console.error("Error al obtener las cuotas", error);
    }
  };

  const fetchInquilinosByCondominio = async (id_condominio) => {
    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getInquilinosByCondominio?id_condominio=${id_condominio}`
      );
      setInquilinos(response.data);
      setPaginaActual(1);
    } catch (error) {
      console.error("Error al obtener inquilinos", error);
    }
  };

  return (
    <div style={{ marginTop: "100px" }}>
      <h1 style={{ color: "#163C40" }}>Información de condominios</h1>
      {condominios.map((condominio, index) => (
        <div key={condominio.id_condominio}>
          <button
            onClick={() => selectCondominio(condominio)}
            className="condominio-btn"
          >
            {condominio.nombre_condominio}
            <span style={{ float: "right" }}>
              {selectedCondominio &&
              selectedCondominio.id_condominio === condominio.id_condominio ? (
                <IoIosArrowUp />
              ) : (
                <IoIosArrowDown />
              )}
            </span>
          </button>
          {selectedCondominio &&
            selectedCondominio.id_condominio === condominio.id_condominio && (
              <div style={{ padding: "10px" }}>
                <p style={{ textAlign: "left" }}>
                  Dirección: {selectedCondominio.direccion_condominio}
                </p>
                <p style={{ textAlign: "left" }}>
                  Número de edificios registrados del condominio:{" "}
                  {selectedCondominio.edificios.length}
                </p>
                <p style={{ textAlign: "left" }}>
                  Administrador a cargo: {selectedCondominio.admin_condominio}
                </p>
                <br />
                <h4>Edificios: </h4>
                <br />
                <ul>
                  {selectedCondominio.edificios.map((edificio) => (
                    <li key={edificio.id_edificio}>
                      <button
                        onClick={() => selectEdificio(edificio)}
                        className="edificio-btn"
                      >
                        {edificio.nombre_edificio}
                        <span style={{ float: "right" }}>
                          {selectedEdificio &&
                          selectedEdificio.id_edificio ===
                            edificio.id_edificio ? (
                            <IoIosArrowUp />
                          ) : (
                            <IoIosArrowDown />
                          )}
                        </span>
                      </button>
                      {selectedEdificio &&
                        selectedEdificio.id_edificio ===
                          edificio.id_edificio && (
                          <div>
                            <p style={{ textAlign: "left" }}>
                              Cuota ordinaria base: ${cuotas.cuota_base}
                            </p>
                            <p style={{ textAlign: "left" }}>
                              Cuota ordinaria por estacionamiento: $
                              {cuotas.cuota_extra}
                            </p>
                            <br />
                            <p style={{ textAlign: "left" }}>
                              Número de departamentos en este edificio:{" "}
                              {selectedEdificio.departamentos.length}
                            </p>
                            <br />

                            <div className="departamentos-lista">
                              <h4>Departamentos: </h4>
                              <br />
                              {selectedEdificio.departamentos.map(
                                (departamento, index, array) => (
                                  <span
                                    key={departamento.id_departamento}
                                    className="departamento-item"
                                  >
                                    {departamento.numero_departamento}
                                    {index < array.length - 1 ? ", " : ""}
                                  </span>
                                )
                              )}
                              <br />
                            </div>
                            <br />
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
                <h4>Inquilinos: </h4>
                <br />
                {inquilinos.length > 0 && (
                  <div>
                    <table>
                      <thead>
                        <tr>
                          <th>Nombre Completo</th>
                          <th>Correo</th>
                          <th>Código</th>
                          <th>Departamento</th>
                          <th>Edificio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquilinosActuales.map((inquilino) => (
                          <tr key={inquilino.id_inquilino}>
                            <td>{`${inquilino.nombre_inquilino} ${inquilino.apellino_paterno_inquilino} ${inquilino.apellino_materno_inquilino}`}</td>
                            <td>{inquilino.correo_inquilino}</td>
                            <td>{inquilino.codigo_inquilino}</td>
                            <td>{inquilino.numero_departamento}</td>
                            <td>{inquilino.nombre_edificio}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {inquilinos.length > registrosPorPagina && (
                      <div className="navegacion-pag">
                        <button
                          onClick={() => cambiarPagina(paginaActual - 1)}
                          disabled={paginaActual === 1}
                          className="btn-pag"
                        >
                          <FaArrowCircleLeft /> Anterior
                        </button>
                        <span className="span-pag">
                          Página {paginaActual} de{" "}
                          {Math.ceil(inquilinos.length / registrosPorPagina)}
                        </span>
                        <button
                          onClick={() => cambiarPagina(paginaActual + 1)}
                          disabled={
                            paginaActual ===
                            Math.ceil(inquilinos.length / registrosPorPagina)
                          }
                          className="btn-pag"
                        >
                          Siguiente <FaArrowCircleRight />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}

export default CondominiosComponent;
