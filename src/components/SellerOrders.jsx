// Importamos librerías y hooks necesarios
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { db } from "../messaging/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

function SellerOrders() {
  // ------------------- ESTADOS -------------------
  const [chats, setChats] = useState([]); // Lista de chats del vendedor
  const [hasUnread, setHasUnread] = useState(false); // Indica si hay mensajes no leídos
  const [openMenu, setOpenMenu] = useState(false); // Menú desplegable de usuario
  const [orders, setOrders] = useState([]); // Lista de pedidos del vendedor
  const [showAddress, setShowAddress] = useState(false); // Para mostrar dirección de entrega
  const [currentAddress, setCurrentAddress] = useState(null); // Pedido cuya dirección se muestra
  const [users, setUsers] = useState(""); // Datos del usuario (vendedor)

  // ------------------- PAGINACIÓN -------------------
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const ordersPerPage = 8; // Cantidad de pedidos por página

  // Función para cambiar de página
  const handlePageChange = (page) => {
    if (page < 1) return;
    if (page > totalPages) return;
    setCurrentPage(page);
  };

  // ------------------- COOKIES Y NAVEGACIÓN -------------------
  const cookies = new Cookies();
  const navigate = useNavigate();

  const session = cookies.get("session"); // Obtenemos la sesión
  const user = cookies.get("user"); // Obtenemos el usuario
  const userId = user?.id;

  // Redirige si no hay sesión o si el usuario no es vendedor
  useEffect(() => {
    if (!user || user.role !== "VENDEDOR" || !session) {
      navigate("/");
    }
  }, [user, navigate, session]);

  // Redirige si el rol es COMPRADOR
  useEffect(() => {
    if (user?.role === "COMPRADOR") {
      navigate("/");
    }
  }, [user, navigate]);

  // Función para cerrar sesión
  const handleLogout = () => {
    cookies.remove("session", { path: "/" });
    cookies.remove("user", { path: "/" });
    window.location.href = "/";
  };

  const apiUrl = import.meta.env.VITE_API_URL;

  // ------------------- OBTENER PEDIDOS -------------------
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/orders/user/${user.id}`)
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener pedidos:", error);
      });
  }, []);

  // Filtramos solo pedidos que no están cancelados
  const activeOrders = orders.filter((order) => order.status !== "CANCELADO");

  activeOrders.reverse(); // Mostramos los pedidos más recientes primero

  // ------------------- PAGINACIÓN DE PEDIDOS -------------------

  // Calculamos pedidos para la página actual
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = activeOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Total de páginas
  const totalPages = Math.ceil(activeOrders.length / ordersPerPage);

  // ------------------- AVANZAR ESTADO DE PEDIDOS -------------------
  const advanceStatus = (order) => {
    let newStatus = "";

    if (order.status === "PENDIENTE") newStatus = "ENVIADO";
    else if (order.status === "ENVIADO") newStatus = "ENTREGADO";
    else return; // Si ya está ENTREGADO, no hace nada

    axios
      .put(`${import.meta.env.VITE_API_URL}/api/orders/update/${order?.id}`, {
        status: newStatus,
      })
      .then(() => {
        // Actualizamos el estado local para reflejar el cambio sin recargar
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
        );
      })
      .catch((err) => console.error("Error al cambiar estado:", err));
  };

  // ------------------- OBTENER DATOS DEL USUARIO -------------------
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${apiUrl}/api/users/user/${user.id}`)
      .then((response) => {
        // Actualizamos la cookie con la nueva información (avatar actualizado)
        const updatedUser = { ...user, img: response.data.avatar || user.img };
        cookies.set("user", updatedUser, { path: "/" });
        setUsers(response.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // ------------------- CHAT EN TIEMPO REAL -------------------
  useEffect(() => {
    if (!userId) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let unreadFound = false;

      snapshot.docs.forEach((docSnap) => {
        const chatData = { id: docSnap.id, ...docSnap.data() };
        const messagesRef = collection(db, `chats/${chatData.id}/messages`);
        const lastMessageQuery = query(
          messagesRef,
          orderBy("createdAt", "desc"),
          limit(1)
        );

        onSnapshot(lastMessageQuery, (msgSnap) => {
          if (!msgSnap.empty) {
            const lastMsg = msgSnap.docs[0].data();

            // Comprobamos si hay mensajes no leídos
            if (
              lastMsg.senderId !== userId &&
              !lastMsg.readBy?.includes(userId)
            ) {
              unreadFound = true;
              setHasUnread(true);
            } else if (!unreadFound) {
              setHasUnread(false);
            }

            // Actualizamos la lista de chats con el último mensaje
            setChats((prev) => {
              const other = prev.filter((c) => c.id !== chatData.id);
              return [...other, { ...chatData, lastMessage: lastMsg }];
            });
          } else {
            // Chat sin mensajes
            setChats((prev) => {
              const other = prev.filter((c) => c.id !== chatData.id);
              return [...other, { ...chatData, lastMessage: null }];
            });
          }
        });
      });
    });

    return () => unsubscribe();
  }, [userId]);

  // ------------------- RENDERIZADO -------------------
  return (
    <div>
      {/* ---------------- HEADER ---------------- */}
      <header className="border-bottom" style={{ backgroundColor: "#C77C57" }}>
        <nav className="navbar navbar-expand-lg w-75 mx-auto container">
          <div className="container-fluid px-4">
            {/* Logo */}
            <div className="d-flex align-items-center justify-content-between w-100">
              <Link
                style={{ color: "#FFFFFF" }}
                className="navbar-brand fw-bold me-2"
                to="/sellerDashboard"
              >
                <img
                  src="/img/unnamed-removebg-preview.png"
                  alt=""
                  style={{ width: "40px", height: "40px" }}
                />
              </Link>

              {/* Menú de usuario */}
              <div className="d-flex align-items-center">
                <div
                  className="links-Header shadow rounded d-flex justify-content-center align-items-center me-3"
                  onClick={() => setOpenMenu(!openMenu)}
                  style={{ height: "40px", cursor: "pointer" }}
                >
                  {users?.avatar ? (
                    <img
                      src={users?.avatar}
                      className="img-fluid rounded-circle me-2 mx-2"
                      alt="Foto usuario"
                      style={{
                        width: "30px",
                        height: "30px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-2 mx-2"
                      style={{
                        width: "30px",
                        height: "30px",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      {users?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span
                    className="me-2"
                    style={{
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {users?.name}
                  </span>

                  {openMenu && (
                    <div
                      className="menu position-absolute shadow-lg rounded bg-white"
                      style={{
                        top: "50px",
                        right: "0",
                        width: "145px",
                        zIndex: 1000,
                        animation: "fadeIn 0.2s ease-in-out",
                      }}
                    >
                      <ul className="list-unstyled mb-0">
                        <li>
                          <Link
                            to={`/sellerDashboard/profile/${user.id}`}
                            className="dropdown-item py-2 px-3 text-dark text-decoration-none d-block"
                          >
                            <i className="bi bi-person me-2"></i> Perfil
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="dropdown-item py-2 px-3 w-100 text-start text-danger border-0 bg-transparent"
                          >
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Cerrar sesión
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* ---------------- MAIN ---------------- */}
      <main style={{ backgroundColor: "#FFFDF6", minHeight: "100vh" }}>
        <div className="container py-5">
          <div className="row">
            {/* Sidebar */}
            <div className="col-12 col-md-3 mb-3">
              <div
                className="p-4 rounded shadow h-100"
                style={{ backgroundColor: "#F5EDE0" }}
              >
                <h3 className="fw-bold">Dashboard</h3>
                <hr />
                <Link
                  to="/sellerDashboard/products"
                  className="text-decoration-none"
                >
                  <h5
                    className="mx-2 sidebar-item"
                    style={{ color: "#000000" }}
                  >
                    Mis productos
                  </h5>
                </Link>
                <Link
                  to="/sellerDashboard/orders"
                  className="text-decoration-none"
                >
                  <h5
                    className="mx-2 mt-3 sidebar-item"
                    style={{ color: "#000000" }}
                  >
                    Pedidos
                  </h5>
                </Link>
                <div className="position-relative">
                  <h5
                    className="mx-2 mt-3 sidebar-item"
                    style={{ color: "#000000", cursor: "pointer" }}
                    onClick={() => navigate("/sellerDashboard/chats")}
                  >
                    Chats
                  </h5>
                  {hasUnread && (
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "red",
                        position: "absolute",
                        top: "8px",
                        right: "10px",
                        display: "inline-block",
                      }}
                    ></span>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="col-12 col-md-9 ">
              <div
                className="p-4 rounded shadow"
                style={{ backgroundColor: "#F5EDE0" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fw-bold">Pedidos</h2>
                </div>

                {/* Tabla de pedidos */}
                <div className="table-responsive">
                  <table
                    className="table align-middle table-hover shadow-sm"
                    style={{
                      backgroundColor: "#FFFDF6",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <thead
                      style={{
                        backgroundColor: "#E8DCC8",
                        color: "#6B4F3F",
                        fontWeight: "600",
                      }}
                    >
                      <tr>
                        <th className="text-center">Pedido</th>
                        <th className="text-center">Comprador</th>
                        <th className="text-center">Productos</th>
                        <th className="text-center">Total</th>
                        <th className="text-center">Dirección</th>
                        <th className="text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="text-center align-middle">
                            <td className="fw-bold text-uppercase">
                              Pedido #{order.id}
                            </td>
                            <td>{order.buyerName || "Desconocido"}</td>
                            <td>
                              {order.items?.map((item) => (
                                <div
                                  key={item.productId}
                                  className="d-flex justify-content-center gap-2 flex-wrap"
                                >
                                  <span className="fw-medium text-dark">
                                    {item.productName || item.productId}
                                  </span>
                                  <span className="text-muted">
                                    x {item.quantity}
                                  </span>
                                </div>
                              ))}
                            </td>
                            <td>{order.total?.toFixed(2)} €</td>
                            <td>
                              {/* Botón Ver Dirección dentro de la tabla */}
                              <button
                                className="btn btn-sm rounded-pill"
                                style={{
                                  marginLeft: "5px",
                                  backgroundColor: "#C1A16A",
                                  color: "#fff",
                                }}
                                onClick={() => {
                                  setCurrentAddress(order); // ahora currentAddress tiene toda la info
                                  setShowAddress(true);
                                }}
                              >
                                Dirección
                              </button>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm"
                                onClick={() => advanceStatus(order)}
                                disabled={order.status === "ENTREGADO"}
                                style={{
                                  backgroundColor:
                                    order.status === "PENDIENTE"
                                      ? "#F2C94C" // amarillo mostaza vivo
                                      : order.status === "ENVIADO"
                                      ? "#6FCF97" // verde hoja intenso
                                      : "#EB6A3C", // naranja terracota fuerte
                                  color: "#fff",
                                  fontWeight: "500",
                                }}
                              >
                                {order.status}
                              </button>

                              {/* ---------------- MODAL DE DIRECCIÓN ---------------- */}
                              {showAddress && currentAddress && (
                                <div
                                  className="modal show d-block"
                                  tabIndex="-1"
                                  style={{
                                    backgroundColor: "transparent",
                                    backdropFilter: "blur(5px)",
                                  }}
                                >
                                  <div className="modal-dialog modal-sm modal-dialog-centered">
                                    <div
                                      className="modal-content"
                                      style={{ borderRadius: "12px" }}
                                    >
                                      <div className="modal-header">
                                        <h5 className="modal-title">
                                          Dirección de entrega
                                        </h5>
                                      </div>
                                      <div className="modal-body">
                                        <p style={{ marginBottom: "0.5rem" }}>
                                          <strong>Nombre:</strong>{" "}
                                          {currentAddress.buyerName ||
                                            "Desconocido"}{" "}
                                          {currentAddress.lastname} <br />
                                          <strong>Ciudad:</strong>{" "}
                                          {currentAddress.city || "Desconocida"}{" "}
                                          <br />
                                          <strong>Calle:</strong>{" "}
                                          {currentAddress.address ||
                                            "Desconocida"}{" "}
                                          <br />
                                          <strong>Piso:</strong>{" "}
                                          {currentAddress.floor ||
                                            "Desconocido"}{" "}
                                          <br />
                                          <strong>Código Postal:</strong>{" "}
                                          {currentAddress.postalCode ||
                                            "Desconocido"}{" "}
                                          <br />
                                          <strong>Teléfono:</strong>{" "}
                                          {currentAddress.phone ||
                                            "Desconocido"}
                                        </p>
                                      </div>
                                      <div className="modal-footer">
                                        <button
                                          type="button"
                                          className="btn"
                                          onClick={() => setShowAddress(false)}
                                          style={{
                                            backgroundColor: "#C77C57",
                                            color: "#FFFDF6",
                                            borderRadius: "8px",
                                            padding: "6px 12px",
                                            fontWeight: "500",
                                          }}
                                        >
                                          Cerrar
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ---------------- PAGINACIÓN ---------------- */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "30px",
                  }}
                >
                  <ul
                    style={{
                      display: "flex",
                      listStyle: "none",
                      padding: 0,
                      gap: "8px",
                    }}
                  >
                    <li>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #C77C57",
                          borderRadius: "6px",
                          backgroundColor: "#FAF7F2",
                          color: "#6B4F3A",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        Anterior
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li key={i}>
                        <button
                          onClick={() => handlePageChange(i + 1)}
                          style={{
                            padding: "6px 12px",
                            border: "1px solid #C77C57",
                            borderRadius: "6px",
                            backgroundColor:
                              currentPage === i + 1 ? "#C77C57" : "#FAF7F2",
                            color:
                              currentPage === i + 1 ? "#FAF7F2" : "#6B4F3A",
                            cursor: "pointer",
                          }}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #C77C57",
                          borderRadius: "6px",
                          backgroundColor: "#FAF7F2",
                          color: "#6B4F3A",
                          cursor:
                            currentPage === totalPages
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerOrders;
