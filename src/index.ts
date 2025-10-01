import express from 'express';
import router from './routes';
import { Database } from './config/database';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/', router);

Database.connect().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
