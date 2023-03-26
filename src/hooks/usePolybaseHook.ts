import { useEffect, useState } from 'react'
import { Auth } from '@polybase/auth'
import { ethPersonalSignRecoverPublicKey } from '@polybase/eth'
import { Polybase } from '@polybase/client'
import { useCollection } from '@polybase/react'

const db = new Polybase({
  defaultNamespace: 'pk/0x8318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5/gen-web3',
})

const auth = new Auth()
const TOKEN_ID = 1

async function getPublicKey() {
  const msg = 'Login with Chat'
  const sig = await auth.ethPersonalSign(msg)
  const publicKey = ethPersonalSignRecoverPublicKey(sig, msg)
  return '0x' + publicKey.slice(4)
}

export function usePolybaseHook() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // const [nftId, setNftId] = useState('1')

  const query = db.collection('MyNFT')
  const { data, error, loading } = useCollection(query)

  const nfts: any = data?.data

  const signIn = async () => {
    const res = await auth.signIn()

    // get public
    let publicKey = res.publicKey

    if (!publicKey) {
      publicKey = await getPublicKey()
    }
    

    db.signer(async (data: string) => {
      return {
        h: 'eth-personal-sign',
        sig: await auth.ethPersonalSign(data),
      }
    })

    // Create user if not exists
    try {
      const user = await db.collection('User').record(publicKey).get()
      console.log('User', user)
    } catch (e) {
      await db.collection('User').create([])
    }

    setIsLoggedIn(!!res)
  }

  useEffect(() => {
    auth.onAuthUpdate((authState) => {
      setIsLoggedIn(!!authState)

      db.signer(async (data: string) => {
        return {
          h: 'eth-personal-sign',
          sig: await auth.ethPersonalSign(data),
        }
      })
    })
  })

  const createNFT = async (name: string, desc: string, image: string) => {
    const publicKey = await getPublicKey()
    await db.collection('MyNFT').create([TOKEN_ID.toString(), db.collection('User').record(publicKey), name, desc, image])
  }

  const getMyNFTs = async () => {
    const publicKey = await getPublicKey()
    // const result = await db.collection('MyNFT').where('owner.publicKey', '==', publicKey).get();
    const result = await db.collection('MyNFT').get();
    console.log('result', result.data)
    return result.data
  }

  const getMyNFT = async () => {
    const publicKey = await getPublicKey()
    // const result = await db.collection('MyNFT').where('owner.publicKey', '==', publicKey).get();
    const result = await db.collection('MyNFT').get();
    console.log('result', result.data)
    return result.data[TOKEN_ID].data
  }

  const updateImgToNFT = async (image: string) => {
    await db.collection('MyNFT').record(TOKEN_ID.toString()).call('updateImage', [image])
  }

  return {
    nfts,
    isLoggedIn,
    signIn,
    createNFT,
    getMyNFTs,
    getMyNFT,
    updateImgToNFT
  }
}