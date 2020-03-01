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

    /** @type {ZGB_BAT[]} */
    this.zgbBatRows = await this.biModule.getTable('zgb_bat', null, false);

    this.zigbeeAddrList = _.map(this.zgbBatRows, 'ieee_addr');
  }

  /** 평균 값 산출 저장소 데이터 초기화 */
  initDeviceData() {
    this.averageStorage.init();
  }

  /**
   *
   * @param {Buffer[]} bufData
   */
  onData(bufData) {
    // BU.log(bufData);
    const zgbCntDataList = bufData.toString().split('_');
    // BU.CLI(zgbCntDataList);

    // 데이터 분석
    const countNumber = zgbCntDataList[0];
    const zigbeeAddr = zgbCntDataList[1];

    // BU.CLIS(countNumber, zigbeeAddr);

    // CNT로 시작하지 않을경우 무시
    if (!_.includes(countNumber, 'CNT')) return false;

    // 리스트 중에 없는 지그비 일 경우 무시
    const zigbeeRow = _.find(this.zgbBatRows, { ieee_addr: zigbeeAddr });
    if (zigbeeRow === undefined) return false;

    /** @type {ZGB_BAT_DATA} */
    const insertInfo = {
      zgb_bat_seq: zigbeeRow.zgb_bat_seq,
      count_no: countNumber,
      recv_time: new Date(),
    };

    this.biModule.setTable('zgb_bat_data', insertInfo);
  }
}

module.exports = Model;
