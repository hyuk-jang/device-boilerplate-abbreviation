const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  process.env.NODE_ENV = 'production';

  require('dotenv').config();

  const controller = new Control();

  controller.init().then(() => {
    controller.runScheduler();
  });

  process.on('uncaughtException', err => {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', err => {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
}
