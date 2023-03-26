import { useEffect, useState } from 'react';
import { Card } from './Card';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { usePolybaseHook } from "../hooks/usePolybaseHook"


interface IGridResults {
    open: boolean
    data: any
    query: string
}

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

export const ChooseGridResults = ({ open, data, query }: IGridResults) => {

    const { updateImgToNFT } = usePolybaseHook()
    const [isOpen, setIsOpen] = useState(open)

    useEffect(() => {
      if (open) {
        setIsOpen(true)
      }
    }, [open])

    const handleClose = () => {
      setIsOpen(false);
    };

    const chooseImage = async (url: string) => {
      try {
        console.log('url', url)
        await updateImgToNFT(url)
      } catch (error) {
        console.log(error)
      }

      setIsOpen(false);
    }

    return (
        <>
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={isOpen}
            maxWidth={900}
            fullWidth={true}
          >
            <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
              Choose your image
            </BootstrapDialogTitle>
            <DialogContent dividers>
              <p className='no-results'>
                {data && data.length === 0 ? 'No results with: ' : 'Results with: '}
                <b>{query}</b>
              </p>

              <div className='grid'>
                {/* {data.map((obj,index) => (<Card key={index} url={obj.url} onClick={() => mintImage(obj.url)} />))} */}
                {data.map((obj,index) => (<Card key={index} url={obj.url} onClick={() => chooseImage(obj.url)} />))}
              </div>
            </DialogContent>
          </BootstrapDialog>
        </>
    )
}