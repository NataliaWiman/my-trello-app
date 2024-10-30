// pages/api/authenticate.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  authenticated: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { password } = req.body;

  if (password === process.env.AUTH_PASSWORD) {
    res.status(200).json({ authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
}
