import { Title, Form, GridResults } from './components';
import AppBar from '@mui/material/AppBar';
import { Typography, Box } from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import { useFormQuery } from "./hooks";
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ALPHA_SCROLL_RPC_URL, ALPHA_SCROLL_CHAIN_ID } from './data/Network';
import { MyMinting } from './components/MyMinting';

const App = () => {

  const { handleLoading, handleSubmit, isLoading, query } = useFormQuery()
  const [address, setAddress] = useState("");

  const connectMetamask = async () => {
    if ((window as any).ethereum) {
        try {
            const addressArray = await (window as any).ethereum.request({
                method: "eth_requestAccounts",
            });
            
            return {
                address: addressArray[0],
                status: "Metamask successfuly connected."
            }
        } catch (err: any) {
            return {
                address: "",
                status: "Something went wrong: " + err.message
            }
        }
    } else {
        return {
            address: "",
            status: "🦊 You must install Metamask, a virtual Ethereum wallet, in your browser."
        }
    }
  };

  const checkForChain = async () => {
    const currentChainId = await (window as any).ethereum.request({
        method: 'eth_chainId',
    });

    if(currentChainId != ALPHA_SCROLL_CHAIN_ID){
      try {
          await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ALPHA_SCROLL_CHAIN_ID }],
          });
        } catch (error) {
          try {
              await (window as any).ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                      {
                          chainId: ALPHA_SCROLL_CHAIN_ID,
                          chainName: 'Scroll Alpha Testnet',
                          rpcUrls: [ALPHA_SCROLL_RPC_URL],
                          nativeCurrency: {
                              name: "Scroll",
                              symbol: "ETH",
                              decimals: 18
                          },
                          blockExplorerUrls: ["https://blockscout.scroll.io/"]
                      },
                  ],
              });
          } catch (error: any) {
              toast.error(error.message);
          }
      }
      return false;
  } else {
      return true;
  }
  
    //mumbai
    // if(currentChainId != "0x13881"){
    //     try {
    //         await (window as any).ethereum.request({
    //             method: 'wallet_switchEthereumChain',
    //             params: [{ chainId: "0x13881" }],
    //         });
    //       } catch (error) {
    //         try {
    //             await (window as any).ethereum.request({
    //                 method: 'wallet_addEthereumChain',
    //                 params: [
    //                     {
    //                         chainId: "0x13881",
    //                         chainName: 'Polygon Testnet',
    //                         rpcUrls: [import.meta.env.VITE_ALCHEMY_API_KEY],
    //                         nativeCurrency: {
    //                             name: "Polygon",
    //                             symbol: "MATIC",
    //                             decimals: 18
    //                         },
    //                         blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
    //                     },
    //                 ],
    //             });
    //         } catch (error: any) {
    //             toast.error(error.message);
    //         }
    //     }
    //     return false;
    // } else {
    //     return true;
    // }
  }

  const listenForChanges = () => {
    // Listen for account changes and update the address state
    (window as any).ethereum.on("accountsChanged", async (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress("");
        toast.error("Metamask is locked or no accounts are available.");
      } else {
        setAddress(accounts[0]);
        toast.success("Account switched successfully.");
      }
    });
  };  
  
  const connectWallet = async () => {
    if(address.length > 0){
        setAddress("");
    } else {
        const {address, status} = await connectMetamask();
        if (address.length > 0) {
            if(await checkForChain()){
                setAddress(address);
                listenForChanges();
            }
        } else {
            toast.error(status);
        }
    }
  };

  const [showChooseGrid, setShowChooseGrid] = useState(false);

  return (
    <div>
      <AppBar component="nav">
        <Toolbar>
          <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
            >
              DynamoNFT
            </Typography>
            <Title mt='25px' connectWallet={connectWallet} address={address} />
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3, mt: 7 }}>
        <MyMinting mt='45px' address={address} onShowChooseGrid={() => setShowChooseGrid(true)} />

        <Form handleSubmit={handleSubmit} isLoading={isLoading} />

        {query.length > 0 && <GridResults address={address} query={query} showChooseGrid={showChooseGrid} handleLoading={handleLoading} />}
      </Box>
    </div>
  )
}
export default App
