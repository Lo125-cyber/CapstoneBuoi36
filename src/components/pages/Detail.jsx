import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import {
    addToCart,
    fetchFavoriteProducts,
    fetchProductById,
    toggleFavoriteProduct,
} from "../../features/products/productSlice";

export default function Detail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        selectedProduct,
        detailLoading,
        detailError,
        favoriteItems,
        favoritesLoaded,
    } = useSelector((state) => state.products);

    const [isAuthenticated, setIsAuthenticated] = useState(
        () =>
            typeof window !== "undefined" &&
            Boolean(window.localStorage.getItem("accessToken")),
    );

    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) dispatch(fetchProductById(id));

        const token =
            typeof window !== "undefined"
                ? window.localStorage.getItem("accessToken")
                : null;
        setIsAuthenticated(Boolean(token));

        if (token && !favoritesLoaded) {
            dispatch(fetchFavoriteProducts());
        }
    }, [dispatch, id, favoritesLoaded]);

    useEffect(() => {
        if (
            Array.isArray(selectedProduct?.size) &&
            selectedProduct.size.length > 0
        ) {
            setSelectedSize(selectedProduct.size[0]);
        } else {
            setSelectedSize(null);
        }
        setQuantity(1);
    }, [selectedProduct]);

    const isFavorite = useMemo(() => {
        if (!selectedProduct) return false;
        return favoriteItems.some(
            (item) => String(item.id) === String(selectedProduct.id),
        );
    }, [favoriteItems, selectedProduct]);

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            message.warning(
                "Vui lòng đăng nhập để thêm vào danh sách yêu thích!",
            );
            navigate("/login");
            return;
        }
        if (!selectedProduct) return;

        try {
            await dispatch(
                toggleFavoriteProduct({
                    product: selectedProduct,
                    isLiked: !isFavorite,
                }),
            ).unwrap();
        } catch (err) {
            console.error("Lỗi khi cập nhật yêu thích:", err);
        }
    };

    const handleBuyNow = () => {
        if (!selectedProduct) return;
        dispatch(
            addToCart({
                product: selectedProduct,
                quantity: quantity,
                size: selectedSize,
            }),
        );
        message.success(
            `Đã thêm ${quantity} "${selectedProduct.name}" vào giỏ hàng!`,
        );
    };

    if (detailLoading || (!selectedProduct && !detailError)) {
        return (
            <div className="min-h-screen">
                <Header />
                <main
                    className="mx-auto max-w-7xl px-5 py-24 text-center"
                    aria-live="polite"
                >
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-purple-700" />
                    <p className="text-lg font-medium">
                        Đang tải thông tin sản phẩm...
                    </p>
                </main>
                <Footer />
            </div>
        );
    }

    if (detailError || !selectedProduct) {
        return (
            <div className="min-h-screen">
                <Header />
                <main className="mx-auto max-w-7xl px-5 py-20 text-center">
                    <h1 className="text-2xl font-bold">
                        Không thể tải sản phẩm
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-red-600">
                        {detailError || "Không tìm thấy sản phẩm này."}
                    </p>
                    <Link
                        to="/"
                        className="mt-6 inline-block rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
                    >
                        Quay về trang chủ
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const product = selectedProduct;
    const sizes = Array.isArray(product.size) ? product.size : [];
    const price = Number(product.price);

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="mx-auto max-w-7xl px-5 py-8 md:py-12">
                <Link
                    to="/"
                    className="text-sm font-medium text-purple-700 hover:underline"
                >
                    ← Quay về danh sách sản phẩm
                </Link>

                <div className="mt-7 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                    <div className="relative flex min-h-80 items-center justify-center rounded-2xl bg-gray-50 p-6 md:p-10">
                        <img
                            src={product.image || "/product-placeholder.svg"}
                            alt={product.name || "Hình ảnh sản phẩm"}
                            className="max-h-[450px] w-full object-contain"
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src =
                                    "/product-placeholder.svg";
                            }}
                        />

                        <button
                            type="button"
                            onClick={handleToggleFavorite}
                            className={`absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-2xl shadow-md transition hover:scale-110 active:scale-95 ${
                                isFavorite
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-400"
                            }`}
                            title={
                                isFavorite
                                    ? "Bỏ khỏi danh sách yêu thích"
                                    : "Thêm vào danh sách yêu thích"
                            }
                        >
                            {isFavorite ? "♥" : "♡"}
                        </button>
                    </div>

                    <section className="py-2">
                        <p className="text-sm font-semibold uppercase tracking-widest text-purple-700">
                            CyberShop Collection
                        </p>
                        <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
                            {product.name}
                        </h1>
                        <p className="mt-5 text-3xl font-extrabold text-red-600">
                            {Number.isFinite(price)
                                ? price.toLocaleString("vi-VN")
                                : "Liên hệ"}{" "}
                            {Number.isFinite(price) ? "$" : ""}
                        </p>

                        <div className="mt-6 border-t border-gray-200 pt-5">
                            <h2 className="font-bold">Mô tả sản phẩm</h2>
                            <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
                                {product.description ||
                                    product.shortDescription ||
                                    "Thông tin mô tả sản phẩm đang được cập nhật."}
                            </p>
                        </div>

                        {sizes.length > 0 && (
                            <div className="mt-6">
                                <h2 className="font-bold">Kích thước</h2>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {sizes.map((size) => {
                                        const isSelected =
                                            selectedSize === size;
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedSize(size)
                                                }
                                                className={`cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition ${
                                                    isSelected
                                                        ? "border-black bg-black text-white"
                                                        : "border-gray-300 bg-white text-gray-800 hover:border-black"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {isAuthenticated && (
                            <div className="mt-6">
                                <h2 className="font-bold">Số lượng</h2>
                                <div className="mt-3 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.max(1, q - 1),
                                            )
                                        }
                                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-gray-300 font-bold hover:bg-gray-100"
                                    >
                                        -
                                    </button>
                                    <span className="min-w-8 text-center text-lg font-semibold">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((q) => q + 1)
                                        }
                                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-gray-300 font-bold hover:bg-gray-100"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex flex-wrap gap-4">
                            {isAuthenticated ? (
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-shop-yellow px-7 py-3.5 font-bold text-black transition hover:bg-amber-400 sm:w-auto"
                                >
                                    Thêm vào giỏ hàng
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="inline-flex w-full items-center justify-center rounded-lg bg-shop-yellow px-7 py-3.5 font-bold text-black transition hover:bg-amber-400 sm:w-auto"
                                >
                                    Đăng nhập để mua hàng
                                </Link>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
