import React, { useMemo, useState } from "react";
import { Button, Flex, Table, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import {
    removeFromCart,
    submitOrder,
    updateCartQuantity,
} from "../../features/products/productSlice";

export default function Cart() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cartItems = useSelector((state) => state.products?.cartItems || []);

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [loading, setLoading] = useState(false);

    const dataSource = useMemo(() => {
        return cartItems.map((item) => {
            const key = item.cartKey || String(item.id);
            const price = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 1;
            return {
                ...item,
                key,
                id: item.id,
                img: item.image || "/product-placeholder.svg",
                name: item.selectedSize
                    ? `${item.name} (Size ${item.selectedSize})`
                    : item.name,
                price,
                quantity,
                total: price * quantity,
            };
        });
    }, [cartItems]);

    const handleQuantityChange = (cartKey, newQuantity) => {
        if (newQuantity < 1) return;
        dispatch(
            updateCartQuantity({
                cartKey,
                quantity: newQuantity,
            }),
        );
    };

    const handleDelete = (cartKey) => {
        dispatch(removeFromCart(cartKey));
        setSelectedRowKeys((prev) => prev.filter((k) => k !== cartKey));
    };

    const columns = [
        { title: "id", dataIndex: "id" },
        {
            title: "img",
            dataIndex: "img",
            render: (img, record) => (
                <img
                    src={img}
                    alt={record.name}
                    className="h-16 w-16 rounded bg-gray-50 object-contain p-1"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/product-placeholder.svg";
                    }}
                />
            ),
        },
        {
            title: "name",
            dataIndex: "name",
            render: (name, record) => (
                <Link
                    to={`/detail/${record.id}`}
                    className="font-semibold text-black hover:text-purple-700"
                >
                    {name}
                </Link>
            ),
        },
        {
            title: "price",
            dataIndex: "price",
            render: (price) => `${Number(price).toLocaleString("vi-VN")} $`,
        },
        {
            title: "quantity",
            dataIndex: "quantity",
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            size="small"
                            onClick={() =>
                                handleQuantityChange(
                                    record.key,
                                    record.quantity - 1,
                                )
                            }
                            disabled={record.quantity <= 1}
                        >
                            -
                        </Button>
                        <span className="w-8 text-center font-medium">
                            {record.quantity}
                        </span>
                        <Button
                            size="small"
                            onClick={() =>
                                handleQuantityChange(
                                    record.key,
                                    record.quantity + 1,
                                )
                            }
                        >
                            +
                        </Button>
                    </div>
                );
            },
        },
        {
            title: "total",
            dataIndex: "total",
            render: (total) => (
                <span className="font-bold text-red-600">
                    {Number(total).toLocaleString("vi-VN")} $
                </span>
            ),
        },
        {
            title: "action",
            key: "action",
            render: (_, record) => {
                return (
                    <Button
                        color="danger"
                        variant="solid"
                        onClick={() => handleDelete(record.key)}
                    >
                        DELETE
                    </Button>
                );
            },
        },
    ];

    const handleSubmitOrder = async () => {
        const token =
            typeof window !== "undefined"
                ? window.localStorage.getItem("accessToken")
                : null;

        if (!token) {
            message.warning("Vui lòng đăng nhập trước khi đặt hàng!");
            navigate("/login");
            return;
        }

        const selectedItems = dataSource.filter((item) =>
            selectedRowKeys.includes(item.key),
        );

        if (selectedItems.length === 0) return;

        let email = "";
        try {
            const rawUser =
                window.localStorage.getItem("userLogin") ||
                window.localStorage.getItem("user") ||
                window.localStorage.getItem("email");
            if (rawUser) {
                const parsed = rawUser.startsWith("{")
                    ? JSON.parse(rawUser)
                    : { email: rawUser };
                if (parsed?.email) email = parsed.email;
            }
            if (!email && token) {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const payload = JSON.parse(window.atob(base64));
                email =
                    payload.email ||
                    payload.unique_name ||
                    payload[
                        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
                    ] ||
                    (typeof payload.sub === "string" &&
                    payload.sub.includes("@")
                        ? payload.sub
                        : "");
            }
        } catch {
            console.error("Lỗi lấy email:", e);
        }
        if (!email) {
            message.error(
                "Không tìm thấy email tài khoản, vui lòng đăng nhập lại!",
            );
            return;
        }
        const orderDetail = selectedItems.map((item) => ({
            productId: String(item.id),
            quantity: Number(item.quantity),
        }));
        try {
            setLoading(true);
            await dispatch(
                submitOrder({
                    email,
                    selectedItems,
                    orderDetail,
                }),
            ).unwrap();

            message.success("Đặt hàng thành công!");
            setSelectedRowKeys([]);
        } catch (err) {
            message.error(
                String(err || "Đặt hàng thất bại, vui lòng thử lại."),
            );
        } finally {
            setLoading(false);
        }
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="container mx-auto px-6 py-10">
                <h1 className="text-5xl font-bold">Cart</h1>
                <div className="my-12 h-0.5 bg-gray-200"></div>
                <Flex gap="middle" vertical>
                    <Flex align="center" gap="middle" className="justify-end">
                        {hasSelected
                            ? `Selected ${selectedRowKeys.length} items`
                            : null}
                        <Button
                            onClick={handleSubmitOrder}
                            disabled={!hasSelected}
                            loading={loading}
                            color="cyan"
                            variant="solid"
                        >
                            SUBMIT ORDER
                        </Button>
                    </Flex>
                    <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={dataSource}
                    />
                </Flex>
            </div>
            <Footer />
        </div>
    );
}
