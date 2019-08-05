const _ = require('lodash');

const { BM } = require('base-model-jh');

const { BU, CU } = require('base-util-jh');

class Model {
  constructor() {
    this.deviceData = {};
  }

  /**
   * 저장소를 깨끗이 비우고 현재 값을 초기화 시킴
   */
  async init() {
    await this.setModel();

    const averConfig = {
      maxStorageNumber: 30, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData),
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
    this.averageStorage.hasCenterAverage = true;

    this.averageStorage.init();
  }

  /**
   * 모델 정의
   */
  async setModel() {
    this.biModule = new BM(this.config.dbInfo);

    /** @type {CONNECTOR[]} */
    this.connectorRows = await this.biModule.getTable('connetor');

    // 장치 데이터 세팅
    this.connectorRows.forEach(solarRow => {
      solarRow.remote_addr = Buffer.from(solarRow.remote_addr, 'hex').toString();
      _.set(this.deviceData, [solarRow.solar_id], null);
    });
  }

  /** 평균 값 산출 저장소 데이터 초기화 */
  initDeviceData() {
    this.averageStorage.init();
  }

  /**
   * 경사 일사량 데이터
   * @param {number[]} inclinedSolar
   */
  onData(inclinedSolar) {
    if (inclinedSolar.length) {
      if (_.isNumber(_.head(inclinedSolar))) {
        this.averageStorage.addData('inclinedSolar', _.round(_.head(inclinedSolar) * 0.1), 1);
      }
    } else {
      // 에러나면 평균 값 인덱스 1개 제거
      const foundIt = _.get(this.averageStorage.dataStorage, 'inclinedSolar', []);
      Array.isArray(foundIt) && foundIt.length && foundIt.shift();
    }

    BU.CLI(this.averageStorage.dataStorage);
    this.deviceData.inclinedSolar = this.averageStorage.getAverage('inclinedSolar');
    // BU.CLI('inclinedSolar', this.deviceData.inclinedSolar);
  }

  async insertDB(updateDate = new Date()) {
    const insertDataList = [];
    this.connectorRows.forEach(connectorRow => {});

    // 입력할 데이터가 있다면
    if (insertDataList.length) {
      console.log(BU.convertDateToText(new Date()));
      console.dir(this.deviceData);
      await this.biModule.setTables('connector_data', insertDataList, false);
    }
  }
}

module.exports = Model;
