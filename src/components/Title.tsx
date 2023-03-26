import { Button } from "@mui/material"
import { usePolybaseHook } from "../hooks/usePolybaseHook"

export const Title = ({ connectWallet, address} : any) => {
  
  const { signIn, isLoggedIn  } = usePolybaseHook();

  
  return (
      <>
        <Button className="wallet" sx={{ color: '#fff'}} onClick={connectWallet}>{address.length > 0 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Connect Wallet"}</Button>

        {/* <Button onClick={signIn}>SignIn - polybase</Button>
         { !isLoggedIn ? <>Try to logging in</> : <>already logged in</> } */}
      </>
  )
}
