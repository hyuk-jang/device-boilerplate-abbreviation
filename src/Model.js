const _ = require('lodash');
const { BM } = require('base-model-jh');

const { BU, CU } = require('base-util-jh');

require('default-intelligence');

const Control = require('./Control');

/**
 * @typedef {Object} solarRow
 * @property {number} solar_seq
 * @property {string} solar_id
 * @property {string} solar_name
 * @property {string} remote_addr
 * @property {connect_info} connect_info
 * @property {protocol_info} protocol_info
 */

const ADC_VAL = 2.93;
const SOLAR_VAL = 1.67;

class Model {
  /**
   *
   * @param {Control} controller
   */
  constructor(controller = {}) {
    this.deviceData = {};
    this.config = controller.config;
  }

  /**
   * 저장소를 깨끗이 비우고 현재 값을 초기화 시킴
   */
  async init() {
    await this.setModel();

    this.averageStorage = new CU.AverageStorage({
      maxStorageNumber: 6,
      keyList: _.keys(this.deviceData),
    });

    this.averageStorage.hasCenterAverage = true;

    this.averageStorage.init();
  }

  /**
   * 일사량계 4개 책정
   */
  async setModel() {
    this.biModule = new BM(this.config.dbInfo);

    /** @type {solarRow[]} */
    this.solarRows = await this.biModule.getTable('solar');

    // 장치 데이터 세팅
    this.solarRows.forEach(solarRow => {
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
   * @param {Buffer} bufferData
   */
  onData(bufferData) {
    // const STX = bufferData.readIntBE(0, 1);
    if (bufferData.length !== 22) {
      return false;
    }

    const remoteAddr = bufferData.slice(4, 12);
    // ADC 변환 값 Voltage
    const adConvertVoltage = bufferData.readUInt16BE(19);
    // 수신 받은 체크섬

    const checksumBodyBuf = bufferData.slice(3, bufferData.length);

    const resultChecksum = Buffer.from([checksumBodyBuf.reduce((prev, next) => prev + next)]);

    if (!_.isEqual(resultChecksum, Buffer.from([0xff]))) {
      const checksum = bufferData.slice(bufferData.length - 1);
      const testBody = bufferData.slice(3, bufferData.length - 1);
      const sumBuffer = Buffer.from([testBody.reduce((prev, next) => prev + next)]);
      console.log(
        `체크섬이 맞지 않습니다. res: ${checksum.readUInt8()} expect: ${Buffer.from([
          0xff - sumBuffer.readUInt8(),
        ]).readUInt8()}`,
      );
      return false;
    }
    const vol = _.round(_.multiply(adConvertVoltage, ADC_VAL), 2);
    const solar = _.round(_.divide(vol, SOLAR_VAL));

    const solarRow = _.find(this.solarRows, { remote_addr: remoteAddr.toString() });

    // 일사량 객체를 찾는다면
    if (solarRow) {
      const solarId = solarRow.solar_id;
      this.averageStorage.addData(
        [solarId],
        _.eq(solarId, 'S_C') ? _.multiply(solar, 0.65) : solar,
      );

      _.set(this.deviceData, [solarId], this.averageStorage.getAverage(solarId));
    }

    // BU.CLI(this.deviceData);
  }

  async insertDB(updateDate = new Date()) {
    const insertDataList = [];
    this.solarRows.forEach(solarRow => {
      const { solar_seq, solar_id: solarId } = solarRow;
      const solar = _.get(this.deviceData, solarId);
      if (_.isNumber(solar)) {
        insertDataList.push({
          solar_seq,
          solar,
          writedate: updateDate,
        });
      }
    });

    // 입력할 데이터가 있다면
    if (insertDataList.length) {
      console.log(BU.convertDateToText(new Date()));
      console.dir(this.deviceData);
      await this.biModule.setTables('solar_data', insertDataList, false);
    }
  }
}

module.exports = Model;

if (require !== undefined && require.main === module) {
  const model = new Model();
  model.init().then(() => {
    const hexa = [
      '7e0012920013a2004109d17cfffec10100000400005e',
      '7e0012920013a2004109d1a0fffec10100000400003a',
      // '7e0012920013a2004109d153fffec101000004000087',
    ];

    hexa.forEach(hex => {
      const result = model.onData(Buffer.from(hex, 'hex'));
      // BU.CLI(result);
    });
    // model.onData(bufData);

    // model.insertDB();
  });
}
