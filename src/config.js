/** @type {dataLoggerConfig} */
const mainConfig = {
  dbInfo: {
    database: 'solar',
    host: 'localhost',
    user: 'root',
    password: 'smsoftware',
  },
  deviceInfo: {
    target_id: 'solar',
    target_name: '경사 일사량',
    target_category: 'solar',
    logOption: {
      hasCommanderResponse: true,
      hasDcError: true,
      hasDcEvent: true,
      hasReceiveData: true,
      hasDcMessage: true,
      hasTransferCommand: true,
    },
    controlInfo: {
      hasReconnect: true,
    },
    connect_info: {
      type: 'serial',
      subType: 'parser',
      addConfigInfo: {
        parser: 'byteLengthParser',
        option: 22,
      },
      host: 'localhost',
      port: 'COM1',
      baudRate: 9600,
    },
  },
};
module.exports = mainConfig;
