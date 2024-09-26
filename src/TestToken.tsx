import { useContext } from "react";
import { BackendTokenContext } from "./BackendTokenContext";
import { useBackendAuth } from "./useBackendAuth";
import { useTonWallet } from "@tonconnect/ui-react";



export const TestToken = () => {
    useBackendAuth();

    const { token } = useContext(BackendTokenContext);
    const wallet = useTonWallet();

    if (!token) {
        return null;
    }

    return <button
        onClick={() => {
            console.log("验证成功，token", token)
        }}
    >验证成功</button>
}
