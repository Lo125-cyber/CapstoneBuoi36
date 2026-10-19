import React from "react";
import { Link } from "react-router-dom";
import { Table } from "antd";
export default function OrderHistory({ dataSource }) {
    const columns = [
        { title: "id", dataIndex: "id", render: (_, __, index) => index + 1 },
        {
            title: "img",
            dataIndex: "image",
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
                        <span className="w-8 text-center font-medium">
                            {record.quantity}
                        </span>
                    </div>
                );
            },
        },
        {
            title: "total",
            dataIndex: "total",
            render: (_, record) => {
                const orderTotal =
                    (Number(record.price) || 0) *
                    (Number(record.quantity) || 0);
                return (
                    <span className="font-bold text-red-600">
                        {orderTotal.toLocaleString("vi-VN")} $
                    </span>
                );
            },
        },
    ];
    return (
        <div>
            {" "}
            <Table
                columns={columns}
                dataSource={dataSource.map((item) => item.orderDetail[0])}
            />
        </div>
    );
}
