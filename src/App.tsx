import './App.css';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useTonConnect } from './hooks/useTonConnect';
import { useCounterContract } from './hooks/useCounterContract';
import { useState } from 'react';
import { BackendTokenContext } from './BackendTokenContext';
import { TestToken } from './TestToken';

function App() {
  const { connected } = useTonConnect();
  const { value, address, sendIncrement } = useCounterContract();
  const [token, setToken] = useState<string | null>(null);

  return (
    
    <div className='App'>
      <div className='Container'>
        <TonConnectButton />

        <BackendTokenContext.Provider value={{token, setToken}}>
        <div className='Card'>
          <b>Counter Address</b>
          <div className='Hint'>{address?.slice(0, 30) + '...'}</div>
        </div>

        <div className='Card'>
          <b>Counter Value</b>
          <div>{value ?? 'Loading...'}</div>
        </div>

        <a
          className={`Button ${connected ? 'Active' : 'Disabled'}`}
          onClick={() => {
            sendIncrement();
          }}
        >
          Increment
        </a>
        <TestToken/>
        </BackendTokenContext.Provider>
        <a
          onClick={async () => {
           
          }}
        >
          授权签名测试
        </a>
      </div>
    </div>
  );
}

export default App
