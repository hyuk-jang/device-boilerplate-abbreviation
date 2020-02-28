require('dotenv').config();

const ENV = process.env;

const { controllerParserType } = require('default-intelligence').dccFlagModel;

/** @type {projectConfig} */
const mainConfig = {
  projectInfo: {
    projectMainId: ENV.PJ_MAIN_ID || 'ZGB_BAT',
    projectSubId: ENV.PJ_SUB_ID || '',
    featureConfig: {
      apiConfig: {
        type: 'socket',
        host: ENV.PJ_HTTP_HOST,
        port: ENV.PJ_API_PORT,
        addConfigInfo: {
          parser: controllerParserType.socket.DELIMITER,
          option: '\u0004',
        },
      },
    },
  },
  dbInfo: {
    port: ENV.PJ_DB_PORT || '3306',
    host: ENV.PJ_DB_HOST || 'localhost',
    user: ENV.PJ_DB_USER || 'root',
    password: ENV.PJ_DB_PW || 'test',
    database: ENV.PJ_DB_DB || 'test',
  },
  deviceInfo: {
    target_id: 'outboard_1',
    target_name: '선외추락방지 1',
    target_category: 'weathercast',
    logOption: {
      hasCommanderResponse: true,
      hasDcError: true,
      hasDcEvent: true,
      hasReceiveData: true,
      hasDcMessage: true,
      hasTransferCommand: true,
    },
    // protocol_info: {
    //   mainCategory: 'weathercast',
    //   subCategory: 'vantagepro2',
    //   protocolOptionInfo: {
    //     hasTrackingData: false,
    //   },
    // },
    controlInfo: {
      hasErrorHandling: false,
      hasOneAndOne: false,
      hasReconnect: true,
    },
    connect_info: {
      type: ENV.CONN_TYPE,
      subType: ENV.CONN_SUBTYPE,
      baudRate: ENV.CONN_BR,
      port: ENV.CONN_PORT,
      addConfigInfo: {
        parser: ENV.CONN_CONFIG_PARSER,
        option: ENV.CONN_CONFIG_DELIMITER_HX,
      },
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
