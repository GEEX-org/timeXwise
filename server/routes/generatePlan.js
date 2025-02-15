const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.listen(port, '0.0.0.0', () => {
    console.log(`running on port${port}`);
});