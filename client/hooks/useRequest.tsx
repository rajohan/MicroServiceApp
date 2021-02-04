import axios, { Method } from "axios";
import React, { useState } from "react";

interface useRequestArgs {
    url: string;
    method: Method;
    data: Record<string, unknown>;
    onSuccess?: (response: any) => void;
}

interface useRequestReturn {
    doRequest: (props?: Record<string, unknown>) => Promise<unknown>;
    errors: JSX.Element | null;
}

const useRequest = ({
    url,
    method,
    data,
    onSuccess
}: useRequestArgs): useRequestReturn => {
    const [errors, setErrors] = useState<JSX.Element | null>(null);

    const doRequest = async (props = {}) => {
        try {
            setErrors(null);
            const response = await axios({
                method,
                url,
                data: { ...data, ...props }
            });

            if (onSuccess) {
                onSuccess(response.data);
            }

            return response.data;
        } catch (err) {
            setErrors(
                <div className="alert alert-danger">
                    <h4>Ooops....</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map(
                            (err: { message: string }) => (
                                <li key={err.message}>{err.message}</li>
                            )
                        )}
                    </ul>
                </div>
            );
        }
    };

    return { doRequest, errors };
};

export default useRequest;
