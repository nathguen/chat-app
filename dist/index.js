"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const publicDirectory = path_1.default.join(__dirname, "../public");
app.use(express_1.default.static(publicDirectory));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
