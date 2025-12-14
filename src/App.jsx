import { Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import "./css/home.css"
import Login from "./components/Login"
import Register from "./components/Register"
import Shop from "./components/Shop"
import SellerDashboard from "./components/SellerDashboard"
import SellerOrders from "./components/SellerOrders"
import SellerProducts from "./components/SellerProducts"
import AddProduct from "./components/AddProduct"
import Product from "./components/Product"
import Cart from "./components/Cart"
import Address from "./components/Address"
import Payment from "./components/Payment"
import Profile from "./components/Profile"
import ProfileSeller from "./components/ProfileSeller"
import PrivacyPolicy from "./components/PrivacyPolicy"
import AboutUs from "./components/AboutUs"
import Contact from "./components/Contact"
import FAQ from "./components/FAQ"
import Chat from "./components/Chat"
import SellerChats from "./components/SellerChats"



function App() {

  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/shop" element={<Shop/>}/>
      <Route path="/cart" element={<Cart/>}/>
      <Route path="/cart/address" element={<Address/>}/>
      <Route path="/cart/payment" element={<Payment/>}/>
      <Route path="/product/:id" element={<Product/>}/>
      <Route path="/sellerDashboard" element={<SellerDashboard/>}/>
      <Route path="/sellerDashboard/orders" element={<SellerOrders/>}/>
      <Route path="/sellerDashboard/products" element={<SellerProducts/>}/>
      <Route path="/sellerDashboard/add" element={<AddProduct/>}/>
      <Route path="/profile/:id" element={<Profile/>}/>
      <Route path="/sellerDashboard/profile/:id" element={<ProfileSeller/>}/>
      <Route path="/privacyPolicy" element={<PrivacyPolicy/>}/>
      <Route path="/aboutUs" element={<AboutUs/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="/faq" element={<FAQ/>}/>
      <Route path="/chat/:chatId" element={<Chat/>}/>
      <Route path="/sellerDashboard/chats" element={<SellerChats/>}/>
    </Routes>
  )
}

export default App
