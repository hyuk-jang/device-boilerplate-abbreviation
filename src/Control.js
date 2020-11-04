const _ = require('lodash');
const eventToPromise = require('event-to-promise');
const EventEmitter = require('events');

const { BU } = require('base-util-jh');
// const AbstController = require('device-client-controller-jh');
const AbstController = require('../../device-client-controller-jh');
require('default-intelligence');

const Model = require('./Model');
const mainConfig = require('./config');

class Control extends EventEmitter {
  /** @param {mainConfig} config */
  constructor(config = mainConfig) {
    super();
    this.config = config;
    this.deviceInfo = this.config.deviceInfo;

    this.setInterval = null;

    // BU.CLI(this.config);
  }

  /**
   * 컨트롤러 ID를 가져올 경우
   * @return {string} Device Controller를 대표하는 ID
   */
  get id() {
    return this.deviceInfo.target_id;
  }

  /**
   */
  async init() {
    // 모델 선언
    this.model = new Model(this);

    await this.model.init();

    try {
      const abstController = new AbstController();

      const serialList = await abstController.getSerialList();
      BU.CLI(serialList);

      this.definedControlEvent = abstController.definedControlEvent;
      const { CONNECT, DISCONNECT } = this.definedControlEvent;

      this.deviceController = abstController.setDeviceController(this.config.deviceInfo);
      this.deviceController.attach(this);

      // 이미 접속 중인 객체가 있다면
      if (!_.isEmpty(this.deviceController.client)) {
        return this;
      }

      // 장치 접속 관리자에게 접속 요청
      this.deviceController.doConnect();

      // Connect 결과 이벤트가 발생할때까지 대기
      await eventToPromise.multi(this, [CONNECT], [DISCONNECT]);

      return this;
    } catch (error) {
      BU.CLI(error);
      // 초기화에 실패할 경우에는 에러 처리
      if (error instanceof ReferenceError) {
        throw error;
      }
      // Controller 반환
      return this;
    }
  }

  /**
   * 주기적으로 명령을 실행하고자 할 경우
   */
  runScheduler() {
    BU.CLI('runScheduler');
    if (this.setInterval !== null) {
      // BU.CLI('Stop')
      clearInterval(this.setInterval);
    }

    // 1분마다 데이터 DB 저장
    this.setInterval = setInterval(() => {
      this.model.insertDB();
      this.model.initDeviceData();
    }, 1000 * 60);

    return true;
  }

  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {{id: string, config: Object, data: {}, systemErrorList: Array, troubleList: Array}}
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code22223', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: [],
    };
  }

  /**
   * 주기적으로 명령을 실행하고자 할 경우
   */
  runDeviceInquiryScheduler() {
    BU.CLI('runDeviceInquiryScheduler');
    if (this.setInterval !== null) {
      // BU.CLI('Stop')
      clearInterval(this.setInterval);
    }

    // 3초 마다 데이터 수신 확인
    this.setInterval = setInterval(() => {
      this.inquiryDevice();
    }, 3000);

    this.inquiryDevice();

    return true;
  }

  /**
   * 장치로 명령 전송
   * @param {*} msg 보낼 명령
   */
  async writeMsg(msg) {
    // BU.CLI('writeMsg', msg);
    await this.deviceController.write(msg);
  }

  disconnect() {
    this.deviceController.disconnect();
  }

  /** 경사 일사량 센서로 데이터를 요청하는 명령 발송 */
  inquiryDevice() {
    // BU.CLI('inquiryDevice');
    // this.deviceController.write('@state');
    // setTimeout(() => {
    //   BU.CLI('@@@@@@@@@ ON');
    //   this.deviceController.write('@on');
    // }, 1000);
    // setTimeout(() => {
    //   this.deviceController.write('@state');
    // }, 2000);
    // setTimeout(() => {
    //   BU.CLI('@@@@@@@@@ OFF');
    //   this.deviceController.write('@off');
    // }, 3000);
    // setTimeout(() => {
    //   this.deviceController.write('@state');
    // }, 4000);
    // this.deviceController.write(
    //   Buffer.concat([Buffer.from(':SOUR:INP:STAT?'), Buffer.from([0x0a])]),
    // );
    // this.deviceController.write(
    //   Buffer.concat([Buffer.from(':SOUR:INP:STAT ON'), Buffer.from([0x0a])]),
    // );
    // this.deviceController.write(Buffer.from('3a4d4541537572653a564f4c546167653f0a', 'hex'));
    // this.deviceController.write(
    //   Buffer.concat([Buffer.from(':SOUR:FUNC RES'), Buffer.from([0x0a])]),
    // );
    // this.deviceController.write(
    //   Buffer.concat([Buffer.from(':SOUR:RES:LEV:IMM 2'), Buffer.from([0x0d, 0x0a])]),
    // );
    // this.deviceController.write(
    //   Buffer.concat([Buffer.from(':MEASure:VOLTage?'), Buffer.from([0x0d, 0x0a])]),
    // );
    // setTimeout(() => {
    //   this.deviceController.write(Buffer.from(':MEASure:CURRent?\n'));
    // }, 11);
    // setTimeout(() => {
    //   this.deviceController.write(Buffer.from(':MEASure:CURRent?\n'));
    // }, 111);
    // setTimeout(() => {
    //   this.deviceController.write(Buffer.from('323120676574207274640d', 'hex'));
    // }, 111);
    // setTimeout(() => {
    //   this.deviceController.write(Buffer.from('21 get rtd\r'));
    // }, 222);
    // this.deviceController.write(this.config.incliendSolarInfo);
  }

  /**
   * Device Controller에서 새로운 이벤트가 발생되었을 경우 알림
   * @param {string} eventName 'dcConnect' 연결, 'dcClose' 닫힘, 'dcError' 에러
   */
  onEvent(eventName) {
    BU.CLI(eventName);
    const { CONNECT, DISCONNECT } = this.definedControlEvent;

    switch (eventName) {
      case CONNECT:
        this.emit(CONNECT);
        break;
      case DISCONNECT:
        this.emit(DISCONNECT);
        break;
      default:
        break;
    }
  }

  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {buffer} bufData 현재 장비에서 실행되고 있는 명령 객체
   */
  onData(bufData) {
    BU.CLI(bufData.toString());
    this.model.onData(bufData);
  }
}
module.exports = Control;
