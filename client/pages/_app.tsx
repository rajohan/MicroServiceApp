import "bootstrap/dist/css/bootstrap.css";

import { AxiosInstance } from "axios";
import { NextPageContext } from "next";
import { AppContext, AppProps } from "next/app";
import React from "react";

import buildClient from "../api/build-client";
import Header from "../components/Header";

export interface CustomAppProps extends AppProps {
    currentUser: null | { email: string };
}

export interface CustomProps {
    currentUser: null | { email: string };
}

export interface CustomNextPageContext extends NextPageContext {
    axiosClient: AxiosInstance;
    currentUser: null | { email: string };
}

const AppComponent = ({
    Component,
    pageProps,
    currentUser
}: CustomAppProps): JSX.Element => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async (appContext: AppContext) => {
    const client = await buildClient(appContext.ctx);
    const { data } = await client.get("/api/users/currentuser");

    let pageProps = {};

    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps({
            ...appContext.ctx,
            axiosClient: client,
            currentUser: data.currentUser
        } as CustomNextPageContext);
    }

    return { pageProps, currentUser: data.currentUser };
};

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
//     const response = await axios.get(
//         "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser",
//         {
//             headers: req.headers
//         }
//     );
//
//     return { props: { currentUser: response.data.currentUser } };
// };

export default AppComponent;
