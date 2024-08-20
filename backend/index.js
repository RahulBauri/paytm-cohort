require('express-async-errors');

const express = require('express');
const app = express();

const cors = require('cors');

require('./db');

const rootRouter = require('./routes/index');
const errorHandlerMiddleware = require('./middlewares/error-handler');

app.use(cors());
app.use(express.json());

app.use('/api/v1', rootRouter);

app.use(errorHandlerMiddleware);

app.listen(3000, () => {
  console.log('server is listening on port 3000...');
});
