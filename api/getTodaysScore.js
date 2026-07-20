// getTodaysScore.js

import { createClient } from "@libsql/client";  

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
  try {
    const { currentDate } = req.body;

    const result = await turso.execute(`
      SELECT 
        s.*,
        p.username
      FROM Scores s
      JOIN Players p on s.playerId = p.playerId
      WHERE datePlayed = ?
    `, [currentDate]);

    res.status(200).json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
}