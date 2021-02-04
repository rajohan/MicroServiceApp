import { NextPage } from "next";
import React from "react";

import { CustomNextPageContext, CustomProps } from "../_app";

interface Props extends CustomProps {
    orders: Record<string, any>[];
}

const OrderIndex: NextPage<Props> = ({ orders }: Props) => {
    return (
        <ul>
            {orders.map((order) => {
                return (
                    <li key={order.id}>
                        {order.ticket.title} - {order.status}
                    </li>
                );
            })}
        </ul>
    );
};

OrderIndex.getInitialProps = async (context: CustomNextPageContext) => {
    const { data } = await context.axiosClient.get("/api/orders");

    return { orders: data, currentUser: context.currentUser };
};

export default OrderIndex;
