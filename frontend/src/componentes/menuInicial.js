/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.js";
import { REACT_APP_SERVER_URL } from "../config.js";

function MenuInicial() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const authData = JSON.parse(localStorage.getItem("authData"));
  const id_administrador = parseInt(authData?.id);
  const [adminName, setAdminName] = useState("");
  const [adminApellidoP, setAdminApellidoP] = useState("");
  const [adminApellidoM, setAdminApellidoM] = useState("");

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_SERVER_URL}/api/getAdmin/${id_administrador}`
      ); // Asegúrate de que el id está siendo correctamente pasado
      const data = await response.json();
      if (response.ok) {
        setAdminName(data.nombre_administrador);
        setAdminApellidoP(data.apellido_paterno_administrador);
        setAdminApellidoM(data.apellido_materno_administrador);
      } else {
        throw new Error(
          data.message || "Error al obtener la información del administrador"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo cargar la información del administrador");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  useEffect(() => {
    document.body.classList.add("body1");
    fetchAdminInfo();
    return () => {
      document.body.classList.remove("body1");
    };
  }, []);
  return (
    <>
      <form className="fromMenu" style={{ marginTop: "50px" }}>
        <h1>Bienvenido administrador(a):</h1>
        <h1>
          {adminName} {adminApellidoP} {adminApellidoM}
        </h1>

        <div>
          <h1>¿Que puedes hacer?</h1>
        </div>
        <div className="menudiv">
          <div className="menuinfo">
            <h2>Creacion y envio de recibos</h2>
            <p>
              Crea o importa los recibos que necesites y envialos a los
              inquilinos correspondientes de forma rapida y sencilla
            </p>
          </div>
          <div className="menuinfo">
            <h2>Administracion de datos</h2>
            <p>
              Revisa, controla y edita la toda la informacion sobre tus
              condominios e inquilinos de manera sencilla gracias al formato
              integrado
            </p>
          </div>
          <div className="menuinfo">
            <h2>Importar datos desde excel</h2>
            <p>
              Importa tus hojas de excel con la informacion que quieres
              administrar para poder crear tus recibos de forma rapida
            </p>
          </div>
          <div className="menuinfo">
            <h2>Consulta de datos</h2>
            <p>
              Consulta los datos sobre los estados de tus condominios, revisa la
              informacion sobre los pagos realizados y los adeudos
            </p>
          </div>
        </div>
        <br />
        <button type="submit" onClick={handleLogout}>
          Cerrar Sesion
        </button>
      </form>
    </>
  );
}
export default MenuInicial;
