import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "universal-cookie";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { db } from "../messaging/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

function SellerDashboard() {
  const [chats, setChats] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState("");

  const navigate = useNavigate();
  const cookies = new Cookies();

  const session = cookies.get("session");
  const user = cookies.get("user");
  const userId = user?.id;

  // Redirección si no hay sesión o rol incorrecto
  useEffect(() => {
    if (!user || user.role !== "VENDEDOR" || !session) {
      navigate("/");
    }
  }, [user, navigate, session]);

  // Logout
  const handleLogout = () => {
    cookies.remove("session", { path: "/" });
    cookies.remove("user", { path: "/" });
    window.location.href = "/";
  };

  // Carga productos
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/products/user/${user.id}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  // Carga pedidos
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/orders/user/${user.id}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  // Avanzar estado del pedido
  const advanceStatus = (order) => {
    let newStatus = "";
    if (order.status === "PENDIENTE") newStatus = "ENVIADO";
    else if (order.status === "ENVIADO") newStatus = "ENTREGADO";
    else return;

    axios
      .put(`${import.meta.env.VITE_API_URL}/api/orders/update/${order.id}`, {
        status: newStatus,
      })
      .then(() =>
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
        )
      )
      .catch((err) => console.error(err));
  };

  // Métricas
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDIENTE").length;
  const sentOrders = orders.filter((o) => o.status === "ENVIADO").length;
  const deliveredOrders = orders.filter((o) => o.status === "ENTREGADO").length;
  const totalIncome = orders
    .filter((o) => o.status === "ENTREGADO")
    .reduce((sum, o) => sum + o.total, 0);
  const productsLowStock = products.filter((p) => p.stock < 5);

  // Colores para estados de pedidos
  const statusColors = {
    PENDIENTE: "#FFD27F",
    ENVIADO: "#D18B59",
    ENTREGADO: "#6B4226",
  };

  const ordersStatusData = [
    { name: "Pendiente", value: pendingOrders },
    { name: "Enviado", value: sentOrders },
    { name: "Entregado", value: deliveredOrders },
  ];

  // Carga info usuario
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/users/user/${user?.id}`)
      .then((response) => {
        const updatedUser = { ...user, img: response.data.avatar || user.img };
        cookies.set("user", updatedUser, { path: "/" });
        setUsers(response.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Chats en tiempo real con Firebase
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

            if (lastMsg.senderId !== userId && !lastMsg.readBy?.includes(userId)) {
              unreadFound = true;
              setHasUnread(true);
            } else if (!unreadFound) {
              setHasUnread(false);
            }

            setChats((prev) => {
              const other = prev.filter((c) => c.id !== chatData.id);
              return [...other, { ...chatData, lastMessage: lastMsg }];
            });
          } else {
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

  // Redirección si es comprador
  if (user.role === "COMPRADOR") {
    navigate("/");
  }

  return (
    <div>
      {/* HEADER */}
      <header className="border-bottom" style={{ backgroundColor: "#C77C57" }}>
        <nav className="navbar navbar-expand-lg w-75 mx-auto container">
          <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between w-100">
              {/* Logo */}
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

              {/* Usuario */}
              <div className="d-flex align-items-center">
                <div
                  className="links-Header shadow rounded d-flex justify-content-center align-items-center me-3"
                  onClick={() => setOpenMenu(!openMenu)}
                  style={{ height: "40px", cursor: "pointer" }}
                >
                  <>
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
                  </>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* MAIN */}
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

                <Link to="/sellerDashboard/products" className="text-decoration-none">
                  <h5 className="mx-2 sidebar-item" style={{ color: "#000000" }}>
                    Mis productos
                  </h5>
                </Link>

                <Link to="/sellerDashboard/orders" className="text-decoration-none">
                  <h5 className="mx-2 mt-3 sidebar-item" style={{ color: "#000000" }}>
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
            <div className="col-12 col-md-9">
              {/* Cards métricas */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card text-center shadow-sm p-3 mb-3 mb-md-0">
                    <h5>Total pedidos</h5>
                    <h3>{totalOrders}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div
                    className="card text-center shadow-sm p-3 mb-3 mb-md-0"
                    style={{ backgroundColor: "#FFD27F", color: "#4B2E1E" }}
                  >
                    <h5>Pendientes</h5>
                    <h3>{pendingOrders}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div
                    className="card text-center shadow-sm p-3 mb-3 mb-md-0"
                    style={{ backgroundColor: "#D18B59", color: "#FFF" }}
                  >
                    <h5>Enviados</h5>
                    <h3>{sentOrders}</h3>
                  </div>
                </div>
                <div className="col-md-3">
                  <div
                    className="card text-center shadow-sm p-3"
                    style={{ backgroundColor: "#6B4226", color: "#FFF" }}
                  >
                    <h5>Ingresos</h5>
                    <h3>{totalIncome} €</h3>
                  </div>
                </div>
              </div>

              {/* PieChart */}
              <div className="card p-3 shadow-sm mb-4">
                <h5 className="mb-3">Pedidos por estado</h5>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={ordersStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {ordersStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "Pendiente"
                              ? statusColors.PENDIENTE
                              : entry.name === "Enviado"
                              ? statusColors.ENVIADO
                              : statusColors.ENTREGADO
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Tabla pedidos recientes */}
              <div className="card p-3 shadow-sm mb-4">
                <h5 className="mb-3">Pedidos recientes</h5>
                <table className="table table-hover align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(-5).map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.total} €</td>
                        <td>
                          <button
                            className={`btn btn-sm ${
                              order.status === "PENDIENTE"
                                ? "btn-warning"
                                : order.status === "ENVIADO"
                                ? "btn-orange"
                                : "btn-success"
                            }`}
                            onClick={() => advanceStatus(order)}
                            disabled={order.status === "ENTREGADO"}
                            style={
                              order.status === "ENTREGADO"
                                ? { cursor: "not-allowed", opacity: 0.7 }
                                : {}
                            }
                          >
                            {order.status}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Productos con stock bajo */}
              {productsLowStock.length > 0 && (
                <div className="card p-3 shadow-sm mb-4">
                  <h5 className="mb-3 text-danger">Productos con stock bajo</h5>
                  <div className="d-flex flex-wrap gap-3">
                    {productsLowStock.map((p) => (
                      <div
                        key={p.id}
                        className="card p-2"
                        style={{ width: "120px" }}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="img-fluid rounded mb-2"
                        />
                        <p className="mb-0 text-truncate">{p.name}</p>
                        <small>Stock: {p.stock}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SellerDashboard;
