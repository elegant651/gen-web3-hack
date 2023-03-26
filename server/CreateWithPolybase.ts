import { Polybase } from "@polybase/client"
import { ethPersonalSign } from '@polybase/eth'

const db = new Polybase({ defaultNamespace: "gen-web3" })

// If you want to edit the contract code in the future,
// you must sign the request when calling applySchema for the first time
// db.signer((data) => {
//   return {
//     h: 'eth-personal-sign',
//     sig: ethPersonalSign(wallet.privateKey(), data)
//   }
// })

const createResponse = await db.applySchema(`
collection User {
  id: string;

  @delegate
  @read
  publicKey: PublicKey;

  // Called when a new record is created db.collection('User').create([])
  constructor () {
    // ctx.publicKey is populated if the user signs the call
    if (!ctx.publicKey) {
      error('You must sign the txn');
    }

    // .toHex() converts the public key to a hex string
    this.id = ctx.publicKey.toHex(); // 0x...

    // Store the public key so we can use it for permissions
    this.publicKey = ctx.publicKey;
  }
}

@public
collection MyNFT {
  id: string;
  
  // The NFT delegates all responsibility it is given to the owner
  @delegate
  owner: User;

  name: string;
  desc: string;
  image: string;
  publicKey: PublicKey;

  constructor (id: string, owner: User, name: string, desc: string, image: string, publicKey: PublicKey) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.desc = desc;
    this.image = image;

    if (ctx.publicKey)
      this.publicKey = ctx.publicKey;
  }

  function updateImage (newImage: string) {
    // Check if the caller is a master address (or null address for immutable metadata).
    if (ctx.publicKey != this.publicKey) {
      error('You are not allowed to update the image.');
    }
    this.image = newImage;
  }
}
`, 'gen-web3') 