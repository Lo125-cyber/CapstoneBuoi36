import React from "react";
import { Table } from "antd";
import { Link } from "react-router-dom";
export default function Favourite({ dataSource }) {
    console.log(dataSource);
    const columns = [
        { title: "id", dataIndex: "id", render: (_, __, index) => index + 1 },
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
    ];

    return (
        <div>
            <Table columns={columns} dataSource={dataSource} />
        </div>
    );
}
