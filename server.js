const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initializeSocket } = require('./src/lib/websocket/server');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  initializeSocket(server);

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}).catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
}); 