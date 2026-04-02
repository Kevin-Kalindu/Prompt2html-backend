import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { FieldValue } from "firebase/firestore";

import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./service.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY
});


app.post('/chat/new/:usercollection', async (req, res) =>{
    const {message} = req.body
    const {usercollection} = req.params

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const promp = `what is a good topic for the chat ${message} strictly in just four or less words`
    const topic = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: "user", content: promp }]
    })
    const ref = db.collection(usercollection)
    const document = await ref.add({topic:topic.choices[0].message.content, timestamp:admin.firestore.FieldValue.serverTimestamp()})
    const ID = document.id
    res.write(ID)
    res.end()
})


app.post('/chat/stream/:usercollection/:docID', async (req, res) => {
    const { message } = req.body;
    const {usercollection, docID} = req.params
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const ref = db.collection(usercollection).doc(docID)
    const snapshot = await ref.get()
    if (!snapshot.exists) return
    const data = snapshot.data()
    const oldContents = data.contents || []
    const newMessage = {
        role: 'user',
        parts: [{text: message}]
    }
    let mode = 'text'
    let buffer = ''
    let text = ''
    let html = ''
    const chat = [...oldContents, newMessage]
        const prompt = `
        Return output EXACTLY like this:

        Natural language explanation here.

        [[[HTML]]]
        HTML CODE HERE ONLY.

        User request:
        ${JSON.stringify(chat, null, 2)}
        `;

    try {
        const stream = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt}],
        stream: true
        });

        for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) {
            buffer += token
            res.write(token);
            if (mode === 'code'){
                html = html + token
                buffer = ''
            }
            if (mode === 'text'){
                if (buffer.includes('[[HTML]]]')){
                    const [before, after] = buffer.split('[[[HTML]]]')
                    text += before
                    html += after
                    mode = 'code'
                }
            }
        }
        }
        const model = {
            role : 'model',
            parts : [ {text: text}, {code:html}]
        }
        const reply = [...chat, model]
        await ref.update({
            contents: reply
        })
        res.end();
    } catch (err) {
        console.error(err);
        res.write("\n[ERROR]");
        res.end();
    }
    });

app.listen(PORT, () => {
console.log(`✅ Backend running at http://localhost:${PORT}`);
});
