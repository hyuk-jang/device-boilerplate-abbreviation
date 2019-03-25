const _ = require('lodash');
const fs = require('fs');
const eventToPromise = require('event-to-promise');
const EventEmitter = require('events');

const { BU } = require('base-util-jh');

const AbstController = require('device-client-controller-jh');
const Model = require('./Model');

const mainConfig = require('./config');

// const AbstController = require('../../device-client-controller-jh');

require('../../default-intelligence');

class Control extends EventEmitter {
  /** @param {mainConfig} config */
  constructor(config = mainConfig) {
    super();
    this.config = config;

    // const productionPath = process.env.DEV_MODE === 'dev' ? `${process.cwd()}/config.js`;

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
    BU.CLI('init');
    if (process.env.DEV_MODE !== 'dev') {
      const realOption = await fs.readFileSync(`${process.cwd()}/config.json`);
      if (BU.IsJsonString(realOption.toString())) {
        const json = JSON.parse(realOption.toString());
        this.config.deviceInfo.connect_info.port = json.comPort;
        this.config.dbInfo.database = json.database;
        this.config.dbInfo.host = json.host;
        this.config.dbInfo.user = json.user;
        this.config.dbInfo.password = json.password;
      }
    }

    // 모델 선언
    this.model = new Model(this);

    await this.model.init();

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
    try {
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
    } catch (error) {
      throw error;
    }
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
    // console.log(bufData);
    this.model.onData(bufData);
  }
}
module.exports = Control;
