import { NextPage } from "next";
import Router from "next/router";
import React from "react";

import useRequest from "../../hooks/useRequest";
import { CustomNextPageContext, CustomProps } from "../_app";

interface Props extends CustomProps {
    ticket: Record<string, string>;
}

const TicketShow: NextPage<Props> = ({ ticket }: Props) => {
    const { doRequest, errors } = useRequest({
        url: "/api/orders",
        method: "post",
        data: {
            ticketId: ticket.id
        },
        onSuccess: async (order) => {
            await Router.push(`/orders/${order.id}`);
        }
    });

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button onClick={() => doRequest()} className="btn btn-primary">
                Purchase
            </button>
        </div>
    );
};

TicketShow.getInitialProps = async (context: CustomNextPageContext) => {
    const { ticketId } = context.query;
    const { data } = await context.axiosClient.get(`/api/tickets/${ticketId}`);

    return { ticket: data, currentUser: context.currentUser };
};

export default TicketShow;
