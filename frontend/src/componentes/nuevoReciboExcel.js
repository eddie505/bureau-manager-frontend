/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { IoIosCreate } from "react-icons/io";
import * as XLSX from "xlsx";
import { REACT_APP_SERVER_URL } from "../config.js";

function NuevoReciboExcel() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);

  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [selectedCondominio, setSelectedCondominio] = useState("");
  const [selectedEdificio, setSelectedEdificio] = useState("");
  const [selectedMes, setSelectedMes] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const datosAdeudos = [];
  const datosInfoPagos = [];
  const datosRecibo = [];
  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  useEffect(() => {
    axios
      .get(`${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`)
      .then((response) => {
        setCondominios(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener condominios", error);
      });

    document.body.classList.add("body1");
    return () => {
      document.body.classList.remove("body1");
    };
  }, []);

  useEffect(() => {
    if (selectedCondominio) {
      axios
        .post(`${REACT_APP_SERVER_URL}/api/getEdificiosbyCondominio`, {
          id_condominio: selectedCondominio,
        })
        .then((response) => {
          setEdificios(response.data);
          setSelectedEdificio("");
        })
        .catch((error) => {
          console.error("Error al obtener edificios", error);
        });
    }
  }, [selectedCondominio]);

  const handleCondominioChange = (event) => {
    setSelectedCondominio(event.target.value);
    setError("");
  };

  const handleEdificioChange = (event) => {
    setSelectedEdificio(event.target.value);
    setError("");
  };

  const handleMesChange = (event) => {
    setSelectedMes(event.target.value);
    setError("");
  };

  const handleArchivoChange = (event) => {
    setArchivo(event.target.files[0]);
    setError("");
  };

  function convertirFecha(fechaStr) {
    const partes = fechaStr.split("/");
    const dia = partes[0];
    const mes = partes[1];
    let anio = "20" + partes[2];

    return `${anio}-${mes}-${dia.padStart(2, "0")}`;
  }
  const handleSubmit = async (event) => {
    setCargando(true);
    event.preventDefault();
    if (!selectedCondominio || !selectedEdificio || !selectedMes || !archivo) {
      setError("Todos los campos son obligatorios, incluido el archivo Excel.");
      setCargando(false);
      return;
    }
    try {
      const data = await archivo.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = convertirMesALetra(selectedMes);
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        setError(
          `No se encontró una hoja llamada '${sheetName}' en el archivo.`
        );
        setCargando(false);
        return;
      }
      const rango = XLSX.utils.decode_range(worksheet["!ref"]);
      rango.s.r = 7;
      rango.e.c = 12;
      const datos = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: rango,
      });
      const deptosExcel = [];
      for (let row of datos) {
        if (row[0] === undefined || row[0] === "" || !row[0]) break;
        deptosExcel.push(row[0].toString().trim());
      }

      const response = await axios.post(
        `${REACT_APP_SERVER_URL}/api/getDepartamentosByEdificios`,
        { id_edificio: selectedEdificio }
      );
      const deptosBD = response.data;
      const deptosFaltantesEnExcel = deptosBD.filter(
        (depto) =>
          !deptosExcel
            .map((d) => d.toString())
            .includes(depto.numero_departamento.toString())
      );
      const deptosFaltantes = deptosExcel.filter(
        (depto) =>
          !deptosBD.map((d) => d.numero_departamento.toString()).includes(depto)
      );
      if (deptosFaltantesEnExcel.length > 0) {
        setError(
          `Los siguientes departamentos no están en el archivo Excel: ${deptosFaltantesEnExcel
            .map((depto) => depto.numero_departamento)
            .join(", ")}`
        );
        setCargando(false);
        return;
      }
      if (deptosFaltantes.length > 0) {
        setError(
          `Los siguientes departamentos no están registrados: ${deptosFaltantes.join(
            ", "
          )}`
        );
        setCargando(false);
        return;
      }

      const checkInquilinosPromises = deptosBD.map((depto) =>
        axios.post(`${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`, {
          id_departamento: depto.id_departamento,
        })
      );

      const resultsInquilino = await Promise.all(checkInquilinosPromises);
      const deptosSinInquilinos = resultsInquilino
        .map((result, index) => {
          if (result.data.length === 0)
            return deptosBD[index].numero_departamento;
          return null;
        })
        .filter(Boolean);

      if (deptosSinInquilinos.length > 0) {
        setError(
          `Los siguientes departamentos no tienen inquilinos registrados: ${deptosSinInquilinos.join(
            ", "
          )}`
        );
        setCargando(false);
        return;
      }
      //verificar si el recibo ya existe en la base de datos
      for (let fila of datos) {
        if (!fila[0] || fila[0] === "") break;
        if (fila[10]) {
          let no_recibo = fila[10].toString().trim();
          const response = await axios.get(
            `${REACT_APP_SERVER_URL}/api/verificarRecibo/${selectedCondominio}/${no_recibo}`
          );
          if (response.data.existe) {
            setError(
              `El recibo número ${no_recibo} ya está registrado en la base de datos.`
            );
            setCargando(false);
            return;
          }
        }
      }
      const hoy = new Date().toISOString().split("T")[0];
      for (let fila of datos) {
        // Verifica si la celda de la columna A (index 0) está vacía y detiene el bucle
        if (!fila[0] || fila[0] === "") break;

        if (fila[7] === undefined || fila[7] === "") {
          let numero_departamento = fila[0].toString().trim();
          const deptoEncontrado = deptosBD.find(
            (depto) => depto.numero_departamento === numero_departamento
          );

          if (deptoEncontrado) {
            const responseInquilino = await axios.post(
              `${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`,
              { id_departamento: deptoEncontrado.id_departamento }
            );
            if (responseInquilino.data.length > 0) {
              let id_inquilino_select = responseInquilino.data[0].id_inquilino;
              let adeudo_fila = fila[11];

              if (adeudo_fila) {
                const datosFormulario3 = {
                  id_administrador: id_administrador,
                  id_condominio: selectedCondominio,
                  id_edificio: selectedEdificio,
                  id_inquilino: id_inquilino_select,
                  total_pagado: "0",
                  adeudo: adeudo_fila,
                  fecha_pago: hoy,
                };
                datosAdeudos.push(datosFormulario3);
              }
            } else {
              console.log(
                `No hay inquilinos registrados para el departamento ${numero_departamento}`
              );
            }
          } else {
            console.log(
              `No se encontró el departamento ${numero_departamento} en la base de datos`
            );
          }
        } else if (fila[7] !== undefined && fila[7] !== "") {
          if (fila[8].toString().includes(",")) continue;

          let departamento = fila[0].toString().trim();
          let deptoEncontrado = deptosBD.find(
            (d) => d.numero_departamento === departamento
          );
          if (!deptoEncontrado) continue;

          const inquilinos = await axios
            .post(`${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`, {
              id_departamento: deptoEncontrado.id_departamento,
            })
            .then((res) => res.data);

          if (inquilinos.length === 0) continue;

          let inquilino = inquilinos[0];
          let nombreCompletoInquilino = `${inquilino.nombre_inquilino} ${inquilino.apellino_paterno_inquilino} ${inquilino.apellino_materno_inquilino}`;

          let adeudo = parseFloat(fila[11]);
          /*if(adeudo <= 0){
            adeudo = adeudo.toFixed(1);
          }*/

          let reciboData = {
            id_condominio: selectedCondominio,
            id_edificio: selectedEdificio,
            id_departamento: deptoEncontrado.id_departamento,
            id_inquilino: inquilino.id_inquilino,
            nombre_completo_inquilino: nombreCompletoInquilino,
            no_recibo: fila[10], // Columna K
            fecha: convertirFechaExcel(fila[8]), // Columna I
            fecha_formateada: formatearFecha(convertirFechaExcel(fila[8])), // Columna I
            mes_pago: sheetName,
            concepto_pago: "CUOTAS DE MANTENIMIENTO Y ADMINISTRACIÓN",
            cuota_ordinaria: fila[2].toString(), // Columna C
            cuota_penalizacion: "",
            cuota_extraordinaria: "",
            cuota_reserva: "",
            cuota_adeudos:
              fila[7] !== fila[2] ? (fila[7] - fila[2]).toFixed(1) : "", // Columna H menos Columna C si son diferentes
            total_pagar: fila[7].toString(), // Columna H
            total_pagar_letra: importeEnLetra(parseFloat(fila[7])),
            id_administrador: id_administrador,
          };
          datosRecibo.push(reciboData);

          let info_pagos_form = {
            id_administrador: id_administrador,
            id_condominio: selectedCondominio,
            id_edificio: selectedEdificio,
            id_inquilino: inquilino.id_inquilino,
            no_recibo: fila[10],
            total_pagado: fila[7].toString(),
            adeudo: adeudo <= 0 ? "0" : adeudo.toFixed(1),
            fecha_pago: convertirFechaExcel(fila[8]),
          };
          datosInfoPagos.push(info_pagos_form);
        }
      }
      await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarInfoPagosCompleto`,
        datosAdeudos
      );
      await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarRecibo`,
        datosRecibo
      );
      await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarInfoPagosCompleto`,
        datosInfoPagos
      );

      setError("Proceso completado correctamente.");
      setCargando(false);
    } catch (err) {
      console.error(err);
      setError("Error al procesar el archivo Excel.");
      setCargando(false);
    }
    // Aquí agregarías la lógica para procesar el archivo Excel
  };

  const convertirMesALetra = (fecha) => {
    const meses = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];
    const [año, mes] = fecha.split("-");
    return `${meses[parseInt(mes, 10) - 1]} ${año}`;
  };

  function numeroALetra(numero) {
    const unidades = [
      "",
      "UNO",
      "DOS",
      "TRES",
      "CUATRO",
      "CINCO",
      "SEIS",
      "SIETE",
      "OCHO",
      "NUEVE",
    ];
    const decenas = [
      "",
      "DIEZ",
      "VEINTE",
      "TREINTA",
      "CUARENTA",
      "CINCUENTA",
      "SESENTA",
      "SETENTA",
      "OCHENTA",
      "NOVENTA",
    ];
    const centenas = [
      "",
      "CIEN",
      "DOSCIENTOS",
      "TRESCIENTOS",
      "CUATROCIENTOS",
      "QUINIENTOS",
      "SEISCIENTOS",
      "SETECIENTOS",
      "OCHOCIENTOS",
      "NOVECIENTOS",
    ];
    const miles = [
      "",
      "MIL",
      "DOS MIL",
      "TRES MIL",
      "CUATRO MIL",
      "CINCO MIL",
      "SEIS MIL",
      "SIETE MIL",
      "OCHO MIL",
      "NUEVE MIL",
    ];
    const dmiles = [
      "",
      "DIEZ MIL",
      "VEINTE MIL",
      "TREINTA MIL",
      "CUARENTA MIL",
      "CINCUENTA MIL",
      "SESENTA MIL",
      "SETENTA MIL",
      "OCHENTA MIL",
      "NOVENTA MIL",
    ];

    let letras = "";

    if (numero >= 10000) {
      letras += dmiles[Math.floor(numero / 10000)] + " ";
      numero %= 10000;
    }
    if (numero >= 1000) {
      letras += miles[Math.floor(numero / 1000)] + " ";
      numero %= 1000;
    }
    if (numero >= 100) {
      letras += centenas[Math.floor(numero / 100)] + " ";
      numero %= 100;
    }
    if (numero >= 10) {
      letras += decenas[Math.floor(numero / 10)] + " ";
      numero %= 10;
    }
    if (numero > 0) {
      letras += unidades[numero] + " ";
    }

    return letras.trim() + " PESOS";
  }

  function importeEnLetra(total) {
    const entero = Math.floor(total);
    let decimal = Math.round((total - entero) * 100);
    if (decimal === 0) {
      decimal = "00";
    }
    return `${numeroALetra(entero)} ${decimal}/100 M.N.`;
  }

  function convertirFechaExcel(serial) {
    if (isNaN(serial) || serial === "") return null;

    const fechaBase = new Date(1900, 0, 1);
    const milisegundosPorDia = 24 * 60 * 60 * 1000;

    const diasAjustados = serial - 2;

    const fechaReal = new Date(
      fechaBase.getTime() + diasAjustados * milisegundosPorDia
    );

    const fechaISO = fechaReal.toISOString().split("T")[0];

    return fechaISO;
  }

  const mesesAbreviados = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const isoString = fecha.toISOString();
    const [year, month, day] = isoString.split("T")[0].split("-");
    const mes = mesesAbreviados[parseInt(month) - 1];
    const anio = year.slice(2);
    return `${day}-${mes}-${anio}`;
  };

  return (
    <div className="div-contenedor div-espaciado">
      <h1>Crear recibos a partir de Excel</h1>
      <Link to="/NuevoRecibo">
        <button type="button" className="mi-boton2" style={{ width: "260px" }}>
          <IoIosCreate /> Generar recibos manualmente
        </button>
      </Link>
      <form className="fromInquilino" onSubmit={handleSubmit}>
        <div className="select-container">
          <div className="select-item">
            <label>Seleccione un condominio:</label>
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
          <div className="select-item">
            <label>Seleccione un edificio:</label>
            <select
              onChange={handleEdificioChange}
              value={selectedEdificio}
              disabled={!selectedCondominio}
            >
              <option value="">Seleccione un edificio</option>
              {edificios.map((edificio) => (
                <option key={edificio.id_edificio} value={edificio.id_edificio}>
                  {edificio.nombre_edificio}
                </option>
              ))}
            </select>
          </div>
          <div className="select-item">
            <label>Mes en el que se hicieron los pagos:</label>
            <input
              type="month"
              onChange={handleMesChange}
              value={selectedMes}
            />
          </div>
        </div>
        <div className="select-container">
          <div className="select-item">
            <label>Seleccione un archivo Excel:</label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleArchivoChange}
              disabled={
                !selectedCondominio || !selectedEdificio || !selectedMes
              }
            />
          </div>
        </div>
        <div className="error-message">{error}</div>
        {cargando && <div className="loading-indicator">Cargando...</div>}
        <div className="botones-container">
          <button className="mi-boton2" type="submit">
            Generar recibos
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoReciboExcel;
