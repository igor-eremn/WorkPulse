const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const people_routes = require('./routes/routes-emp');
const time_routes = require('./routes/routes-att');
app.use('/', people_routes);
app.use('/', time_routes);

const initializeDatabase = require('./db/initialize');
initializeDatabase();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});