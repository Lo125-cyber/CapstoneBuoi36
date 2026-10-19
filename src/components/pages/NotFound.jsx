import React from "react";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";

export default function NotFound() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="mx-auto max-w-3xl px-5 py-24 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-purple-700">
                    Lỗi 404
                </p>
                <h1 className="mt-3 text-3xl font-extrabold">
                    Không tìm thấy trang
                </h1>
                <p className="mt-3 text-gray-600">
                    Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
                >
                    Về trang chủ
                </Link>
            </main>
            <Footer />
        </div>
    );
}
