import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, loginWithFacebook } from "../../features/auth/authSlice";
import {
    initializeFacebookSdk,
    isFacebookConfigured,
    requestFacebookAccessToken,
} from "../../api/facebookAuth";

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, facebookLoading, error } = useSelector(
        (state) => state.auth,
    );

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [facebookSdkStatus, setFacebookSdkStatus] = useState(
        isFacebookConfigured() ? "loading" : "missing",
    );

    useEffect(() => {
        if (!isFacebookConfigured()) {
            setFacebookSdkStatus("missing");
            return undefined;
        }

        let cancelled = false;
        initializeFacebookSdk()
            .then(() => {
                if (!cancelled) setFacebookSdkStatus("ready");
            })
            .catch((sdkError) => {
                if (!cancelled) {
                    setFacebookSdkStatus("error");
                    setMessage(
                        sdkError?.message || "Không thể khởi tạo Facebook SDK.",
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        if (!email.trim() || !password) {
            setMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }

        try {
            await dispatch(
                loginUser({ email: email.trim(), password }),
            ).unwrap();
            navigate("/");
        } catch (loginError) {
            setMessage(
                typeof loginError === "string"
                    ? loginError
                    : loginError?.message ||
                          "Đăng nhập thất bại. Vui lòng kiểm tra thông tin.",
            );
        }
    };

    const handleFacebookLogin = async () => {
        setMessage("");

        if (!isFacebookConfigured()) {
            setMessage(
                "Chưa cấu hình VITE_FACEBOOK_APP_ID trong file .env.local. Xem hướng dẫn trong README.md.",
            );
            return;
        }

        if (facebookSdkStatus !== "ready") {
            setMessage(
                facebookSdkStatus === "loading"
                    ? "Facebook SDK đang tải, vui lòng đợi một chút rồi thử lại."
                    : "Facebook SDK chưa sẵn sàng. Hãy kiểm tra cấu hình App ID và tải lại trang.",
            );
            return;
        }

        try {
            const facebookAccessToken = await requestFacebookAccessToken();
            await dispatch(loginWithFacebook(facebookAccessToken)).unwrap();
            navigate("/");
        } catch (loginError) {
            setMessage(
                typeof loginError === "string"
                    ? loginError
                    : loginError?.message ||
                          "Không thể đăng nhập bằng Facebook. Vui lòng thử lại.",
            );
        }
    };

    const busy = loading || facebookLoading;

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-[#111111] px-6 py-5 text-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link to="/" className="text-2xl font-extrabold">
                        CYBER<span className="text-yellow-400">SHOP</span>
                    </Link>
                    <Link to="/" className="text-sm hover:text-yellow-400">
                        ← Quay lại cửa hàng
                    </Link>
                </div>
            </header>

            <main className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4 py-10">
                <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                    <h1 className="mb-2 text-center text-3xl font-bold">
                        Đăng nhập
                    </h1>
                    <p className="mb-7 text-center text-gray-500">
                        Chào mừng bạn quay lại CyberShop!
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder="Nhập email của bạn"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold"
                            >
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Nhập mật khẩu"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                                required
                            />
                        </div>

                        {(message || error) && (
                            <p
                                role="alert"
                                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                            >
                                {message || error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={busy}
                            className="cursor-pointer w-full rounded-lg bg-[#111111] px-4 py-3 font-bold text-white transition hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
                        </button>
                    </form>

                    <div
                        className="my-5 flex items-center gap-3"
                        aria-hidden="true"
                    >
                        <span className="h-px flex-1 bg-gray-200" />
                        <span className="text-xs uppercase tracking-wider text-gray-400">
                            hoặc
                        </span>
                        <span className="h-px flex-1 bg-gray-200" />
                    </div>

                    <button
                        type="button"
                        onClick={handleFacebookLogin}
                        // disabled={
                        //     busy ||
                        //     !isFacebookConfigured() ||
                        //     facebookSdkStatus !== "ready"
                        // }
                        title={
                            !isFacebookConfigured()
                                ? "Cần cấu hình VITE_FACEBOOK_APP_ID trong .env.local"
                                : facebookSdkStatus === "loading"
                                  ? "Đang tải Facebook SDK"
                                  : "Tiếp tục với Facebook"
                        }
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#1877F2] px-4 py-3 font-semibold text-white transition hover:bg-[#1666cf] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-lg font-black leading-none text-[#1877F2]">
                            f
                        </span>
                        {facebookLoading
                            ? "Đang xác thực Facebook..."
                            : facebookSdkStatus === "loading"
                              ? "Đang tải Facebook..."
                              : "Tiếp tục với Facebook"}
                    </button>

                    {facebookSdkStatus === "error" && (
                        <p className="mt-3 text-xs leading-5 text-amber-700">
                            Không thể khởi tạo Facebook SDK. Kiểm tra App ID,
                            cấu hình đăng nhập trên Meta và kết nối mạng, sau đó
                            tải lại trang.
                        </p>
                    )}

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Chưa có tài khoản?{" "}
                        <Link to="/register">
                            <span className="font-semibold text-purple-700">
                                Đăng ký
                            </span>
                        </Link>
                    </p>
                </section>
            </main>
        </div>
    );
}
