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
    Uint8Array.from([108,146,41,101,225,149,92,152,207,87,9,235,173,107,251,72,9,17,168,244,48,143,234,223,250,189,216,219,0,222,219,65,112,227,48,246,49,140,163,24,155,193,206,137,201,145,52,233,126,95,87,49,158,22,23,112,175,101,119,219,181,164,219,106])
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
    const mint = new web3.PublicKey("33rRJ7Lg95vduXyUXmWcGgVnWjLH9cKwePh2WhmYkad7");

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "Dat Token", 
        symbol: "DAT",
        uri: "https://raw.githubusercontent.com/loopcreativeandy/video-tutorial-resources/main/metadataUpdate/metadata.json",
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