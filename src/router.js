const ZigbeeBat = require('./ZigbeeBat');
const ZigbeePir = require('./ZigbeePir');
const BluetoothScan = require('./BluetoothScan');

module.exports = {
  /**
   *
   * @param {projectConfig} config
   */
  getControl(config) {
    const {
      projectInfo: { projectMainId },
      deviceInfo: {
        connect_info,
        connect_info: {
          addConfigInfo,
          addConfigInfo: { option },
          baudRate,
        },
      },
    } = config;

    connect_info.baudRate = Number(baudRate);

    console.log(option);
    if (option === undefined) {
      delete connect_info.addConfigInfo;
    } else if (option !== undefined) {
      addConfigInfo.option = Buffer.from(option, 'hex');
    }
    console.log(addConfigInfo.option);

    switch (projectMainId) {
      case 'ZGB_BAT':
        return new ZigbeeBat(config);
      case 'ZGB_PIR':
        return new ZigbeePir(config);
      case 'BLE_SCAN':
        return new BluetoothScan(config);
      default:
        return new ZigbeeBat(config);
    }
  },
};
