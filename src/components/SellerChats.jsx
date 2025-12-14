import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../messaging/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  updateDoc,
  doc,
} from "firebase/firestore";
import Cookies from "universal-cookie";

const SellerChats = () => {
  // Lista de chats del vendedor
  const [chats, setChats] = useState([]);

  // Indica si hay mensajes sin leer
  const [hasUnread, setHasUnread] = useState(false);

  // Controla el menú desplegable del avatar
  const [openMenu, setOpenMenu] = useState(false);

  const cookies = new Cookies();
  const user = cookies.get("user");
  const userId = user?.id;

  const navigate = useNavigate();

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const chatsPerPage = 8; // Número de chats por página

  // Cambiar entre páginas de la lista de chats
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Ordenar chats por fecha del último mensaje
  const sortedChats = chats.sort((a, b) => {
    if (!a.lastMessage || !b.lastMessage) return 0;
    return b.lastMessage.createdAt?.seconds - a.lastMessage.createdAt?.seconds;
  });

  // Lógica para paginación
  const indexOfLastChat = currentPage * chatsPerPage;
  const indexOfFirstChat = indexOfLastChat - chatsPerPage;
  const currentChats = sortedChats.slice(indexOfFirstChat, indexOfLastChat);

  const totalPages = Math.ceil(chats.length / chatsPerPage);

  /**
   * -------------------------------------------------------
   * 🔥 USE EFFECT: Escuchar chats en tiempo real y detectar
   *    mensajes no leídos
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (!userId) return;

    // Seleccionar todos los chats donde participe el vendedor
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userId));

    // Escuchar cambios en los chats en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let unreadFound = false;

      // Recorrer cada chat encontrado
      snapshot.docs.forEach((docSnap) => {
        const chatData = { id: docSnap.id, ...docSnap.data() };

        // Obtener el último mensaje de ese chat
        const messagesRef = collection(db, `chats/${chatData.id}/messages`);
        const lastMessageQuery = query(
          messagesRef,
          orderBy("createdAt", "desc"),
          limit(1)
        );

        // Escuchar el último mensaje en tiempo real
        onSnapshot(lastMessageQuery, (msgSnap) => {
          if (!msgSnap.empty) {
            const lastMsg = msgSnap.docs[0].data();

            // Verificar si el último mensaje está sin leer
            if (
              lastMsg.senderId !== userId &&
              !lastMsg.readBy?.includes(userId)
            ) {
              unreadFound = true;
              setHasUnread(true);
            } else if (!unreadFound) {
              setHasUnread(false);
            }

            // Actualizar el chat con su último mensaje
            setChats((prev) => {
              const other = prev.filter((c) => c.id !== chatData.id);
              return [...other, { ...chatData, lastMessage: lastMsg }];
            });
          } else {
            // Chat sin mensajes aún
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

  /**
   * -------------------------------------------------------
   * 🟢 Abrir chat y marcar el último mensaje como leído
   * -------------------------------------------------------
   */
  const openChat = async (chatId) => {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const lastMsgQuery = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(1)
    );

    // Marcar como leído
    onSnapshot(lastMsgQuery, async (msgSnap) => {
      if (!msgSnap.empty) {
        const lastMsgDoc = msgSnap.docs[0];
        const lastMsg = lastMsgDoc.data();

        if (!lastMsg.readBy?.includes(userId)) {
          const readBy = lastMsg.readBy
            ? [...lastMsg.readBy, userId]
            : [userId];

          await updateDoc(doc(db, `chats/${chatId}/messages`, lastMsgDoc.id), {
            readBy,
          });
        }
      }
    });

    // Redirigir al chat
    navigate(`/chat/${chatId}`);
  };

  /**
   * -------------------------------------------------------
   * 🔐 Cerrar sesión
   * -------------------------------------------------------
   */
  const handleLogout = () => {
    cookies.remove("session", { path: "/" });
    cookies.remove("user", { path: "/" });
    window.location.href = "/";
  };

  // Si un comprador intenta entrar a esta vista, se redirige
  if (user.role === "COMPRADOR") {
    navigate("/");
  }

  return (
    <div>
      {/* -------------------------------------------------------
         🔸 HEADER DEL DASHBOARD DEL VENDEDOR
         ------------------------------------------------------- */}
      <header className="border-bottom" style={{ backgroundColor: "#C77C57" }}>
        <nav className="navbar navbar-expand-lg w-75 mx-auto container">
          <div className="container-fluid px-4">
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

              {/* Avatar + Menú */}
              <div className="d-flex align-items-center">
                <div
                  className="links-Header shadow rounded d-flex justify-content-center align-items-center me-3"
                  onClick={() => setOpenMenu(!openMenu)}
                  style={{ height: "40px", cursor: "pointer" }}
                >

                  {/* Mostrar avatar del usuario */}
                  <>
                    {user?.avatar ? (
                      <img
                        src={user?.avatar}
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
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}

                    {/* Nombre del usuario */}
                    <span
                      className="me-2"
                      style={{
                        color: "#FFFFFF",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.name}
                    </span>

                    {/* Menú desplegable */}
                    {openMenu && (
                      <div
                        className="menu position-absolute shadow-lg rounded bg-white"
                        style={{
                          top: "50px",
                          right: "0",
                          width: "145px",
                          zIndex: 1000,
                        }}
                      >
                        <ul className="list-unstyled mb-0">
                          <li>
                            <Link
                              to={`/sellerDashboard/profile/${user.id}`}
                              className="dropdown-item py-2 px-3 text-dark text-decoration-none d-block"
                            >
                              Perfil
                            </Link>
                          </li>
                          <li>
                            <button
                              onClick={handleLogout}
                              className="dropdown-item py-2 px-3 w-100 text-start text-danger border-0 bg-transparent"
                            >
                              Cerrar sesión
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </>
                </div>
              </div>

            </div>
          </div>
        </nav>
      </header>

      {/* -------------------------------------------------------
         🔸 CONTENIDO PRINCIPAL
         ------------------------------------------------------- */}
      <main style={{ backgroundColor: "#FFFDF6", minHeight: "100vh" }}>
        <div className="container py-5">
          <div className="row">

            {/* ---------------- Sidebar ---------------- */}
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
                  <h5 className="mx-2 sidebar-item" style={{ color: "#000000" }}>
                    Mis productos
                  </h5>
                </Link>

                <Link
                  to="/sellerDashboard/orders"
                  className="text-decoration-none"
                >
                  <h5 className="mx-2 mt-3 sidebar-item" style={{ color: "#000000" }}>
                    Pedidos
                  </h5>
                </Link>

                {/* Chats con indicador de mensajes sin leer */}
                <div className="position-relative">
                  <h5
                    className="mx-2 mt-3 sidebar-item"
                    style={{ color: "#000000", cursor: "pointer" }}
                    onClick={() => navigate("/sellerDashboard/chats")}
                  >
                    Chats
                  </h5>

                  {/* Punto rojo si hay mensajes no leídos */}
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

            {/* ---------------- Lista de chats ---------------- */}
            <div className="col-12 col-md-9">
              <div
                className="p-4 rounded shadow"
                style={{ backgroundColor: "#F5EDE0" }}
              >
                <h2 className="fw-bold mb-4">Chats</h2>

                {/* Si no hay chats */}
                {chats.length === 0 && <p>No tienes chats aún</p>}

                {/* Mostrar chats */}
                {currentChats.map((chat) => {
                  const buyerId = chat.participants.find((p) => p !== userId);

                  return (
                    <div
                      key={chat.id}
                      className="p-3 mb-2 rounded shadow-sm"
                      style={{
                        backgroundColor: "#FFFDF6",
                        cursor: "pointer",
                      }}
                      onClick={() => openChat(chat.id)}
                    >
                      <strong>Comprador:</strong> {buyerId} <br />

                      <small>
                        {chat.lastMessage
                          ? `${chat.lastMessage.text.slice(0, 30)}${
                              chat.lastMessage.text.length > 30 ? "..." : ""
                            }`
                          : "Sin mensajes aún"}
                      </small>
                      <br />

                      <small>
                        {chat.lastMessage?.createdAt
                          ? new Date(
                              chat.lastMessage.createdAt.seconds * 1000
                            ).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  );
                })}

                {/* ----------- Paginación ----------- */}
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
                    {/* Botón Anterior */}
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

                    {/* Números de página */}
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

                    {/* Botón Siguiente */}
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
};

export default SellerChats;
