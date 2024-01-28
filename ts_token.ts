import { log } from "util";

console.log("my boi");


import {Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, 
    Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, 
    UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, 
    findMetadataPda} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.fromSecretKey(
    Uint8Array.from([9,120,107,34,39,177,200,174,115,39,190,128,55,50,138,172,4,181,0,106,239,73,160,187,129,112,138,1,34,193,29,208,150,91,6,254,192,223,117,119,223,192,233,207,192,187,167,59,69,204,194,17,173,195,198,144,242,244,128,79,79,92,144,72])
);



// export function loadWalletKey(keypairFile:string): Keypair {
//     const fs = require("fs");
//     const loaded = web3.Keypair.fromSecretKey(
//       new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
//     );
//     return loaded;
//   }
const INITIALIZE = true;

async function main(){
    console.log("let's name some tokens in 2024!");
    const myKeypair = keypair;
    const mint = new web3.PublicKey("AARZoz9tyn5dUvCt4ovTtV7XUVhsVvQ9ciizD4NdHouv");

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "Dat Oi", 
        symbol: "DATOI",
        image: "https://m.media-amazon.com/images/I/41bh+U75RRL._AC_UF894,1000_QL80_.jpg",
        uri: "https://raw.githubusercontent.com/synchr020/myjsonfile/main/mylove.json"
    }
    const onChainData = {
        ...ourMetadata,
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: none<Creator[]>(),
        collection: none<Collection>(),
        uses: none<Uses>(),
    }
    if(INITIALIZE){
        const accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            mintAuthority: signer,
        }
        const data: CreateMetadataAccountV3InstructionDataArgs = {
            isMutable: true,
            collectionDetails: null,
            data: onChainData
        }
        console.log("done ---1");
        
        const txid = await createMetadataAccountV3(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log("done ---2");
        console.log(txid)

    } else {
        const data: UpdateMetadataAccountV2InstructionData = {
            data: some(onChainData),
            discriminator: 0,
            isMutable: some(true),
            newUpdateAuthority: none<PublicKey>(),
            primarySaleHappened: none<boolean>()
        }
        const accounts: UpdateMetadataAccountV2InstructionAccounts = {
            metadata: findMetadataPda(umi,{mint: fromWeb3JsPublicKey(mint)}),
            updateAuthority: signer
        }
        const txid = await updateMetadataAccountV2(umi, {...accounts, ...data} ).sendAndConfirm(umi);
        console.log(txid)
    }

}

main();