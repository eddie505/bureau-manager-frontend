/* eslint-disable */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaFilter,
} from "react-icons/fa";
import { REACT_APP_SERVER_URL } from "../config.js";

function InfoPagos() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);

  const [datosPagos, setDatosPagos] = useState([]);
  const [datosPagosTotal, setDatosPagosTotal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10);

  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);

  const [filtroCondominio, setFiltroCondominio] = useState("");
  const [filtroEdificio, setFiltroEdificio] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [condominiosAdeudos, setCondominiosAdeudos] = useState({});
  const [condominioMayorAdeudo, setCondominioMayorAdeudo] = useState({
    nombre: "",
    adeudo: 0,
  });
  const [totalAdeudos, setTotalAdeudos] = useState(0);
  const [condominioMenorAdeudo, setCondominioMenorAdeudo] = useState({
    nombre: "",
    adeudo: 0,
  });
  const fechaActual = new Date();
  const mesAnterior = new Date(
    fechaActual.getFullYear(),
    fechaActual.getMonth() - 1,
    1
  );

  const anioMesAnterior = mesAnterior.getFullYear();
  const mesAnteriorNumero = mesAnterior.getMonth() + 1;

  useEffect(() => {
    document.body.classList.add("body1");
    cargarCondominios();
    return () => {
      document.body.classList.remove("body1");
    };
  }, [id_administrador]);

  useEffect(() => {
    if (filtroCondominio) {
      cargarEdificios(filtroCondominio);
      setFiltroEdificio("");
    }
  }, [filtroCondominio]);

  useEffect(() => {
    filtrarDatos();
  }, [filtroCondominio, filtroEdificio, filtroFecha]);

  const cargarCondominios = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`
      );
      setCondominios(response.data);
    } catch (error) {
      console.error("Error al cargar condominios:", error);
    }
  };

  const cargarEdificios = async (idCondominio) => {
    try {
      const response = await axios.post(
        `${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`,
        { id_condominio: idCondominio }
      );
      setEdificios(response.data);
    } catch (error) {
      console.error("Error al cargar edificios:", error);
    }
  };

  const filtrarDatos = async () => {
    setLoading(true);
    let params = {
      condominio: filtroCondominio || null,
      edificio: filtroEdificio || null,
    };
    if (filtroFecha) {
      const [anio, mes] = filtroFecha.split("-");
      params.anio = anio;
      params.mes = mes;
    }

    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getInfoPagosFiltrados/${id_administrador}`,
        { params }
      );
      const pagos = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getInfoPagos/${id_administrador}`
      );
      setDatosPagos(response.data);
      setDatosPagosTotal(pagos.data);
      setPaginaActual(1);
    } catch (error) {
      setError("Error al filtrar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datosPagosTotal.length) {
      calcularAdeudosCondominios();
    }
  }, [datosPagosTotal]);

  const calcularAdeudosCondominios = () => {
    const fechaActual = new Date();
    const mesAnterior = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() - 1,
      1
    );
    const anioMesAnterior = mesAnterior.getFullYear();
    const mesAnteriorFormato = mesAnterior.getMonth() + 1;
    const adeudos = {};
    let total = 0;
    datosPagosTotal.forEach((pago) => {
      const [anio, mes] = pago.fecha_pago.split("-");
      if (
        parseInt(anio) === anioMesAnterior &&
        parseInt(mes) === mesAnteriorFormato
      ) {
        const adeudo = parseFloat(pago.adeudo);
        adeudos[pago.nombre_condominio] =
          (adeudos[pago.nombre_condominio] || 0) + parseFloat(pago.adeudo);
        total += adeudo;
      }
    });
    setCondominiosAdeudos(adeudos);
    setTotalAdeudos(total);
    encontrarMayorAdeudo(adeudos);
    encontrarMenorAdeudo(adeudos);
  };

  const encontrarMayorAdeudo = (adeudos) => {
    let maxAdeudo = { nombre: "", adeudo: 0 };
    Object.keys(adeudos).forEach((key) => {
      if (adeudos[key] > maxAdeudo.adeudo) {
        maxAdeudo = { nombre: key, adeudo: adeudos[key] };
      }
    });
    setCondominioMayorAdeudo(maxAdeudo);
  };

  const encontrarMenorAdeudo = (adeudos) => {
    let minAdeudo = { nombre: "", adeudo: Infinity };
    Object.keys(adeudos).forEach((key) => {
      if (adeudos[key] < minAdeudo.adeudo) {
        minAdeudo = { nombre: key, adeudo: adeudos[key] };
      }
    });
    if (minAdeudo.adeudo === Infinity) {
      minAdeudo.adeudo = 0;
    }
    setCondominioMenorAdeudo(minAdeudo);
  };

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>Error al cargar los datos: {error}</p>;

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const datosActuales = datosPagos.slice(primerRegistro, ultimoRegistro);

  const paginaSiguiente = () => {
    if (paginaActual < Math.ceil(datosPagos.length / registrosPorPagina)) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  return (
    <div
      className="div-contenedor div-espaciado"
      style={{ marginTop: "150px" }}
    >
      <h1>Información de Pagos</h1>
      <div className="container">
        <div className="main-content">
          <form className="fromRecibo">
            <button
              type="button"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="icono-filtro"
            >
              <FaFilter />
            </button>
            <div
              className={`filtros-contenedor ${
                mostrarFiltros ? "mostrar" : ""
              }`}
            >
              <select
                value={filtroCondominio}
                onChange={(e) => setFiltroCondominio(e.target.value)}
                className="select-filtro-recibos"
              >
                <option value="">Todos los condominios</option>
                {condominios.map((condominio) => (
                  <option
                    key={condominio.id_condominio}
                    value={condominio.id_condominio}
                  >
                    {condominio.nombre_condominio}
                  </option>
                ))}
              </select>
              <select
                value={filtroEdificio}
                onChange={(e) => setFiltroEdificio(e.target.value)}
                className="select-filtro-recibos"
              >
                <option value="">Todos los edificios</option>
                {edificios.map((edificio) => (
                  <option
                    key={edificio.id_edificio}
                    value={edificio.id_edificio}
                  >
                    {edificio.nombre_edificio}
                  </option>
                ))}
              </select>
              <input
                type="month"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="filtro-fecha"
              />
            </div>
            <table>
              <thead>
                <tr>
                  <th>Condominio</th>
                  <th>Edificio</th>
                  <th>Departamento</th>
                  <th>Total Pagado</th>
                  <th>Adeudo</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {datosActuales.length > 0 ? (
                  datosActuales.map((pago, index) => (
                    <tr key={index}>
                      <td>{pago.nombre_condominio}</td>
                      <td>{pago.nombre_edificio}</td>
                      <td>{pago.numero_departamento}</td>
                      <td>{pago.total_pagado}</td>
                      <td
                        style={{
                          color: parseFloat(pago.adeudo) > 0 ? "red" : "green",
                        }}
                      >
                        {pago.adeudo}
                      </td>
                      <td>{pago.fecha_pago}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No hay registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="navegacion-pag">
              <button
                onClick={paginaAnterior}
                disabled={paginaActual === 1}
                className="btn-pag"
                type="button"
              >
                <FaArrowCircleLeft /> Anterior
              </button>
              <span>
                Página {paginaActual} de{" "}
                {Math.ceil(datosPagos.length / registrosPorPagina)}
              </span>
              <button
                onClick={paginaSiguiente}
                disabled={
                  paginaActual ===
                  Math.ceil(datosPagos.length / registrosPorPagina)
                }
                className="btn-pag"
                type="button"
              >
                Siguiente <FaArrowCircleRight />
              </button>
            </div>
          </form>
        </div>
        <div className="side-content">
          <div className="condominio-adeudo div_alineados side-div">
            <h3>
              Condominio con más adeudos del mes {mesAnteriorNumero}/
              {anioMesAnterior}
            </h3>
            <br />
            <p>
              {condominioMayorAdeudo.nombre}: $
              {condominioMayorAdeudo.adeudo.toFixed(2)}
            </p>
          </div>
          <div className="condominio-adeudo div_alineados side-div">
            <h3>
              Condominio con menos adeudos del mes {mesAnteriorNumero}/
              {anioMesAnterior}
            </h3>
            <br />
            <p>
              {condominioMenorAdeudo.nombre}: $
              {condominioMenorAdeudo.adeudo.toFixed(2)}
            </p>
          </div>
          <div
            className="condominio-adeudo side-div"
            style={{ clear: "both", float: "left" }}
          >
            <h3>
              Total adeudos del mes {mesAnteriorNumero}/{anioMesAnterior}
            </h3>
            <br />
            <p>${totalAdeudos.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoPagos;
