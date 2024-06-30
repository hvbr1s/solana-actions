import type { NextApiRequest, NextApiResponse } from 'next'
import "@solana/web3.js"
import { ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
import { createPostResponse } from '@solana/actions';

const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"

type ActionGetResponse = {
  icon: string;
  label: string;
  description: string;
  title: string;
};

type ActionPostResponse = {
  /** base64 encoded serialized transaction */
  transaction: string;
  /** describes the nature of the transaction */
  message?: string;
}

type ActionPostRequest = {
  /** base58-encoded public key of an account that may sign the transaction */
  account: string;
}


const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const payload: ActionGetResponse = {
      icon: new URL("/logo.jpg", `http://${req.headers.host}`).toString(),
      label: "Mint NFT",
      description: "Imagine your NFT",
      title: "Imagine Demo"
    };

    res.status(200).json(payload);
  } catch (error) {
    console.error("Error handling GET request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {

    const body: ActionPostRequest = req.body;
    let account: PublicKey;
    try {
      account = new PublicKey(body.account)
    } catch (error) {
      res.status(400).json({ error: 'Invalid "account" provided' });
      return;
    }

    const transaction = new Transaction()

    transaction.add(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from("this is a simple memo message", "utf8"),
        keys: []
      }),
    );
    
    transaction.feePayer = account

    const connection = new Connection(clusterApiUrl('devnet'))
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    const payload: ActionPostResponse = await createPostResponse({
      fields:{
        transaction
      },
      signers:[]
    })

    Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.status(200).json(payload);

  } catch (error) {
    console.error("Error handling POST request:", error);
    res.status(400).json({ error: "Bad Request" });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers are set for all requests
  Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  switch (req.method) {
    case 'GET':
    case 'OPTIONS':
      handleGet(req, res);
      break;
    case 'POST':
      handlePost(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}