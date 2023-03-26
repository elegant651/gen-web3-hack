import { useQuery } from '@tanstack/react-query';
import { Button } from "@mui/material"
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { Card } from './Card';
import { ResponseAPI } from '../interface';
import { getImages } from "../utils";
import { Loading } from './Loading';
import Web3 from 'web3'
import {AbiItem} from 'web3-utils';
import { usePolybaseHook } from "../hooks/usePolybaseHook"
import ABI from '../data/abi.json';
import { ChooseGridResults } from './ChooseGridResults';

interface IGridResults {
    address: string
    handleLoading: (e: boolean) => void
    query: string
    showChooseGrid: boolean
}

export const GridResults = ({ address, query, showChooseGrid, handleLoading }: IGridResults) => {
    const [imageUsed, setImageUsed] = useState("");
    const [trxHash, setTrxHash] = useState("");
    const { data, isLoading, error, isError } = useQuery<ResponseAPI>([query], () => getImages(query), { retry: false })
    const { createNFT } = usePolybaseHook();

    useEffect(() => handleLoading(isLoading), [isLoading])

    const mintImage = async (url: string) => {
      if(address.length > 0){
          const web3 = new Web3((window as any).ethereum);
          const contractAddr = import.meta.env.VITE_CONTRACT_ADDRESS as string;
          const abiJson = ABI as AbiItem | AbiItem[];
          const contract = new web3.eth.Contract(abiJson, contractAddr)

          const loadingId = toast.loading("Minting NFT ...");

          try{
              // Sending message to smart contract
              await contract.methods.mint(
                  "GEN WEB3",
                  query,
                  url
              ).send({
                  from: address,
                  value: 0
              })
              .then(async function(receipt: any){
                  setImageUsed(url as string);
                  setTrxHash(`https://blockscout.scroll.io/tx/${receipt.transactionHash}`);
                  toast.update(loadingId, { render: 'Minting is successful, check your wallet.', type: "success", isLoading: false, autoClose: 4000, closeButton: true });

                  await storeTheImageToPolybase(url);
              });
          } catch (err: any) {
              toast.update(loadingId, { render: err.message, type: "error", isLoading: false, autoClose: 4000, closeButton: true });
          }
      } else {
          toast.warn("Please connect wallet before minting");
      }
  }

  const storeTheImageToPolybase = async (image: string) => {
    try {
      await createNFT("GEN WEB3", "GEN WEB3 - "+query, image)
    } catch (error: any) {
      toast.error(error.message);
    }
  }

    if (isLoading) return <Loading />

    if (isError) return <p>{(error as AxiosError).message}</p>


    return (
        <>
            <p className='no-results'>
                {data && data.length === 0 ? 'No results with: ' : 'Results with: '}
                <b>{query}</b>
            </p>

            {trxHash && <p className='txHash'><h3><a href={trxHash} target='_blank'>TxHash</a></h3></p> }

            <div className='grid'>
                {data.map((obj,index) => (<Card key={index} url={obj.url} onClick={() => mintImage(obj.url)} />))}
                {/* {data.map((obj,index) => (<Card key={index} url={obj.url} onClick={() => storeTheImageToPolybase(obj.url)} />))} */}
            </div>

            <ChooseGridResults open={showChooseGrid} query={query} data={data} />
        </>
    )
}