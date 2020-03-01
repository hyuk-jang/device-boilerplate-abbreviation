const _ = require('lodash');

const { BM } = require('base-model-jh');

const { BU, CU } = require('base-util-jh');

class Model {
  /**
   * 저장소를 깨끗이 비우고 현재 값을 초기화 시킴
   * @param {dbInfo} dbInfo
   */
  async init(dbInfo) {
    this.biModule = new BM(dbInfo);

    /** @type {ZGB_PIR[]} */
    this.zgbPirRows = await this.biModule.getTable('zgb_pir', null, false);

    this.zigbeeAddrList = _.map(this.zgbPirRows, 'ieee_addr');
  }

  /**
   *
   * @param {Buffer[]} bufData
   */
  onData(bufData) {
    // BU.log(bufData);

    const receiveData = bufData.toString();

    // Key Event가 아닐 경우 종료
    if (!_.includes(receiveData, 'KEY_EVT_')) return false;

    const zigbeeAddr = receiveData.replace('KEY_EVT_', '');

    // 리스트 중에 없는 지그비 일 경우 무시
    const zigbeeRow = _.find(this.zgbPirRows, { ieee_addr: zigbeeAddr });
    if (zigbeeRow === undefined) return false;

    /** @type {ZGB_PIR_DATA} */
    const insertInfo = {
      zgb_pir_seq: zigbeeRow.zgb_pir_seq,
      recv_time: new Date(),
    };

    // BU.CLI(insertInfo);

    this.biModule.setTable('zgb_pir_data', insertInfo, false);
  }
}

module.exports = Model;
