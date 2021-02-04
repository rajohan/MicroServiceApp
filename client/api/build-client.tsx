import axios, { AxiosInstance } from "axios";
import { NextPageContext } from "next";

const buildClient = ({ req }: NextPageContext): AxiosInstance => {
    if (typeof window === "undefined") {
        return axios.create({
            baseURL:
                "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
            headers: req?.headers
        });
    }

    return axios.create({ baseURL: "/" });
};

export default buildClient;
