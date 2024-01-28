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
    Uint8Array.from([85,170,105,58,166,188,182,153,120,98,115,188,18,57,210,160,228,223,35,181,102,74,146,249,108,95,69,91,227,181,191,63,138,171,205,90,162,19,254,243,85,239,34,182,83,206,188,41,190,204,126,173,156,103,137,140,72,236,242,217,21,93,244,135])
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
    const mint = new web3.PublicKey("ERc4dYhUYSydExugPRD5yYWse7eJSC9AHfqjzfYRC4Rh");

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "SUPPORT FOR UKRAINA", 
        symbol: "SUPPORT",
        uri: "https://raw.githubusercontent.com/synchr020/myjsonfile/main/json_/mylove.json"
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