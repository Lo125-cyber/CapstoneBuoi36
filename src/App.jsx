import "./App.css";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/layouts/AuthLayout";
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import MainLayout from "./components/layouts/MainLayout";
import Cart from "./components/pages/Cart";
import Profile from "./components/pages/Profile";
import Detail from "./components/pages/Detail";
import NotFound from "./components/pages/NotFound";
import Index from "./components/pages/Index";

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route path="profile" element={<Profile />} />
                <Route path="cart" element={<Cart />} />
                <Route path="detail/:id" element={<Detail />} />
            </Route>
            {/* login and register */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
