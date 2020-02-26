const router = require('./src/router');

module.exports = router;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  const config = require('./src/config');
  // console.log(config.deviceInfo);

  const controller = router.getControl(config);

  controller.init();

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
