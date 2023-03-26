import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { usePolybaseHook } from "../hooks/usePolybaseHook"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

export const MyMinting = ({ address, onShowChooseGrid } : any) => {
  
  const [tokenData, setTokenData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [open, setOpen] = useState(false);
  const { getMyNFT } = usePolybaseHook()

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const decodeTokenURI = (tokenURI: string) => {
    const base64Prefix = 'data:application/json;base64,';
    if (tokenURI.startsWith(base64Prefix)) {
      const base64Data = tokenURI.slice(base64Prefix.length);
      const decodedData = atob(base64Data);
      const json = JSON.parse(decodedData);
      return json;
    }
    return null;
  };

  // fetch from decoded data
  // useEffect(() => {
  //   const fetchTokenData = async (tokenId: number) => {
  //     if (address) {
  //       const web3 = new Web3((window as any).ethereum);
  //       const contractAddr = import.meta.env.VITE_CONTRACT_ADDRESS as string;
  //       const abiJson = ABI as AbiItem | AbiItem[];
  //       const contract = new web3.eth.Contract(abiJson, contractAddr)
  //       const tokenURI = await contract.methods.tokenURI(tokenId).call();
  //       console.log('tokenUri', tokenURI);
  //       const decodedData = decodeTokenURI(tokenURI);
  //       setTokenData(decodedData);
  //     }
  //   }
  //   fetchTokenData(0)
  // }, [address]);

  // fetch from polybase
  useEffect(() => {
    if (address) {
      const fetchTokenData = async () => {
        // const myNFTs = await getMyNFTs()
        // const tData = JSON.parse(JSON.stringify(myNFTs[0].data))
        const tData = await getMyNFT()
        console.log('myNFTs', tData)
        setTokenData({
          name: tData.name,
          description: tData.desc,
          image: tData.image
        })
      }
      fetchTokenData()
    }
  }, [address])

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        My Minting
      </Button>
      {tokenData && (
        <BootstrapDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
        >
          <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
            My Minting :{address}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <p>{tokenData.name}</p>
            <p>{tokenData.description}</p>
            <img src={tokenData.image} alt='img' loading="lazy" width={250} />
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={() => onShowChooseGrid()}>
              Update Image
            </Button>
          </DialogActions>
        </BootstrapDialog>
      )}
    </div>
  );
}
