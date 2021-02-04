import { NextPage } from "next";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";

import useRequest from "../../hooks/useRequest";
import { CustomNextPageContext, CustomProps } from "../_app";

interface Props extends CustomProps {
    order: Record<string, any>;
}

const OrderShow: NextPage<Props> = ({ order, currentUser }: Props) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: "/api/payments",
        method: "post",
        data: {
            orderId: order.id
        },
        onSuccess: async () => {
            await Router.push("/orders");
        }
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const expiresAt = new Date(order.expiresAt).getTime();
            const msLeft = expiresAt - new Date().getTime();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, [order]);

    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }

    return (
        <div>
            Time left oy pay: {timeLeft} seconds
            <StripeCheckout
                token={({ id }) => doRequest({ token: id })}
                stripeKey="pk_test_ZNpoE9bTjRmHDr9kwhpkLYl8"
                amount={order.ticket.price * 100}
                email={currentUser?.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context: CustomNextPageContext) => {
    const { orderId } = context.query;
    const { data } = await context.axiosClient.get(`/api/orders/${orderId}`);

    return { order: data, currentUser: context.currentUser };
};

export default OrderShow;
