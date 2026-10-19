import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ProductCard({
    product,
    isFavorite = false,
    onToggleFavorite,
}) {
    const id = product?.id;
    const name = product?.name || "Sản phẩm";
    const image = product?.image || "/product-placeholder.svg";
    const price = Number(product?.price);
    const description =
        product?.shortDescription ||
        product?.description ||
        "Giày thể thao chính hãng";

    const [liked, setLiked] = useState(isFavorite);

    useEffect(() => {
        setLiked(isFavorite);
    }, [isFavorite]);

    const handleFavoriteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const nextState = !liked;
        setLiked(nextState);
        if (onToggleFavorite) {
            onToggleFavorite(product, nextState);
        }
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative h-56 overflow-hidden bg-gray-50">
                <Link
                    to={`/detail/${id}`}
                    aria-label={`Xem chi tiết ${name}`}
                    className="flex h-full w-full items-center justify-center p-5"
                >
                    <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                                "/product-placeholder.svg";
                        }}
                    />
                </Link>

                <button
                    type="button"
                    onClick={handleFavoriteClick}
                    className={`absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 text-2xl shadow-sm transition hover:scale-110 active:scale-95 ${
                        liked
                            ? "text-red-500"
                            : "text-gray-400 hover:text-red-400"
                    }`}
                    aria-label={
                        liked
                            ? "Bỏ khỏi danh sách yêu thích"
                            : "Thêm vào danh sách yêu thích"
                    }
                    title={liked ? "Đã yêu thích" : "Thêm vào yêu thích"}
                >
                    {liked ? "♥" : "♡"}
                </button>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <Link
                    to={`/detail/${id}`}
                    className="line-clamp-2 font-bold hover:text-purple-700"
                >
                    {name}
                </Link>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                    {description}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="font-bold text-red-600">
                        {Number.isFinite(price)
                            ? price.toLocaleString("vi-VN")
                            : "Liên hệ"}
                        {Number.isFinite(price) ? " $" : ""}
                    </span>
                    <Link
                        to={`/detail/${id}`}
                        className="shrink-0 rounded-md bg-shop-yellow px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                    >
                        Chi tiết
                    </Link>
                </div>
            </div>
        </article>
    );
}
