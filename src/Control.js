const _ = require('lodash');
const eventToPromise = require('event-to-promise');
const EventEmitter = require('events');

const { BU } = require('base-util-jh');

const Model = require('./Model');

const mainConfig = require('./config');

const AbstController = require('../../device-client-controller-jh');

require('../../default-intelligence');

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
    try {
      const abstController = new AbstController();
      this.definedControlEvent = abstController.definedControlEvent;
      const { CONNECT, DISCONNECT } = this.definedControlEvent;

      this.deviceController = abstController.setDeviceController(this.config.deviceInfo);
      this.deviceController.attach(this);

      // 이미 접속 중인 객체가 있다면
      if (!_.isEmpty(this.deviceController.client)) {
        return this;
      }

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
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /** 경사 일사량 센서로 데이터를 요청하는 명령 발송 */
  inquiryDevice() {
    // BU.CLI('inquiryDevice');
    this.deviceController.write(this.config.incliendSolarInfo);
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
    BU.CLI(bufData);
    // const resultData = this.model.onData(bufData);

    // BU.CLI(this.getDeviceOperationInfo().data);
  }
}
module.exports = Control;
