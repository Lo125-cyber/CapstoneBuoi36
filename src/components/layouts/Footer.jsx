import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="mt-16 bg-gray-100">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 py-10 sm:grid-cols-3">
                <div>
                    <h3 className="mb-3 font-bold">GET HELP</h3>
                    <p className="text-sm text-gray-600">Home</p>
                    <p className="text-sm text-gray-600">Contact</p>
                    <p className="text-sm text-gray-600">Support</p>
                </div>

                <div>
                    <h3 className="mb-3 font-bold">SUPPORT</h3>
                    <p className="text-sm text-gray-600">About us</p>
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-sm text-gray-600">Return policy</p>
                </div>

                <div>
                    <h3 className="mb-3 font-bold">REGISTER</h3>
                    <Link
                        to="/login"
                        className="text-sm text-gray-600 hover:text-purple-700"
                    >
                        Login
                    </Link>
                    <span>/</span>
                    <Link
                        to="/register"
                        className="text-sm text-gray-600 hover:text-purple-700"
                    >
                        Register
                    </Link>
                </div>
            </div>

            <div className="bg-gray-200 px-5 py-4 text-center text-sm text-gray-600">
                © 2026 CyberShop. Bảo lưu mọi quyền.
            </div>
        </footer>
    );
}
