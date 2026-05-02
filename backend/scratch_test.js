const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('test ok'));
app.listen(5001, () => console.log('Test server on 5001'));
