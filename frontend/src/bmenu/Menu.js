/* eslint-disable */
import { useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { MenuDatos } from "./MenuDatos.js";
import { IconContext } from "react-icons";
import { useAuth } from "../AuthContext.js";
import logob from "../img/loguito2.png";

function Menu() {
  const [sidebar, setSidebar] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const mostrarSidebar = () => setSidebar(!sidebar);

  const handleLogout = () => {
    logout();
    navigate("/");
    setSidebar(false);
  };
  return (
    <>
      <IconContext.Provider value={{ color: "whitesmoke" }}>
        <div className="navbar">
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={mostrarSidebar} />
          </Link>
          <Link to="/MenuPrincipal">
            <p
              style={{
                marginLeft: "15px",
                fontSize: "1.2rem",
                fontStyle: "italic",
                color: "whitesmoke",
              }}
            >
              Bureau-Manager
            </p>
          </Link>
          <div className="navv">
            <Link to="/MenuPrincipal">
              <img style={{ marginRight: "25px" }} src={logob} alt="logo" />
            </Link>
          </div>
          <div>
            <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
              <ul className="nav-menu-items" onClick={mostrarSidebar}>
                <li className="navbar-toggle">
                  <Link to="#" className="menu-bars">
                    <AiIcons.AiOutlineClose />
                  </Link>
                </li>
                {MenuDatos.map((item, index) => {
                  if (item.external) {
                    return (
                      <li key={index} className={item.cName}>
                        <a
                          href={item.path}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </a>
                      </li>
                    );
                  } else {
                    return (
                      <li key={index} className={item.cName}>
                        <Link to={item.path}>
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    );
                  }
                })}
              </ul>
            </nav>
          </div>
        </div>
      </IconContext.Provider>
    </>
  );
}

export default Menu;
