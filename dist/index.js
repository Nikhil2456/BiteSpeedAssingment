"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const ContactsController_1 = require("./controllers/ContactsController");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use('/contacts', ContactsController_1.default);
app.listen(PORT, () => {
    console.log('Server is running on PORT ', PORT);
});
