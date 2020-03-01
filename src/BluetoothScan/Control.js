const _ = require('lodash');
const eventToPromise = require('event-to-promise');
const EventEmitter = require('events');

const { BU } = require('base-util-jh');
const AbstController = require('device-client-controller-jh');
require('default-intelligence');

const Model = require('./Model');

class Control extends EventEmitter {
  /** @param {projectConfig} config */
  constructor(config) {
    super();
    this.config = config;
    this.deviceInfo = this.config.deviceInfo;

    this.setInterval = null;

    // 스캔 인터벌
    this.scanIntervalSec = Number(process.env.BLE_SCAN_INTERVAL_SEC);
    this.scanDurationSec = Number(process.env.BLE_SCAN_DURATION_SEC);

    this.startScanCmd = 'at+reqscan1';
    this.endScanCmd = 'at+reqscan0';
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
    this.model = new Model();

    await this.model.init(this.config.dbInfo);

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
      // BU.error(error);

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

    // Scan Interval
    this.setInterval = setInterval(() => {
      this.model.insertDB();
      this.model.initDeviceData();
    }, 1000 * this.scanIntervalSec);

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

  /** 주기적으로 요청할 로직 */
  inquiryDevice() {
    this.writeMsg(this.startScanCmd);

    // 스캔 종료
    setTimeout(() => {
      this.writeMsg(this.endScanCmd);

      // DB에 데이터 삽입
      this.model.insertDB();
    }, 1000 * this.scanDurationSec);
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
    console.log(bufData.toString());
    // BU.log(bufData.toString());
    this.model.onData(bufData);
  }
}
module.exports = Control;
