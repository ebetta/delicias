import Layout from "./Layout.jsx";

import Home from "./Home";

import Products from "./Products";

import Admin from "./Admin";

import Cart from "./Cart";

import Orders from "./Orders";

import MyOrders from "./MyOrders";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext.jsx";

const PAGES = {
    
    Home: Home,
    
    Products: Products,
    
    Admin: Admin,
    
    Cart: Cart,
    
    Orders: Orders,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const { currentUser } = useAuth();
    const isAdmin = currentUser && currentUser.email === 'ebetta@gmail.com';
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/home" element={<Home />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/admin" element={isAdmin ? <Admin /> : <Navigate to="/home" />} />
                
                <Route path="/Cart" element={<Cart />} />
                
                <Route path="/Orders" element={<Orders />} />

                <Route path="/my-orders" element={<MyOrders />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}