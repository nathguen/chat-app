import express from "express";
import path from "path";
const app = express();
const port = process.env.PORT || 3001;

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));