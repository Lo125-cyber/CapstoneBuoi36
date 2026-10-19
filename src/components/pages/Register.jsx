import React, { useState } from "react";
import { Button, ConfigProvider, Form, Input, Radio } from "antd";
import { useFormik } from "formik";
import * as Yup from "yup";
import { api } from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
export default function Register() {
    const navigate = useNavigate();
    const [notification, setNotification] = useState({ type: "", message: "" });
    const formRegister = useFormik({
        initialValues: {
            email: "",
            password: "",
            password_confirm: "",
            name: "",
            phone: "",
            gender: "",
        },
        onSubmit: async (values) => {
            try {
                const { password_confirm, ...dataToSend } = values;
                const res = await api.post("/Users/signup", dataToSend);
                setNotification({
                    type: "success",
                    message: res.data.message,
                });
                formRegister.resetForm();
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } catch (error) {
                console.log(error);
                setNotification({
                    type: "error",
                    message: error.response.data.message,
                });
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
            password_confirm: Yup.string()
                .required("Vui lòng xác nhận mật khẩu")
                .oneOf([Yup.ref("password")], "Mật khẩu nhập lại không khớp"),
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
    return (
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
            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-5xl mb-4">Register</h1>
                <p className="text-gray-500">
                    You already have an account?
                    <Link to="/login" className="text-blue-600">
                        {" "}
                        Return to login
                    </Link>
                </p>
                <div className="bg-gray-700 h-1 my-10"></div>
                <Form
                    className="w-full bg-gray-50 rounded-3xl shadow-lg"
                    name="basic"
                    initialValues={{ remember: true }}
                    autoComplete="off"
                    onFinish={formRegister.handleSubmit}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-40 p-5">
                        <div>
                            <Form.Item
                                layout="vertical"
                                label="Email"
                                name="email"
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
                                name="password"
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
                                    {...formRegister.getFieldProps("password")}
                                />
                            </Form.Item>
                            <Form.Item
                                layout="vertical"
                                label="Password confirm"
                                name="password_confirm"
                                validateStatus={
                                    formRegister.touched.password_confirm &&
                                    formRegister.errors.password_confirm
                                        ? "error"
                                        : ""
                                }
                                help={
                                    formRegister.touched.password_confirm &&
                                    formRegister.errors.password_confirm
                                }
                            >
                                <Input.Password
                                    size="large"
                                    placeholder="••••••••"
                                    {...formRegister.getFieldProps(
                                        "password_confirm",
                                    )}
                                />
                            </Form.Item>
                        </div>
                        <div>
                            <Form.Item
                                layout="vertical"
                                label="Name"
                                name="name"
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
                                name="phone"
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
                                    onChange={(e) =>
                                        formRegister.setFieldValue(
                                            "gender",
                                            e.target.value,
                                        )
                                    }
                                    {...formRegister.getFieldProps("gender")}
                                >
                                    <Radio value="true"> Male </Radio>
                                    <Radio value="false"> Female </Radio>
                                </Radio.Group>
                            </Form.Item>
                            {notification.message && (
                                <div
                                    className={`p-4 my-5 text-sm rounded-lg ${notification.type === "error" ? "bg-red-50 text-red-800 dark:bg-gray-800 dark:text-red-400 border border-red-300" : "bg-green-50 text-green-800 dark:bg-gray-800 dark:text-green-400 border border-green-300"}`}
                                >
                                    {notification.message}
                                </div>
                            )}
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
                                    SUBMIT
                                </Button>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );
}
