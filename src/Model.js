const _ = require('lodash');

const { BU, CU } = require('base-util-jh');

class Model {
  constructor() {
    this.deviceData = {
      inclinedSolar: null,
    };

    const averConfig = {
      maxStorageNumber: 30, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData),
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
    this.averageStorage.hasCenterAverage = true;
  }

  /**
   * 저장소를 깨끗이 비우고 현재 값을 초기화 시킴
   */
  init() {
    this.averageStorage.init();
    this.deviceData = {
      inclinedSolar: null,
    };
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
}

module.exports = Model;
