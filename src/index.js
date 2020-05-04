const { port, env } = require('./config/vars');
const app = require('./config/express');

// listen to requests
const server = app.listen(port, () => console.log(`server started on port ${port} (${env})`));

function waitForSocketsToClose(counter) {
  if (counter > 0) {
    console.log(
      `Waiting ${counter} more ${
        counter === 1 ? 'seconds' : 'second'
      } for all connections to close...`,
    );
    return setTimeout(waitForSocketsToClose, 1000, counter - 1);
  }

  console.log('Forcing all connections to close now');
  Object.keys(sockets).forEach((socketId) => sockets[socketId].destroy());

  return true;
}

// shut down server
function shutdown() {
  waitForSocketsToClose(10);

  server.close((err) => {
    if (err) {
      console.error(err);
      process.exitCode = 1;
    }
    process.exit();
  });
}

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', () => {
  console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', () => {
  console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

const sockets = {};
let nextSocketId = 0;
server.on('connection', (socket) => {
  const socketId = nextSocketId++;
  sockets[socketId] = socket;

  socket.once('close', () => {
    delete sockets[socketId];
  });
});

/**
 * Exports express
 * @public
 */
module.exports = app;
