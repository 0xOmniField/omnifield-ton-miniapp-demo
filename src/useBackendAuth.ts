import {useContext, useEffect, useRef} from "react";
import {BackendTokenContext} from "./BackendTokenContext";
import {useIsConnectionRestored, useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";
import { TonProofService } from "./ton-proof-service";
import { TonApiService } from "./ton-api-service";
import { createAuthToken } from "./jwt";

const localStorageKey = 'my-dapp-auth-token';
const payloadTTLMS = 1000 * 60 * 20;

const tonProofService = new TonProofService();

export function useBackendAuth() {
    console.log("call")
    const { setToken } = useContext(BackendTokenContext);
    const isConnectionRestored = useIsConnectionRestored();
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const interval = useRef<ReturnType<typeof setInterval> | undefined>();
    
    useEffect(() => {
       
        if (!isConnectionRestored || !setToken) {
            console.log("被结束了")
            return;
        }
        const value = tonProofService.generatePayload();
        console.log("value",value)
      
        console.log("wallet",wallet)
        clearInterval(interval.current);

        if (!wallet) {
            localStorage.removeItem(localStorageKey);
            setToken(null);

            const refreshPayload = async () => {
                tonConnectUI.setConnectRequestParameters({ state: 'loading' });

                const value = await tonProofService.generatePayload();
                if (!value) {
                    tonConnectUI.setConnectRequestParameters(null);
                } else {
                    tonConnectUI.setConnectRequestParameters({state: 'ready', value});
                }
            }

            refreshPayload();
            setInterval(refreshPayload, payloadTTLMS);
            return;
        }


        const token = localStorage.getItem(localStorageKey);
        console.log('Token:', token);
        if (token) {
            console.log('Token:', token);
            setToken(token);
            return;
        }
        console.log('wallet.connectItems?.tonProof:', wallet.connectItems?.tonProof);
        if (wallet.connectItems?.tonProof && !('error' in wallet.connectItems.tonProof)) {
            const account = wallet.account;

            if (!account.publicKey) {
                console.error('Public key is undefined');
                return;
            }

            const reqBody = {
                address: account.address,
                network: account.chain,
                public_key: account.publicKey,
                proof: {
                    timestamp: wallet.connectItems.tonProof.proof.timestamp,
                    domain: wallet.connectItems.tonProof.proof.domain,
                    payload: wallet.connectItems.tonProof.proof.payload,
                    signature: wallet.connectItems.tonProof.proof.signature,
                    state_init: account.walletStateInit,
                },
            };
            const client = TonApiService.create(reqBody.network);

            tonProofService.checkProof(reqBody,(address) => client.getWalletPublicKey(reqBody.address)).then(async result => {
                console.log('checkProof:', result);
                if (result) {
                    console.log('Token:', result);
                    const token = await createAuthToken({address: reqBody.address, network: reqBody.network});

                    setToken(token);
                    localStorage.setItem
                } else{
                    alert('Please try another wallet');
                    tonConnectUI.disconnect();
                }
            });
        
        } else {
            alert('Please try another wallet');
            tonConnectUI.disconnect();
        }

    }, [wallet, isConnectionRestored, setToken])
}
