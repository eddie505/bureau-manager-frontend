/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import { REACT_APP_SERVER_URL } from "../config.js";

function CondominiosComponent() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);

  const [condominios, setCondominios] = useState([]);
  const [selectedCondominio, setSelectedCondominio] = useState(null);
  const [selectedEdificio, setSelectedEdificio] = useState(null);
  const [inquilinos, setInquilinos] = useState([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10);

  useEffect(() => {
    fetchCondominios();
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
      } catch (error) {
        console.error("Error al obtener departamentos", error);
      }
    }
  };

  const fetchInquilinosByCondominio = async (id_condominio) => {
    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getInquilinosByCondominio?id_condominio=${id_condominio}`
      );
      setInquilinos(response.data);
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
                      {inquilinos.map((inquilino) => (
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
                )}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}

export default CondominiosComponent;
