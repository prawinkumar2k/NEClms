import { createServer, connectDB } from './index.js';

async function start() {
  await connectDB();
  const app = createServer();
  app.listen(8081, () => {
    console.log('Test API running on http://localhost:8081');
  });
}

start();
