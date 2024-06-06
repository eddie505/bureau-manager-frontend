import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";
import * as VscIcons from "react-icons/vsc";
import { RiLogoutBoxLine } from "react-icons/ri";

const MenuDatos = [
  {
    title: "Inicio",
    path: "/MenuPrincipal",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Registro y Edición",
    path: "/ComponentesCED",
    icon: <FaIcons.FaRegEdit />,
    cName: "nav-text",
  },
  {
    title: "Administrar Inquilinos",
    path: "/ComponenteInquilino",
    icon: <BsIcons.BsPersonSquare />,
    cName: "nav-text",
  },
  {
    title: "Administrar cuotas",
    path: "/RegistrarCuotas",
    icon: <MdIcons.MdOutlinePayments />,
    cName: "nav-text",
  },
  {
    title: "Crear Recibos",
    path: "/NuevoRecibo",
    icon: <IoIcons.IoIosCreate />,
    cName: "nav-text",
  },
  {
    title: "Descargar y enviar recibos",
    path: "/VerRecibo",
    icon: <FaIcons.FaFileDownload />,
    cName: "nav-text",
  },
  {
    title: "Consultar pagos",
    path: "/InfoPagos",
    icon: <VscIcons.VscGraphLine />,
    cName: "nav-text",
  },
  {
    title: "Información de condominios",
    path: "/GestionCondominios",
    icon: <FaIcons.FaBuilding />,
    cName: "nav-text",
  },
  {
    title: "Soporte",
    path: "http://bureau-manager.mx",
    icon: <MdIcons.MdContactSupport />,
    cName: "nav-text",
  },
  {
    title: "Cerrar sesión",
    path: "#",
    icon: <RiLogoutBoxLine />,
    cName: "nav-text",
  },
];
export default MenuDatos;
