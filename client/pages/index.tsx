import { NextPage } from "next";
import Link from "next/link";
import React from "react";

import { CustomNextPageContext, CustomProps } from "./_app";

interface Props extends CustomProps {
    tickets: Record<string, string>[];
}

const Index: NextPage<Props> = ({ tickets }: Props) => {
    const ticketList = tickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href={`/tickets/${ticket.id}`}>
                        <a>View</a>
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>{ticketList}</tbody>
            </table>
        </div>
    );
};

Index.getInitialProps = async (context: CustomNextPageContext) => {
    const { data } = await context.axiosClient.get("/api/tickets");

    return { tickets: data, currentUser: context.currentUser };
};

export default Index;
