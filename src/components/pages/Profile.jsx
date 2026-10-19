import React, { useEffect, useMemo, useState } from "react";
import { Button, ConfigProvider, Form, Input, Radio, Table } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api } from "../../api/axios";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../store/authStore";
import { useSelector, useDispatch } from "react-redux";
import Favourite from "../layouts/Favourite";
import OrderHistory from "../layouts/OrderHistory";
import { fetchUserProfile } from "../../features/products/productSlice";
export default function Profile() {
    const dispatch = useDispatch();
    const { userProfile, profileLoading } = useSelector(
        (state) => state.products,
    );
    const [activeTab, setActiveTab] = useState("history");
    const { getInfo, userInfo, isCheckingAuth } = useAuth();
    const [notification, setNotification] = useState({ type: "", message: "" });
    const { favoriteItems } = useSelector((state) => state.products);
    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);
    const ordersHistory = userProfile?.ordersHistory || [];
    useEffect(() => {
        getInfo();
    }, []);
    // const dataSource = useMemo(() => {
    //     return favoriteItems.map((item) => {
    //         const key = item.cartKey || String(item.id);
    //         return {
    //             ...item,
    //             key,
    //             id: item.id,
    //             img: item.image || "/product-placeholder.svg",
    //             name: item.selectedSize
    //                 ? `${item.name} (Size ${item.selectedSize})`
    //                 : item.name,
    //         };
    //     });
    // }, [favoriteItems]);
    const dataSource = useMemo(() => {
        return (favoriteItems || []).map((item) => ({
            ...item,
            key: String(item.id),
            id: item.id,
            img: item.image || item.img || "/product-placeholder.svg",
            name: item.name || item.productName || "Sản phẩm chưa có tên",
            price: Number(item.price) || 0,
        }));
    }, [favoriteItems]);
    const formRegister = useFormik({
        enableReinitialize: true,
        initialValues: {
            email: userInfo?.email || "",
            password: userInfo?.password || "",
            name: userInfo?.name || "",
            phone: userInfo?.phone || "",
            gender: String(userInfo?.gender) || "true",
        },
        onSubmit: async (values) => {
            try {
                const { password_confirm, ...dataToSend } = values;
                const res = await api.post("/Users/updateProfile", dataToSend);
                console.log(res);
                setNotification({
                    type: "success",
                    message: res.data.content,
                });
                setTimeout(() => {
                    setNotification({ type: "", message: "" });
                }, 2000);
            } catch (error) {
                console.log(error);
                setNotification({
                    type: "error",
                    message: error.response.data.content,
                });
                setTimeout(() => {
                    setNotification({ type: "", message: "" });
                }, 2000);
            }
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .trim()
                .required("Email không được bỏ trống")
                .email("Email phải đúng định dạng (VD: adc@gmail.com)"),
            password: Yup.string()
                .required("Mật khẩu không được bỏ trống")
                .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
                .matches(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ hoa")
                .matches(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ thường")
                .matches(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
                .matches(
                    /[^A-Za-z0-9]/,
                    "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
                ),
            name: Yup.string()
                .required("Tên không được bỏ trống")
                .trim()
                .matches(
                    /^[\p{L}0-9\s]{2,50}$/u,
                    "Tên từ 2-50 ký tự, không chứa ký tự đặc biệt",
                ),
            phone: Yup.string()
                .required("Số điện thoại không được bỏ trống")
                .trim()
                .matches(
                    /^[0-9]{10}$/,
                    "Số điện thoại phải gồm đúng 10 chữ số",
                ),
            gender: Yup.string()
                .oneOf(["true", "false"], "Vui lòng chọn giới tính hợp lệ")
                .required("Giới tính không được bỏ trống"),
        }),
    });
    if (isCheckingAuth) {
        return <div className="loading-screen">Đang xác thực thông tin...</div>;
    }
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div>
            <Header />
            <h1 className="bg-indigo-700 text-white mt-4 w-60 text-2xl p-2">
                Profile
            </h1>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: "#550de4",
                        controlHeight: 42,
                    },
                    components: {
                        Form: {
                            labelFontSize: 16,
                        },
                    },
                }}
            >
                <div className="w-full mx-auto px-8 py-6">
                    <Form
                        className="w-full"
                        name="basic"
                        initialValues={{ remember: true }}
                        autoComplete="off"
                        onFinish={formRegister.handleSubmit}
                    >
                        <div className="grid grid-cols-6 md:grid-cols-12 gap-x-20 p-5">
                            <div className="col-span-2 flex justify-center w-full">
                                <img
                                    src="https://i.pravatar.cc/100"
                                    alt=""
                                    className="w-50 h-50 object-cover rounded-full shadow-lg"
                                />
                            </div>
                            <div className="col-span-5">
                                <Form.Item
                                    layout="vertical"
                                    label="Email"
                                    validateStatus={
                                        formRegister.touched.email &&
                                        formRegister.errors.email
                                            ? "error"
                                            : ""
                                    }
                                    help={
                                        formRegister.touched.email &&
                                        formRegister.errors.email
                                    }
                                >
                                    <Input
                                        size="large"
                                        placeholder="example@gmail.com"
                                        {...formRegister.getFieldProps("email")}
                                    />
                                </Form.Item>

                                <Form.Item
                                    layout="vertical"
                                    label="Password"
                                    validateStatus={
                                        formRegister.touched.password &&
                                        formRegister.errors.password
                                            ? "error"
                                            : ""
                                    }
                                    help={
                                        formRegister.touched.password &&
                                        formRegister.errors.password
                                    }
                                >
                                    <Input.Password
                                        size="large"
                                        placeholder="••••••••"
                                        {...formRegister.getFieldProps(
                                            "password",
                                        )}
                                    />
                                </Form.Item>
                            </div>
                            <div className="col-span-5">
                                <Form.Item
                                    layout="vertical"
                                    label="Name"
                                    validateStatus={
                                        formRegister.touched.name &&
                                        formRegister.errors.name
                                            ? "error"
                                            : ""
                                    }
                                    help={
                                        formRegister.touched.name &&
                                        formRegister.errors.name
                                    }
                                >
                                    <Input
                                        size="large"
                                        placeholder="Nguyễn Văn A"
                                        {...formRegister.getFieldProps("name")}
                                    />
                                </Form.Item>
                                <Form.Item
                                    layout="vertical"
                                    label="Phone"
                                    validateStatus={
                                        formRegister.touched.phone &&
                                        formRegister.errors.phone
                                            ? "error"
                                            : ""
                                    }
                                    help={
                                        formRegister.touched.phone &&
                                        formRegister.errors.phone
                                    }
                                >
                                    <Input
                                        size="large"
                                        placeholder="0901234567"
                                        {...formRegister.getFieldProps("phone")}
                                    />
                                </Form.Item>
                                <div className="flex justify-between items-center">
                                    <Form.Item
                                        label="Gender"
                                        layout="vertical"
                                        validateStatus={
                                            formRegister.touched.gender &&
                                            formRegister.errors.gender
                                                ? "error"
                                                : ""
                                        }
                                        help={
                                            formRegister.touched.gender &&
                                            formRegister.errors.gender
                                        }
                                    >
                                        <Radio.Group
                                            className="flex items-center gap-6"
                                            value={formRegister.values.gender}
                                            onChange={(e) =>
                                                formRegister.setFieldValue(
                                                    "gender",
                                                    e.target.value,
                                                )
                                            }
                                            {...formRegister.getFieldProps(
                                                "gender",
                                            )}
                                        >
                                            <Radio value="true"> Male </Radio>
                                            <Radio value="false">
                                                {" "}
                                                Female{" "}
                                            </Radio>
                                        </Radio.Group>
                                    </Form.Item>

                                    <Form.Item
                                        label={null}
                                        className="mt-10 flex justify-start "
                                    >
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            className="px-10 w-40"
                                            style={{
                                                borderRadius: "5rem",
                                                boxShadow: "0px 3px 3px gray",
                                            }}
                                        >
                                            Update
                                        </Button>
                                    </Form.Item>
                                </div>
                                {notification.message && (
                                    <div
                                        className={`p-4 text-sm rounded-lg ${notification.type === "error" ? "bg-red-50 text-red-800 dark:bg-gray-800 dark:text-red-400 border border-red-300" : "bg-green-50 text-green-800 dark:bg-gray-800 dark:text-green-400 border border-green-300"}`}
                                    >
                                        {notification.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Form>
                </div>
            </ConfigProvider>
            <div className="container mx-auto w-7xl">
                <div className="bg-gray-200 h-1 mb-4"></div>

                <div className="flex gap-8 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`cursor-pointer pb-3 text-xl font-bold transition-all duration-300 ${
                            activeTab === "history"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 hover:text-blue-500"
                        }`}
                    >
                        Order history
                    </button>

                    <button
                        onClick={() => setActiveTab("favourite")}
                        className={`cursor-pointer pb-3 text-xl font-bold transition-all duration-300 ${
                            activeTab === "favourite"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-500 hover:text-blue-500"
                        }`}
                    >
                        Favourite
                    </button>
                </div>

                <div className="py-6">
                    {activeTab === "history" && (
                        <div>
                            <OrderHistory dataSource={ordersHistory} />
                        </div>
                    )}

                    {activeTab === "favourite" && (
                        <Favourite dataSource={dataSource} />
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
