import Router from "next/router";
import React, { useEffect } from "react";

import useRequest from "../../hooks/useRequest";

const Signout: React.FC = () => {
    const { doRequest } = useRequest({
        url: "/api/users/signout",
        method: "post",
        data: {},
        onSuccess: () => Router.push("/")
    });

    useEffect(() => {
        doRequest();
    }, [doRequest]);

    return <div>Signing you out...</div>;
};

export default Signout;
