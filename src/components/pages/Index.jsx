import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../layouts/ProductCard";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import {
    fetchFavoriteProducts,
    fetchProducts,
    toggleFavoriteProduct,
} from "../../features/products/productSlice";

export default function Index() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        items,
        loading,
        error,
        favoriteItems,
        favoritesLoading,
        favoritesLoaded,
        favoritesError,
    } = useSelector((state) => state.products);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const [isAuthenticated, setIsAuthenticated] = useState(
        () =>
            typeof window !== "undefined" &&
            Boolean(window.localStorage.getItem("accessToken")),
    );

    useEffect(() => {
        dispatch(fetchProducts());
        if (localStorage.getItem("accessToken")) {
            dispatch(fetchFavoriteProducts());
        }
    }, [dispatch]);

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return items.filter((product) =>
            String(product.name || "")
                .toLowerCase()
                .includes(keyword),
        );
    }, [items, search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            const section = document.getElementById("products");
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const favoriteIdSet = useMemo(
        () => new Set(favoriteItems.map((product) => String(product.id))),
        [favoriteItems],
    );

    const favoriteProducts = useMemo(() => {
        const seen = new Set();
        const fullProductMap = new Map(
            items.map((item) => [String(item.id), item]),
        );

        return favoriteItems
            .filter((product) => {
                const key = String(product.id ?? product.name);
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map((favProduct) => {
                const fullInfo = fullProductMap.get(String(favProduct.id));
                return fullInfo
                    ? {
                          ...fullInfo,
                          ...favProduct,
                          price: fullInfo.price,
                          shortDescription: fullInfo.shortDescription,
                      }
                    : favProduct;
            });
    }, [favoriteItems, items]);

    const handleToggleFavorite = async (product, nextLikedState) => {
        const token =
            typeof window !== "undefined"
                ? window.localStorage.getItem("accessToken")
                : null;

        if (!token) {
            alert(
                "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!",
            );
            navigate("/login");
            return;
        }

        try {
            await dispatch(
                toggleFavoriteProduct({
                    product,
                    isLiked: nextLikedState,
                }),
            ).unwrap();
        } catch (err) {
            console.error("Lỗi khi cập nhật yêu thích:", err);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <main className="mx-auto max-w-7xl px-5 py-8">
                <section className="rounded-xl bg-shop-yellow px-6 py-10 md:px-12 md:py-14">
                    <p className="text-sm font-bold uppercase tracking-widest">
                        CyberShop
                    </p>
                    <h1 className="mt-3 text-3xl font-black md:text-5xl">
                        TÌM KIẾM GIÀY THỂ THAO PHÙ HỢP VỚI BẠN
                    </h1>
                    <p className="mt-4 max-w-xl text-gray-700">
                        Khám phá bộ sưu tập giày thể thao và lựa chọn phong cách
                        phù hợp với bạn.
                    </p>
                    <a
                        href="#products"
                        className="mt-6 inline-block rounded bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        Khám phá ngay
                    </a>
                </section>

                <section id="products" className="scroll-mt-24 pt-10">
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-2xl font-bold">
                                Product Feature
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Tìm kiếm sản phẩm và xem trạng thái yêu thích
                                của tài khoản.
                            </p>
                        </div>

                        <div className="relative w-full md:max-w-sm">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Nhập tên sản phẩm..."
                                aria-label="Tìm kiếm sản phẩm"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                            />
                            <span
                                className="absolute right-4 top-3 text-xl"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>
                        </div>
                    </div>

                    {!loading && !error && (
                        <p className="mb-5 text-sm text-gray-500">
                            Tìm thấy {filteredProducts.length} sản phẩm
                            {totalPages > 1 &&
                                ` (Trang ${currentPage}/${totalPages})`}
                        </p>
                    )}

                    {loading && (
                        <div className="py-20 text-center">
                            <p className="text-lg font-medium">
                                Đang tải sản phẩm...
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                            <p className="text-red-600">{String(error)}</p>
                            <button
                                onClick={() => dispatch(fetchProducts())}
                                className="mt-4 rounded bg-black px-5 py-2 text-white hover:bg-gray-800"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className="rounded-lg bg-gray-50 py-16 text-center">
                            <p className="text-lg font-semibold">
                                Không tìm thấy sản phẩm
                            </p>
                            <p className="mt-2 text-gray-500">
                                Hãy thử từ khóa khác.
                            </p>
                            <button
                                onClick={() => setSearch("")}
                                className="mt-4 text-purple-700 underline"
                            >
                                Xóa tìm kiếm
                            </button>
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {paginatedProducts.map((product) => (
                                    <ProductCard
                                        key={
                                            product.id ??
                                            `${product.name}-${product.price}`
                                        }
                                        product={product}
                                        isFavorite={favoriteIdSet.has(
                                            String(product.id),
                                        )}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <nav
                                    aria-label="Pagination"
                                    className="mt-10 flex items-center justify-center gap-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 1}
                                        className="cursor-pointer flex h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        ← Trước
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            { length: totalPages },
                                            (_, index) => {
                                                const pageNum = index + 1;
                                                const isActive =
                                                    currentPage === pageNum;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        type="button"
                                                        onClick={() =>
                                                            handlePageChange(
                                                                pageNum,
                                                            )
                                                        }
                                                        className={`cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition ${
                                                            isActive
                                                                ? "bg-black text-white shadow-sm"
                                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            },
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={currentPage === totalPages}
                                        className="cursor-pointer flex h-10 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Sau →
                                    </button>
                                </nav>
                            )}
                        </>
                    )}
                </section>

                <section
                    id="favorites"
                    className="mt-12 scroll-mt-24 border-t border-gray-100 pt-12"
                >
                    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-red-500">
                                Your collection
                            </p>
                            <h2 className="mt-1 text-2xl font-bold">
                                ♥ Sản phẩm yêu thích
                            </h2>
                            <p className="mt-1 text-sm text-gray-500"></p>
                        </div>
                        {isAuthenticated && (
                            <button
                                onClick={() =>
                                    dispatch(fetchFavoriteProducts())
                                }
                                disabled={favoritesLoading}
                                className="self-start rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:border-red-400 hover:text-red-600 disabled:opacity-50 sm:self-auto"
                            >
                                {favoritesLoading
                                    ? "Đang làm mới..."
                                    : "Làm mới danh sách"}
                            </button>
                        )}
                    </div>

                    {!isAuthenticated && (
                        <div className="rounded-xl bg-gray-50 px-6 py-10 text-center">
                            <p className="text-lg font-semibold">
                                Đăng nhập để xem danh sách yêu thích
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                API này cần access token của tài khoản hiện tại.
                            </p>
                            <Link
                                to="/login"
                                className="mt-5 inline-block rounded-lg bg-[#111111] px-5 py-3 font-semibold text-white transition hover:bg-yellow-400 hover:text-black"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    )}

                    {isAuthenticated && favoritesLoading && (
                        <div className="rounded-xl bg-gray-50 py-12 text-center text-gray-600">
                            Đang tải danh sách yêu thích...
                        </div>
                    )}

                    {isAuthenticated && !favoritesLoading && favoritesError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                            <p className="text-sm text-red-700">
                                {String(favoritesError)}
                            </p>
                            <button
                                onClick={() =>
                                    dispatch(fetchFavoriteProducts())
                                }
                                className="mt-3 rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                            >
                                Thử tải lại
                            </button>
                        </div>
                    )}

                    {isAuthenticated &&
                        favoritesLoaded &&
                        !favoritesLoading &&
                        !favoritesError &&
                        favoriteProducts.length === 0 && (
                            <div className="rounded-xl bg-gray-50 px-6 py-10 text-center">
                                <p className="text-lg font-semibold">
                                    Danh sách yêu thích đang trống
                                </p>
                                <p className="mt-2 text-sm text-gray-500">
                                    Hãy bấm vào biểu tượng trái tim trên sản
                                    phẩm để thêm vào bộ sưu tập.
                                </p>
                            </div>
                        )}

                    {isAuthenticated &&
                        !favoritesLoading &&
                        !favoritesError &&
                        favoriteProducts.length > 0 && (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {favoriteProducts.map((product) => (
                                    <ProductCard
                                        key={
                                            product.id ??
                                            `${product.name}-${product.price}`
                                        }
                                        product={product}
                                        isFavorite={true}
                                        onToggleFavorite={handleToggleFavorite}
                                    />
                                ))}
                            </div>
                        )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
