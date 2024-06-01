/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import e from "connect-flash";
import { SiMicrosoftexcel } from "react-icons/si";
import { REACT_APP_SERVER_URL } from "../config.js";

function NuevoRecibo() {
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);

  const [formulario, setFormulario] = useState({
    id_condominio: "",
    id_edificio: "",
    id_departamento: "",
    id_inquilino: "",
    nombre_completo_inquilino: "",
    no_recibo: "",
    fecha: "",
    fecha_formateada: "",
    mes_pago: "",
    concepto_pago: "CUOTAS DE MANTENIMIENTO Y ADMINISTRACIÓN",
    cuota_ordinaria: "",
    cuota_penalizacion: "",
    cuota_extraordinaria: "",
    cuota_reserva: "",
    cuota_adeudos: "",
    total_pagar: "",
    total_pagar_letra: "",
    id_administrador: id_administrador,
  });
  const [formulario2, setFormulario2] = useState({
    id_administrador: id_administrador,
    id_condominio: "",
    id_edificio: "",
    id_inquilino: "",
    no_recibo: "",
    total_pagado: "",
    adeudo: "0",
    fecha_pago: "",
  });

  const [visible, setVisible] = useState(false);
  const [departamentos, setDepartamentos] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [edificios, setEdificios] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);

  const [errores, setErrores] = useState({});

  const [errorNumero, setErrorNumero] = useState("");

  const [siguienteNumeroRecibo, setSiguienteNumeroRecibo] = useState(null);

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
    const authData = JSON.parse(localStorage.getItem("authData"));
    const id_administrador = parseInt(authData?.id);
    axios
      .get(`${REACT_APP_SERVER_URL}/api/getCondominios/${id_administrador}`)
      .then((response) => {
        if (response.data.length === 0) {
          setEdificios([]);
          setDepartamentos([]);
          setCondominios([]);
          setInquilinos([]);
          setFormulario((prevState) => ({
            ...prevState,
            id_condominio: 0,
            nombre_completo_inquilino: "",
          }));
          setFormulario2((prevState) => ({
            ...prevState,
            id_condominio: 0,
          }));
        } else {
          setCondominios(response.data);
          setFormulario((prevState) => ({
            ...prevState,
            id_condominio: response.data[0].id_condominio,
          }));
          setFormulario2((prevState) => ({
            ...prevState,
            id_condominio: response.data[0].id_condominio,
          }));
          obtenerUltimoNumeroRecibo(response.data[0].id_condominio);

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
                setInquilinos([]);
                setFormulario((prevState) => ({
                  ...prevState,
                  id_edificio: 0,
                  nombre_completo_inquilino: "",
                }));
                setFormulario2((prevState) => ({
                  ...prevState,
                  id_edificio: 0,
                }));
              } else {
                setEdificios(resultado.data);
                setFormulario((prevState) => ({
                  ...prevState,
                  id_edificio: resultado.data[0].id_edificio,
                }));
                setFormulario2((prevState) => ({
                  ...prevState,
                  id_edificio: resultado.data[0].id_edificio,
                }));

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
                      setInquilinos([]);
                      setFormulario((prevState) => ({
                        ...prevState,
                        id_departamento: 0,
                        nombre_completo_inquilino: "",
                      }));
                    } else {
                      setDepartamentos(resultado.data);
                      setFormulario((prevState) => ({
                        ...prevState,
                        id_departamento: resultado.data[0].id_departamento,
                      }));

                      const selectedInquilino =
                        resultado.data[0].id_departamento;
                      const diccionario3 = {};
                      diccionario3["id_departamento"] =
                        parseInt(selectedInquilino);

                      axios
                        .post(
                          `${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`,
                          diccionario3
                        )
                        .then((resultado) => {
                          if (resultado.data.length === 0) {
                            setInquilinos([]);
                            setFormulario((prevState) => ({
                              ...prevState,
                              id_inquilino: 0,
                              nombre_completo_inquilino: "",
                            }));
                            setFormulario2((prevState) => ({
                              ...prevState,
                              id_inquilino: 0,
                            }));
                          } else {
                            setInquilinos(resultado.data);
                            setFormulario((prevState) => ({
                              ...prevState,
                              id_inquilino: resultado.data[0].id_inquilino,
                              nombre_completo_inquilino:
                                resultado.data[0].nombre_inquilino +
                                " " +
                                resultado.data[0].apellino_paterno_inquilino +
                                " " +
                                resultado.data[0].apellino_materno_inquilino,
                            }));
                            setFormulario2((prevState) => ({
                              ...prevState,
                              id_inquilino: resultado.data[0].id_inquilino,
                            }));
                          }
                        })
                        .catch((error) => {
                          console.error(error);
                          alert("Error al obtener los inquilinos");
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
    document.body.classList.add("body1");

    return () => {
      document.body.classList.remove("body1");
    };
  }, []);

  const obtenerUltimoNumeroRecibo = async (id_condominio) => {
    try {
      const response = await axios.get(
        `${REACT_APP_SERVER_URL}/api/obtenerUltimoNumeroRecibo/${id_condominio}`
      );
      if (response.data.ultimoNumeroRecibo === null) {
        setSiguienteNumeroRecibo(1);
      } else {
        setSiguienteNumeroRecibo(
          parseInt(response.data.ultimoNumeroRecibo) + 1
        );
      }
    } catch (error) {
      console.error("Error al obtener el último número de recibo:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormulario((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleChange2 = (event) => {
    const { name, value } = event.target;
    setFormulario2((prevState) => ({ ...prevState, [name]: value }));
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
            setInquilinos([]);
            setFormulario((prevState) => ({
              ...prevState,
              id_edificio: 0,
              nombre_completo_inquilino: "",
            }));
            setFormulario2((prevState) => ({
              ...prevState,
              id_edificio: 0,
            }));
          } else {
            setEdificios(resultado.data);
            setFormulario((prevState) => ({
              ...prevState,
              id_edificio: resultado.data[0].id_edificio,
            }));
            setFormulario2((prevState) => ({
              ...prevState,
              id_edificio: resultado.data[0].id_edificio,
            }));
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
                  setInquilinos([]);
                  setFormulario((prevState) => ({
                    ...prevState,
                    id_departamento: 0,
                    nombre_completo_inquilino: "",
                  }));
                } else {
                  setDepartamentos(resultado.data);
                  setFormulario((prevState) => ({
                    ...prevState,
                    id_departamento: resultado.data[0].id_departamento,
                  }));
                  const selectedInquilino = resultado.data[0].id_departamento;
                  const diccionario3 = {};
                  diccionario3["id_departamento"] = parseInt(selectedInquilino);

                  axios
                    .post(
                      `${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`,
                      diccionario3
                    )
                    .then((resultado) => {
                      if (resultado.data.length === 0) {
                        setInquilinos([]);
                        setFormulario((prevState) => ({
                          ...prevState,
                          id_inquilino: 0,
                          nombre_completo_inquilino: "",
                        }));
                        setFormulario2((prevState) => ({
                          ...prevState,
                          id_inquilino: 0,
                        }));
                      } else {
                        setInquilinos(resultado.data);
                        setFormulario((prevState) => ({
                          ...prevState,
                          id_inquilino: resultado.data[0].id_inquilino,
                          nombre_completo_inquilino:
                            resultado.data[0].nombre_inquilino +
                            " " +
                            resultado.data[0].apellino_paterno_inquilino +
                            " " +
                            resultado.data[0].apellino_materno_inquilino,
                        }));
                        setFormulario2((prevState) => ({
                          ...prevState,
                          id_inquilino: resultado.data[0].id_inquilino,
                        }));
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                      alert("Error al obtener los inquilinos");
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
      setFormulario2((prevState) => ({
        ...prevState,
        id_condominio: selectedCondominio.id_condominio,
      }));
      obtenerUltimoNumeroRecibo(selectedCondominio.id_condominio);
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
            setInquilinos([]);
            setFormulario((prevState) => ({
              ...prevState,
              id_departamento: 0,
              nombre_completo_inquilino: "",
            }));
          } else {
            setDepartamentos(resultado.data);
            setFormulario((prevState) => ({
              ...prevState,
              id_departamento: resultado.data[0].id_departamento,
            }));
            const selectedInquilino = resultado.data[0].id_departamento;
            const diccionario3 = {};
            diccionario3["id_departamento"] = parseInt(selectedInquilino);

            axios
              .post(
                `${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`,
                diccionario3
              )
              .then((resultado) => {
                if (resultado.data.length === 0) {
                  setInquilinos([]);
                  setFormulario((prevState) => ({
                    ...prevState,
                    id_inquilino: 0,
                    nombre_completo_inquilino: "",
                  }));
                  setFormulario2((prevState) => ({
                    ...prevState,
                    id_inquilino: 0,
                  }));
                } else {
                  setInquilinos(resultado.data);
                  setFormulario((prevState) => ({
                    ...prevState,
                    id_inquilino: resultado.data[0].id_inquilino,
                    nombre_completo_inquilino:
                      resultado.data[0].nombre_inquilino +
                      " " +
                      resultado.data[0].apellino_paterno_inquilino +
                      " " +
                      resultado.data[0].apellino_materno_inquilino,
                  }));
                  setFormulario2((prevState) => ({
                    ...prevState,
                    id_inquilino: resultado.data[0].id_inquilino,
                  }));
                }
              })
              .catch((error) => {
                console.error(error);
                alert("Error al obtener los inquilinos");
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
      setFormulario2((prevState) => ({
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
      const diccionario = {};
      diccionario["id_departamento"] = selectedDepartamento.id_departamento;

      axios
        .post(
          `${REACT_APP_SERVER_URL}/api/getInquilinosbyDepartamento`,
          diccionario
        )
        .then((resultado) => {
          if (resultado.data.length === 0) {
            setInquilinos([]);
            setFormulario((prevState) => ({
              ...prevState,
              id_inquilino: 0,
              nombre_completo_inquilino: "",
            }));
            setFormulario2((prevState) => ({
              ...prevState,
              id_inquilino: 0,
            }));
          } else {
            setInquilinos(resultado.data);
            setFormulario((prevState) => ({
              ...prevState,
              id_inquilino: resultado.data[0].id_inquilino,
              nombre_completo_inquilino:
                resultado.data[0].nombre_inquilino +
                " " +
                resultado.data[0].apellino_paterno_inquilino +
                " " +
                resultado.data[0].apellino_materno_inquilino,
            }));
            setFormulario2((prevState) => ({
              ...prevState,
              id_inquilino: resultado.data[0].id_inquilino,
            }));
          }
        })
        .catch((error) => {
          console.error(error);
          alert("Error al obtener los inquilinos");
        });
    }
  };

  const handleChangeSelectInquilino = (event) => {
    const elegido = parseInt(event.target.value);
    const selectedInquilino = inquilinos.find(
      (c) => c.id_inquilino === elegido
    );

    if (selectedInquilino) {
      setFormulario((prevState) => ({
        ...prevState,
        id_departamento: selectedInquilino.id_inquilino,
        nombre_completo_inquilino:
          selectedInquilino.nombre_inquilino +
          " " +
          selectedInquilino.apellino_paterno_inquilino +
          " " +
          selectedInquilino.apellino_materno_inquilino,
      }));
      setFormulario2((prevState) => ({
        ...prevState,
        id_inquilino: selectedInquilino.id_inquilino,
      }));
    }
  };

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

  const handleChangeFecha = (event) => {
    const { value } = event.target;
    const fecha = new Date(value);
    const mesPago = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    setFormulario((prevState) => ({
      ...prevState,
      fecha: value,
      mes_pago: mesPago,
    }));
    setFormulario2((prevState) => ({ ...prevState, fecha_pago: value }));
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

  const fechaActual = new Date();
  fechaActual.setDate(fechaActual.getDate() - 60);
  const minDate = fechaActual.toISOString().split("T")[0];
  const maxDate = new Date().toISOString().split("T")[0];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validarCampos()) {
      console.log("Hay errores en la validación");
      return;
    }

    try {
      const respuesta = await axios.get(
        `${REACT_APP_SERVER_URL}/api/verificarRecibo/${formulario.id_condominio}/${formulario.no_recibo}`
      );
      if (respuesta.data.existe) {
        setErrorNumero(
          "Ya existe un recibo con ese número de folio en el condominio seleccionado"
        );
        return;
      }
      let ddd = 0;
      ddd =
        (parseFloat(formulario.cuota_ordinaria) || 0) +
        (parseFloat(formulario.cuota_penalizacion) || 0) +
        (parseFloat(formulario.cuota_extraordinaria) || 0) +
        (parseFloat(formulario.cuota_reserva) || 0) +
        (parseFloat(formulario.cuota_adeudos) || 0);

      formulario.total_pagar = ddd.toString();
      formulario2.total_pagado = ddd.toString();
      formulario.total_pagar_letra = importeEnLetra(ddd);
      formulario.fecha_formateada = formatearFecha(formulario.fecha);
      formulario2.no_recibo = formulario.no_recibo;
      const datosRecibo = [formulario];
      const datosInfoPagos = [formulario2];
      const resultado = await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarRecibo`,
        datosRecibo
      );
      const resultado2 = await axios.post(
        `${REACT_APP_SERVER_URL}/api/registrarInfoPagosCompleto`,
        datosInfoPagos
      );
      if (resultado.data === 200) {
        setVisible(true);
        //setFormulario(prevState => ({
        //  ...prevState,
        //  no_recibo: '',
        //  fecha: '',
        //  concepto_pago: '',
        //  cuota_ordinaria: '',
        //  concepto_cuota_ordinaria: '',
        //  cuota_penalizacion: '',
        //  concepto_cuota_penalizacion: '',
        //  cuota_extraordinaria: '',
        //  concepto_cuota_extraordinaria: '',
        //  cuota_reserva: '',
        //  concepto_cuota_reserva: '',
        //  cuota_adeudos: '',
        //  concepto_cuota_adeudos: '',
        //  total_pagar: '',
        //}));
      } else {
        alert(resultado.data);
      }
    } catch (error) {
      console.error(error);
      alert("Error al registrar el Recibo");
    }
  };

  function esNumero(dato) {
    return /^\d+$/.test(dato) || /^\d+(\.\d+)?$/.test(dato);
  }

  function contieneLetras(dato) {
    return /[a-zA-Z]/.test(dato);
  }

  function esEntero(valor) {
    const esEntero = Number.isInteger(Number(valor));
    return esEntero && Math.sign(valor) !== -1;
  }

  const validarCampos = () => {
    let erroresTemp = {};
    if (!formulario.no_recibo.trim()) {
      erroresTemp.no_recibo = "Este campo es obligatorio";
    } else if (!esNumero(formulario.no_recibo)) {
      erroresTemp.no_recibo = "Este dato debe ser un número positivo";
    } else if (!esEntero(formulario.no_recibo)) {
      erroresTemp.no_recibo = "Este dato debe ser un número entero";
    }

    if (!formulario.fecha.trim()) {
      erroresTemp.fecha = "Este campo es obligatorio";
    }
    if (!formulario.concepto_pago.trim()) {
      erroresTemp.concepto_pago = "Este campo es obligatorio";
    } else if (!contieneLetras(formulario.concepto_pago)) {
      erroresTemp.concepto_pago = "Este dato debe contener letras";
    }

    if (!formulario.cuota_ordinaria.trim()) {
      erroresTemp.cuota_ordinaria = "Este campo es obligatorio";
    } else if (!esNumero(formulario.cuota_ordinaria)) {
      erroresTemp.cuota_ordinaria = "Este dato debe ser un número positivo";
    }

    if (formulario.cuota_penalizacion.trim() !== "") {
      if (!esNumero(formulario.cuota_penalizacion)) {
        erroresTemp.cuota_penalizacion =
          "Este dato debe ser un número positivo";
      }
    }

    if (formulario.cuota_extraordinaria.trim() !== "") {
      if (!esNumero(formulario.cuota_extraordinaria)) {
        erroresTemp.cuota_extraordinaria =
          "Este dato debe ser un número positivo";
      }
    }

    if (formulario.cuota_reserva.trim() !== "") {
      if (!esNumero(formulario.cuota_reserva)) {
        erroresTemp.cuota_reserva = "Este dato debe ser un número positivo";
      }
    }

    if (formulario.cuota_adeudos.trim() !== "") {
      if (!esNumero(formulario.cuota_adeudos)) {
        erroresTemp.cuota_adeudos = "Este dato debe ser un número positivo";
      }
    }
    if (formulario2.adeudo.trim() !== "") {
      if (!esNumero(formulario2.adeudo)) {
        erroresTemp.adeudo = "Este dato debe ser un número positivo";
      }
    }

    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
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

  let opcionesInquilino;
  if (inquilinos.length === 0) {
    opcionesInquilino = (
      <option value="Defecto">No hay inquilinos disponibles</option>
    );
  } else {
    opcionesInquilino = inquilinos.map((c) => (
      <option key={c.id_inquilino} value={c.id_inquilino}>
        {c.nombre_inquilino +
          " " +
          c.apellino_paterno_inquilino +
          " " +
          c.apellino_materno_inquilino}
      </option>
    ));
  }

  return (
    <div className="div-contenedor div-espaciado">
      <h1>Crear un nuevo recibo</h1>
      <Link to="/NuevoReciboExcel">
        <button type="button" className="mi-boton2" style={{ width: "260px" }}>
          <SiMicrosoftexcel /> Generar recibos a partir de Excel
        </button>
      </Link>
      <form
        className="fromInquilino"
        onSubmit={handleSubmit}
        style={{ width: "900px" }}
      >
        <div className="select-container">
          <div className="select-item">
            <label className="labelInput">Seleccione un condominio: </label>
            <select id="opciones" onChange={handleChangeSelect}>
              {opcionesCondominio}
            </select>
          </div>
          <div className="select-item">
            <label className="labelInput">Seleccione un Edificio: </label>
            <select id="opciones" onChange={handleChangeSelectEdificios}>
              {opcionesEdificio}
            </select>
          </div>
          <div className="select-item">
            <label className="labelInput">Seleccione un Departamento: </label>
            <select id="opciones" onChange={handleChangeSelectDepartamentos}>
              {opcionesDepartamento}
            </select>
          </div>
        </div>
        <div className="select-container">
          <div className="select-item">
            <label className="labelInput">Seleccione un Inquilino: </label>
            <select id="opciones" onChange={handleChangeSelectInquilino}>
              {opcionesInquilino}
            </select>
          </div>
          <div className="select-item">
            <label className="labelInput">Numero Del Recibo: </label>
            <input
              type="text"
              id="no_recibo"
              name="no_recibo"
              placeholder={
                siguienteNumeroRecibo !== null
                  ? siguienteNumeroRecibo.toString()
                  : "Cargando..."
              }
              value={formulario.no_recibo}
              onChange={handleChange}
            />
            <div className="error-message">{errores.no_recibo}</div>
          </div>
          <div className="select-item">
            <label className="labelInput">Fecha Del Recibo: </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formulario.fecha}
              onChange={handleChangeFecha}
              min={minDate}
              max={maxDate}
            />
            <div className="error-message">{errores.fecha}</div>
          </div>
        </div>

        <div className="select-container" style={{ marginBottom: "10px" }}>
          <div className="select-item">
            <label className="labelInput">Concepto de pago: </label>
            <input
              style={{ width: "360px" }}
              type="text"
              id="concepto_pago"
              name="concepto_pago"
              placeholder="CUOTAS DE MANTENIMIENTO Y ADMINISTRACIÓN"
              value={formulario.concepto_pago}
              onChange={handleChange}
              disabled
            />
            <div className="error-message">{errores.concepto_pago}</div>
          </div>
          <div className="select-item">
            <label className="labelInput">Cuota Ordinaria($): </label>
            <input
              type="text"
              id="cuota_ordinaria"
              name="cuota_ordinaria"
              placeholder="$"
              value={formulario.cuota_ordinaria}
              onChange={handleChange}
              maxLength="4"
            />
            <div className="error-message">{errores.cuota_ordinaria}</div>
          </div>
        </div>

        <div
          className="select-container"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div className="select-item" style={{ flex: 1 }}>
            <label className="labelInput">Cuota de Penalizacion($): </label>
            <input
              type="text"
              id="cuota_penalizacion"
              name="cuota_penalizacion"
              placeholder="$"
              value={formulario.cuota_penalizacion}
              onChange={handleChange}
              maxLength="4"
            />
            <div className="error-message">{errores.cuota_penalizacion}</div>
          </div>
          <div className="select-item" style={{ flex: 1 }}>
            <label className="labelInput">Cuota Extraordinaria($): </label>
            <input
              type="text"
              id="cuota_extraordinaria"
              name="cuota_extraordinaria"
              placeholder="$"
              value={formulario.cuota_extraordinaria}
              onChange={handleChange}
              maxLength="4"
            />
            <div className="error-message">{errores.cuota_extraordinaria}</div>
          </div>
          <div className="select-item" style={{ flex: 1 }}>
            <label className="labelInput">Cuota de Reserva($): </label>
            <input
              type="text"
              id="cuota_reserva"
              name="cuota_reserva"
              placeholder="$"
              value={formulario.cuota_reserva}
              onChange={handleChange}
              maxLength="4"
            />
            <div className="error-message">{errores.cuota_reserva}</div>
          </div>
          <div className="select-item" style={{ flex: 1 }}>
            <label className="labelInput">Cuota de Adeudos($): </label>
            <input
              type="text"
              id="cuota_adeudos"
              name="cuota_adeudos"
              placeholder="$"
              value={formulario.cuota_adeudos}
              onChange={handleChange}
              maxLength="4"
            />
            <div className="error-message">{errores.cuota_adeudos}</div>
          </div>
        </div>
        <div className="select-item" style={{ width: "40%" }}>
          <label className="labelInput">Adeudo(opcional): </label>
          <input
            type="text"
            id="adeudo"
            name="adeudo"
            placeholder="$"
            onChange={handleChange2}
            maxLength="6"
          />
          <div className="error-message">{errores.adeudo}</div>
        </div>

        <div
          className="Aceptado"
          style={{ display: visible ? "block" : "none" }}
        >
          Registro exitoso
        </div>
        <div className="error-message">{errorNumero}</div>
        <br />
        <div className="botones-container">
          <button className="mi-boton2" type="submit">
            Registrar
          </button>
        </div>
      </form>
      <br />
      <br />
    </div>
  );
}
export default NuevoRecibo;
