const _ = require('lodash');

const { BM } = require('base-model-jh');

const { BU } = require('base-util-jh');

class Model {
  /**
   * 저장소를 깨끗이 비우고 현재 값을 초기화 시킴
   * @param {dbInfo} dbInfo
   */
  async init(dbInfo) {
    this.biModule = new BM(dbInfo);

    /** @type {BLE_SCAN[]} */
    this.bleScanRows = await this.biModule.getTable('ble_scan', null, false);
    // BU.CLI(this.bleScanRows);

    this.bleAddrList = _.map(this.bleScanRows, 'ble_addr');

    /** @type {BLE_SCAN_DATA[]} */
    this.dataStorageList = [];
  }

  /**
   *
   * @param {Buffer[]} bufData
   */
  onData(bufData) {
    // BU.log(bufData);

    const bleScanDataList = bufData.toString().split(',');
    // BU.CLI(_.head(bleScanDataList));
    const bleScanRow = _.find(this.bleScanRows, { ble_addr: _.head(bleScanDataList) });

    // 목록에 없을 경우
    if (bleScanRow === undefined) return false;

    switch (bleScanRow.model_name) {
      case '770':
        this.on770Parser(bleScanDataList, bleScanRow);
        break;
      case '780':
        this.on780Parser(bleScanDataList, bleScanRow);
        break;

      default:
        break;
    }
  }

  /**
   * 블루투스 770 타입 스캔 데이터 목록
   * @param {string[]} bleScanDataList
   * @param {BLE_SCAN} bleScanRow
   */
  on770Parser(bleScanDataList, bleScanRow) {
    // BU.CLI('on770Parser', bleScanDataList);
    const { ble_scan_seq: bleScanSeq } = bleScanRow;
    // 저장소의 마지막 bleAddr 명을 가진 객체 추출
    /** @type {BLE_SCAN_DATA} */
    let dataStorage = _.findLast(this.dataStorageList, { ble_scan_seq: bleScanSeq });
    // new or update Flag 지정
    let isNewFlag = false;

    // BU.CLI(dataStorage);
    // 저장소의 객체가 없거나 기존 객체가 완전할 경우는 새로운 데이터
    if (dataStorage === undefined || this.is770FullData(dataStorage)) {
      // 저장소의 객체가 완전할 경우  row 빈 객체 생성,
      dataStorage = {
        ble_scan_seq: bleScanSeq,
        adc0: null,
        adc1: null,
        bat_v: null,
        data_flag: null,
        gpio: null,
        recv_time: new Date(),
        rssi: null,
        temp: null,
        tx_power: null,
      };
      isNewFlag = true;
    }

    // BU.CLI(dataStorage);
    const secondData = _.nth(bleScanDataList, 1);
    const thirdData = _.nth(bleScanDataList, 2);
    const fourthData = _.nth(bleScanDataList, 3);

    // 0201~ 로 시작할 경우 로직
    if (_.includes(secondData, '0201')) {
      if (secondData.length === 6) {
        dataStorage.data_flag = secondData.slice(4, 6);
      }

      if (thirdData.length === 10) {
        dataStorage.gpio = thirdData.slice(4, 6);
        dataStorage.adc1 = parseInt(thirdData.slice(6, 8), 16);
        dataStorage.adc0 = parseInt(thirdData.slice(8, 10), 16);
      }

      if (fourthData.length === 6) {
        dataStorage.rssi = parseInt(fourthData.slice(4, 6), 16) - 256;
      }
    }

    // 모델명으로 시작할 경우 로직
    else {
      if (thirdData.length === 6) {
        dataStorage.tx_power = thirdData.slice(4, 6);
      }
      if (fourthData.length === 6) {
        dataStorage.rssi = parseInt(fourthData.slice(4, 6), 16) - 256;
      }
    }

    // new 일 경우 저장소에 push
    if (isNewFlag) {
      this.dataStorageList.push(dataStorage);
    }

    // update 일 경우 기존 객체에 합침
  }

  /**
   * 데이터가 2번에 걸쳐서 완전한 데이터로 이루어졌는지 판단
   * @param {BLE_SCAN_DATA} dataStorage
   */
  is770FullData(dataStorage) {
    // Tx Power 와 data Flag 가 있다면 완전하다고 판단
    return dataStorage.tx_power && dataStorage.data_flag;
  }

  /**
   * 블루투스 780 타입 스캔 데이터 목록
   * @param {string[]} bleScanDataList
   * @param {BLE_SCAN} bleScanRow
   */
  on780Parser(bleScanDataList, bleScanRow) {
    // BU.CLI('on780Parser', bleScanDataList);
    const { ble_scan_seq: bleScanSeq } = bleScanRow;
    /** @type {BLE_SCAN_DATA} */
    const dataStorage = {
      ble_scan_seq: bleScanSeq,
      adc0: null,
      adc1: null,
      bat_v: null,
      data_flag: null,
      gpio: null,
      recv_time: new Date(),
      rssi: null,
      temp: null,
      tx_power: null,
    };

    const thirdData = _.nth(bleScanDataList, 2);
    const fourthData = _.nth(bleScanDataList, 3);
    const fifthData = _.nth(bleScanDataList, 4);
    const sixthData = _.nth(bleScanDataList, 5);

    if (thirdData.length === 6) {
      dataStorage.data_flag = thirdData.slice(4, 6);
    }

    if (fourthData.length === 6) {
      dataStorage.tx_power = fourthData.slice(4, 6);
    }

    if (fifthData.length === 18) {
      dataStorage.gpio = fifthData.slice(4, 6);
      dataStorage.adc1 = parseInt(fifthData.slice(6, 8), 16);
      dataStorage.adc0 = parseInt(fifthData.slice(8, 10), 16);
      dataStorage.bat_v = parseInt(fifthData.slice(10, 14), 16);
      dataStorage.temp = parseInt(fifthData.slice(14, 18), 16);
    }

    if (sixthData.length === 6) {
      dataStorage.rssi = parseInt(sixthData.slice(4, 6), 16) - 256;
    }

    this.dataStorageList.push(dataStorage);
  }

  /** 데이터 DB 입력 */
  async insertDB() {
    // 입력할 데이터가 없다면 종료
    if (this.dataStorageList.length > 0) return false;

    const insetDataList = this.dataStorageList;
    this.dataStorageList = [];
    // DB 데이터 반영

    // BU.CLI(insetDataList);

    await this.biModule.setTables('ble_scan_data', insetDataList, false);
  }
}

module.exports = Model;

if (require !== undefined && require.main === module) {
  const model = new Model();
  model.dataStorageList = [];

  model.bleScanRows = [
    {
      ble_addr: 'C4BE84E43383',
      ble_scan_seq: 1,
      model_name: '770',
    },
    {
      ble_addr: '00190148D001',
      ble_scan_seq: 2,
      model_name: '780',
    },
  ];

  // model.onData('C4BE84E43383,020104,04FF010203,0200BB');
  // BU.CLI(model.dataStorageList);
  // model.onData('C4BE84E43383,Marine_FBL770_T01,020A00,0200BB');
  // BU.CLI(model.dataStorageList);

  // model.onData('C4BE84E43383,020106,04FF010203,0200BB');
  // BU.CLI(model.dataStorageList);
  // model.onData('C4BE84E43383,Marine_FBL770_T01,020A11,0200CC');
  // BU.CLI(model.dataStorageList);

  // model.onData('00190148D001,Marine_780_T01,020104,020A02,08FFFF17150D140018,0200A9');
  // BU.CLI(model.dataStorageList);

  // model.onData('00190148D001,Marine_780_T01,020104,020A02,08FFFF17150D140018,0200A9');
  // BU.CLI(model.dataStorageList);
}
