/** @type {dataLoggerConfig} */
const mainConfig = {
  incliendSolarInfo: {
    fnCode: 4,
    unitId: 1,
    address: 0,
    dataLength: 20,
  },
  deviceInfo: {
    target_id: 'InclinedSolar',
    target_name: '경사 일사량',
    target_category: 'weathercast',
    logOption: {
      hasCommanderResponse: true,
      hasDcError: true,
      hasDcEvent: true,
      hasReceiveData: true,
      hasDcMessage: true,
      hasTransferCommand: true,
    },
    protocol_info: {
      mainCategory: 'weathercast',
      subCategory: 'vantagepro2',
      protocolOptionInfo: {
        hasTrackingData: false,
      },
    },
    controlInfo: {
      hasErrorHandling: false,
      hasOneAndOne: false,
      hasReconnect: true,
    },
    connect_info: {
      type: 'modbus',
      subType: 'rtu',
      baudRate: 9600,
      port: 'COM3',
    },
    // connect_info: {
    //   type: 'serial',
    //   subType: 'parser',
    //   addConfigInfo: {
    //     parser: 'byteLengthParser',
    //     option: 11,
    //   },
    //   host: 'localhost',
    //   port: 'COM3',
    //   baudRate: 9600,
    // },
  },
};
module.exports = mainConfig;
