import type { NextApiRequest, NextApiResponse } from 'next'

// Define the types and constants here
type ActionGetResponse = {
  icon: string;
  label: string;
  description: string;
  title: string;
};

const ACTIONS_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    try {
      const payload: ActionGetResponse = {
        icon: new URL("/logo.jpg", `http://${req.headers.host}`).toString(),
        label: "Mint NFT",
        description: "Imagine your NFT",
        title: "Imagine Demo"
      };

      // Set CORS headers
      Object.entries(ACTIONS_CORS_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      res.status(200).json(payload);
    } catch (error) {
      console.error("Error handling GET request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}