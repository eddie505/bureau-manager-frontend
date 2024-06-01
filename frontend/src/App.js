/* eslint-disable */
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext.js";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import Formulario from "./componentes/iniciosesion.js";
import RegistrarCuenta from "./componentes/registroCuenta.js";
import MenuInicial from "./componentes/menuInicial.js";
import EdicionyRegistro from "./componentes/edicionyRegistro.js";
import NuevoCondominio from "./componentes/nuevoCondominio.js";
import EditoCondominio from "./componentes/edicionCondominio.js";
import NuevoEdificio from "./componentes/nuevoEdificio.js";
import EditoEdificio from "./componentes/edicionEdificio.js";
import NuevoDepartamento from "./componentes/nuevoDepa.js";
import EditoDepartamento from "./componentes/edicionDepa.js";
import NuevoInquilino from "./componentes/nuevoInquilino.js";
import MenuInquilino from "./componentes/menuInquilino.js";
import EditoInquilino from "./componentes/edicionInquilino.js";
import NuevoRecibo from "./componentes/nuevoRecibo.js";
import VerRecibo from "./componentes/verRecibos.js";
import Layout from "./componentes/Layout.js";
import NuevoReciboExcel from "./componentes/nuevoReciboExcel.js";
import InfoPagos from "./componentes/infoPagos.js";
import ComponenteCED from "./componentes/componentesCED.js";
import ComponenteInquilino from "./componentes/componentesInquilino.js";
import GestionCondominios from "./componentes/gestionCondominios.js";
import { SERVER_URL } from "./config.js";

function PrivateRoute({ children }) {
  const { authToken } = useAuth();

  return authToken ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Formulario />} />
          <Route path="/RegistrarCuenta" element={<RegistrarCuenta />} />
          <Route
            path="/MenuPrincipal"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <MenuInicial />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/EdicionyRegistro"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <EdicionyRegistro />
                </Layout>{" "}
              </PrivateRoute>
            }
          />
          <Route
            path="/NuevoCondominio"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <NuevoCondominio />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/EditoCondominio"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <EditoCondominio />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/NuevoEdificio"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <NuevoEdificio />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/EditoEdificio"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <EditoEdificio />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/NuevoDepartamento"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <NuevoDepartamento />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/EditoDepartamento"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <EditoDepartamento />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/NuevoInquilino"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <NuevoInquilino />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/MenuInquilino"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <MenuInquilino />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/EditoInquilino"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <EditoInquilino />{" "}
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/NuevoRecibo"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <NuevoRecibo />
                </Layout>{" "}
              </PrivateRoute>
            }
          />
          <Route
            path="/VerRecibo"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <VerRecibo />
                </Layout>{" "}
              </PrivateRoute>
            }
          />
          <Route
            path="/NuevoReciboExcel"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <NuevoReciboExcel />
                </Layout>{" "}
              </PrivateRoute>
            }
          />
          <Route
            path="/InfoPagos"
            element={
              <PrivateRoute>
                {" "}
                <Layout>
                  <InfoPagos />
                </Layout>{" "}
              </PrivateRoute>
            }
          />
          <Route
            path="/ComponentesCED"
            element={
              <PrivateRoute>
                <Layout>
                  <ComponenteCED />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/ComponenteInquilino"
            element={
              <PrivateRoute>
                <Layout>
                  <ComponenteInquilino />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/GestionCondominios"
            element={
              <PrivateRoute>
                <Layout>
                  <GestionCondominios />
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
