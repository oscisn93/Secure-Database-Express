import fs from 'node:fs/promises';
import express from 'express';
import routes from './routes/index.js'
// Constants
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

// Create http server
const app = express();

const compression = (await import('compression')).default;
const sirv = (await import('sirv')).default;


app.use(compression());
app.use(base, sirv('./static'));
// set the view engine to ejs
app.set("view engine", "ejs");
app.use(routes);

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
});

