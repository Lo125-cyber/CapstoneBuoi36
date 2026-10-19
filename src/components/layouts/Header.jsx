import React, { useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearFavoriteProducts } from "../../features/products/productSlice";

const navClass = ({ isActive }) =>
    isActive
        ? "font-semibold text-shop-yellow"
        : "transition hover:text-shop-yellow";

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector((state) => state.products?.cartItems || []);

    const isAuthenticated =
        typeof window !== "undefined" &&
        Boolean(window.localStorage.getItem("accessToken"));

    const totalQuantity = useMemo(
        () =>
            cartItems.reduce(
                (sum, item) => sum + (Number(item.quantity) || 0),
                0,
            ),
        [cartItems],
    );

    const handleLogout = () => {
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("userLogin");
        dispatch(clearFavoriteProducts());
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-30 bg-[#111111] text-white shadow-sm">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
                <Link
                    to="/"
                    aria-label="CyberShop - Trang chủ"
                    className="text-2xl font-extrabold tracking-wide"
                >
                    CYBER<span className="text-shop-yellow">SHOP</span>
                </Link>

                <nav
                    aria-label="Điều hướng chính"
                    className="flex items-center gap-5 text-sm sm:gap-7"
                >
                    <NavLink to="/" end className={navClass}>
                        Trang chủ
                    </NavLink>
                    <a
                        href="/#products"
                        className="transition hover:text-shop-yellow"
                    >
                        Sản phẩm
                    </a>
                    <a
                        href="/#favorites"
                        className="transition hover:text-shop-yellow"
                    >
                        ♥ Yêu thích
                    </a>

                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            `relative flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                                isActive
                                    ? "bg-shop-yellow text-black"
                                    : "bg-white/10 text-white hover:bg-shop-yellow hover:text-black"
                            }`
                        }
                        aria-label={`Giỏ hàng có ${totalQuantity} sản phẩm`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                        <span>({totalQuantity})</span>
                    </NavLink>
                    <NavLink to="/profile" className={navClass}>
                        Hồ sơ
                    </NavLink>

                    {isAuthenticated ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="cursor-pointer text-gray-300 transition hover:text-red-400"
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <NavLink to="/login" className={navClass}>
                            Đăng nhập
                        </NavLink>
                    )}
                </nav>
            </div>
        </header>
    );
}
