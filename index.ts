import express, { json, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Load dotenv configrations
 */
dotenv.config();

/**
 * Initialize Express
 */
const server: Application = express();

/**
 * Boostraps middleware
 */
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors());

/**
 * Verify ID Token passed from Frontend
 */
async function verify(token: any) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIEND_ID, // Specify the CLIENT_ID of the server that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  return payload;
}

/**
 * Authenticate with Google OAuth
 */
server.post("/api/auth/google", async (req, res) => {
  try {
    const oauthData = await verify(req.body.idToken);

    return res.json({
      name: oauthData.given_name,
      email: oauthData.email,
    });
  } catch (error) {
    console.log(error);

    return res.json(error);
  }
});

/**
 * Run Express Server
 */
server.listen(process.env.PORT, () => {
  console.log(`Server is running on PORT ${process.env.PORT}`);
});
