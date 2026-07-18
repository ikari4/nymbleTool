// writePuzzle.js

import { createClient } from "@libsql/client";

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const {
            datePlayed,
            word,
            clue0,
            clue1
        } = req.body;

        await db.execute({
            sql: `
                INSERT INTO Words
                    (datePlayed, word, clue0, clue1)
                VALUES
                    (?, ?, ?, ?)
            `,
            args: [
                datePlayed,
                word,
                clue0,
                clue1
            ]
        });

        return res.status(200).json({
            success: true,
            message: "Puzzle saved."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}