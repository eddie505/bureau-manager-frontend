/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaFilter,
  FaTrash,
} from "react-icons/fa";
import { REACT_APP_SERVER_URL } from "../config.js";

function VerRecibo() {
  const [visible, setVisible] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [recibosSeleccionados, setRecibosSeleccionados] = useState([]);

  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeAdvertencia, setMensajeAdvertencia] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina] = useState(10);

  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  const [filtroCondominio, setFiltroCondominio] = useState("");
  const [filtroEdificio, setFiltroEdificio] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    document.body.classList.add("body2");

    return () => {
      document.body.classList.remove("body2");
    };
  }, []);

  useEffect(() => {
    cargarCondominios();
    cargarRecibos();
  }, []);

  useEffect(() => {
    if (filtroCondominio) {
      cargarEdificios(filtroCondominio);
    }
  }, [filtroCondominio]);

  useEffect(() => {
    if (filtroEdificio) {
      cargarDepartamentos(filtroEdificio);
    }
  }, [filtroEdificio]);

  useEffect(() => {
    const recibosSinCorreo = recibosSeleccionados.some((idRecibo) => {
      const recibo = registros.find((r) => r.id_recibo === idRecibo);
      return !recibo?.tiene_correo;
    });

    if (recibosSinCorreo) {
      setMensajeAdvertencia(
        "Algunos recibos seleccionados pertenecen a inquilinos sin correo electrónico."
      );
    } else {
      setMensajeAdvertencia("");
    }
  }, [recibosSeleccionados, registros]);

  const cargarCondominios = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("authData"));
      const id_administrador = parseInt(authData?.id);
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
      setFiltroEdificio("");
    } catch (error) {
      console.error("Error al cargar edificios:", error);
    }
  };

  const cargarDepartamentos = async (idEdificio) => {
    try {
      const response = await axios.post(
        `${REACT_APP_SERVER_URL}/api/getDepartamentosbyEdificios`,
        { id_edificio: idEdificio }
      );
      setDepartamentos(response.data);
      setFiltroDepartamento("");
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
    }
  };

  const cargarRecibos = async () => {
    const authData = JSON.parse(localStorage.getItem("authData"));
    const id_administrador = parseInt(authData?.id);
    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getRecibos/${id_administrador}`
      );
      colocarRecibos(response);
    } catch (error) {
      console.error("Error al cargar recibos:", error);
    }
  };

  const colocarRecibos = (response) => {
    setRegistros(response.data);
    setPaginaActual(1);
  };

  const handleChangeCondominio = async (e) => {
    const idCondominio = e.target.value;
    setFiltroCondominio(idCondominio);

    setFiltroEdificio("");
    setFiltroDepartamento("");
    cargarEdificios(idCondominio);
  };

  const handleChangeEdificio = async (e) => {
    const idEdificio = e.target.value;
    setFiltroEdificio(idEdificio);

    setFiltroDepartamento("");
    cargarDepartamentos(idEdificio);
  };

  const handleChangeDepartamento = (e) => {
    const idDepartamento = e.target.value;
    setFiltroDepartamento(idDepartamento);
  };

  const ultimoRegistro = paginaActual * registrosPorPagina;
  const primerRegistro = ultimoRegistro - registrosPorPagina;
  const registrosActuales = registros.slice(primerRegistro, ultimoRegistro);

  const paginaSiguiente = () => setPaginaActual(paginaActual + 1);
  const paginaAnterior = () => setPaginaActual(paginaActual - 1);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submitButton = event.nativeEvent.submitter;
    const buttonValue = submitButton.getAttribute("value");
    if (buttonValue === "correo") {
      try {
        const resultado = await axios.post(
          `${REACT_APP_SERVER_URL}/api/enviarRecibosCorreoElectronico`,
          recibosSeleccionados
        );
        if (resultado.data === 200) {
          setVisible(true);
          setMensajeExito("Recibos enviados correctamente");
          setRecibosSeleccionados([]);
        } else {
          alert(resultado.data);
        }
      } catch (error) {
        console.error(error);
        alert("Error al rcrear correos");
      }
    } else {
      try {
        const response = await axios.post(
          `${REACT_APP_SERVER_URL}/api/generarPDFMasivo`,
          recibosSeleccionados,
          {
            responseType: "blob",
          }
        );

        const fileURL = window.URL.createObjectURL(response.data);

        const link = document.createElement("a");
        link.href = fileURL;
        link.download = "archivo.pdf";
        link.click();

        setVisible(true);
        setRecibosSeleccionados([]);
      } catch (error) {
        console.error(error);
        alert("Error al crear el PDF");
      }
    }
  };

  const handleFiltrar = async () => {
    const authData = JSON.parse(localStorage.getItem("authData"));
    const id_administrador = parseInt(authData?.id);

    let mes = "";
    let anio = "";
    if (filtroFecha) {
      const parts = filtroFecha.split("-");
      anio = parts[0];
      mes = parseInt(parts[1], 10);
    }
    console.log(mes + anio);

    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/getRecibosFiltrados/${id_administrador}`,
        {
          params: {
            condominio: filtroCondominio || null,
            edificio: filtroEdificio || null,
            departamento: filtroDepartamento || null,
            mes,
            anio,
          },
        }
      );
      console.log(response.data);
      colocarRecibos(response);
    } catch (error) {
      console.error("Error al filtrar recibos:", error);
    }
  };

  const handleCheckboxChange = (reciboId) => {
    if (recibosSeleccionados.includes(reciboId)) {
      setRecibosSeleccionados((prevState) =>
        prevState.filter((id) => id !== reciboId)
      );
    } else {
      setRecibosSeleccionados((prevState) => [...prevState, reciboId]);
    }
  };

  const handleSeleccionarTodos = (e) => {
    if (e.target.checked) {
      const idsRecibos = registrosActuales.map((recibo) => recibo.id_recibo);
      setRecibosSeleccionados(idsRecibos);
    } else {
      const newRecibosSeleccionados = recibosSeleccionados.filter(
        (id) => !registrosActuales.some((recibo) => recibo.id_recibo === id)
      );
      setRecibosSeleccionados(newRecibosSeleccionados);
    }
  };

  const handleEliminarRecibos = async () => {
    if (recibosSeleccionados.length === 0) {
      alert("No hay recibos seleccionados para eliminar");
      return;
    }

    if (
      window.confirm(
        "¿Estás seguro de querer eliminar los recibos seleccionados?"
      )
    ) {
      try {
        await axios.post(`${REACT_APP_SERVER_URL}/api/eliminarRecibos`, {
          ids: recibosSeleccionados,
        });
        alert("Recibos eliminados correctamente");
        setRecibosSeleccionados([]);
        cargarRecibos();
      } catch (error) {
        console.error("Error al eliminar recibos:", error);
        alert("Error al eliminar recibos");
      }
    }
  };

  let opcionesRegistro =
    registrosActuales.length === 0 ? (
      <tr>
        <td colSpan="6">No hay registros disponibles</td>
      </tr>
    ) : (
      registrosActuales.map((c) => (
        <tr key={c.id_recibo}>
          <td>{c.nombre_completo_inquilino}</td>
          <td>{c.fecha}</td>
          <td>{c.no_recibo}</td>
          <td>{c.concepto_pago}</td>
          <td>{c.total_pagar}</td>
          <td>
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange(c.id_recibo)}
              checked={recibosSeleccionados.includes(c.id_recibo)}
            />
          </td>
        </tr>
      ))
    );
  return (
    <div
      className="div-contenedor div-espaciado"
      style={{ marginTop: "150px" }}
    >
      <h1>Descargar y enviar recibos</h1>
      <form className="fromRecibo" onSubmit={handleSubmit}>
        <h2>Seleccione los Recibos a enviar</h2>
        <button
          type="button"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="icono-filtro"
        >
          <FaFilter />
        </button>
        <div
          className={`filtros-contenedor ${mostrarFiltros ? "mostrar" : ""}`}
        >
          <select
            value={filtroCondominio}
            onChange={handleChangeCondominio}
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
            onChange={handleChangeEdificio}
            className="select-filtro-recibos"
          >
            <option value="">Todos los edificios</option>
            {edificios.map((edificio) => (
              <option key={edificio.id_edificio} value={edificio.id_edificio}>
                {edificio.nombre_edificio}
              </option>
            ))}
          </select>
          <select
            value={filtroDepartamento}
            onChange={handleChangeDepartamento}
            className="select-filtro-recibos"
          >
            <option value="">Todos los departamentos</option>
            {departamentos.map((departamento) => (
              <option
                key={departamento.id_departamento}
                value={departamento.id_departamento}
              >
                {departamento.numero_departamento}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            style={{ marginTop: "10px" }}
          />
          <div style={{ textAlign: "right" }}>
            <button type="button" onClick={handleFiltrar} className="btn-pag">
              Filtrar
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Inquilino</th>
              <th>Fecha</th>
              <th>No. de Recibo</th>
              <th>Concepto de Pago</th>
              <th>Total de Pago</th>
              <th>
                Seleccionar todos:
                <br />
                <input
                  type="checkbox"
                  onChange={handleSeleccionarTodos}
                  checked={
                    registrosActuales.length > 0 &&
                    registrosActuales.every((recibo) =>
                      recibosSeleccionados.includes(recibo.id_recibo)
                    )
                  }
                />
              </th>
            </tr>
          </thead>
          <tbody>{opcionesRegistro}</tbody>
        </table>
        <div
          className="Aceptado"
          style={{ display: visible ? "block" : "none" }}
        >
          Recibo descargado
        </div>
        <div
          className="mensajeExito"
          style={{ display: visible ? "block" : "none" }}
        >
          {mensajeExito}
        </div>
        <br />
        <div className="select-container">
          <div className="botones-container">
            <button
              className="mi-boton2"
              type="submit"
              value="correo"
              disabled={
                recibosSeleccionados.length === 0 ||
                recibosSeleccionados.some(
                  (idRecibo) =>
                    !registros.find(
                      (registro) => registro.id_recibo === idRecibo
                    )?.tiene_correo
                )
              }
            >
              Enviar por Correo
            </button>
            <button
              className="mi-boton2"
              type="submit"
              value="PDF"
              disabled={recibosSeleccionados.length === 0}
            >
              Hacer PDF de Recibos
            </button>
            <button
              onClick={handleEliminarRecibos}
              type="button"
              className="mi-boton2"
              disabled={recibosSeleccionados.length === 0}
            >
              <FaTrash /> Eliminar Recibos
            </button>
          </div>
        </div>
        <div className="mensaje-advertencia">{mensajeAdvertencia}</div>
        <div className="navegacion-pag">
          <button
            onClick={paginaAnterior}
            disabled={paginaActual === 1}
            className="btn-pag"
            type="button"
          >
            <FaArrowCircleLeft /> Anterior
          </button>
          <span className="span-pag">
            Página {paginaActual} de{" "}
            {Math.ceil(registros.length / registrosPorPagina)}
          </span>
          <button
            onClick={paginaSiguiente}
            disabled={
              paginaActual === Math.ceil(registros.length / registrosPorPagina)
            }
            className="btn-pag"
            type="button"
          >
            Siguiente <FaArrowCircleRight />
          </button>
        </div>
      </form>
    </div>
  );
}
export default VerRecibo;
