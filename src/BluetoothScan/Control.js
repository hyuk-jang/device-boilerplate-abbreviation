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
    this.scanIntervalSec = Number(process.env.BLE_SCAN_INTERVAL_SEC || 60);
    this.scanDurationSec = Number(process.env.BLE_SCAN_DURATION_SEC || 3);

    this.startScanCmd = 'at+reqscan1\r';
    this.endScanCmd = 'at+reqscan0\r';

    this.currentScanCmd = '';
    this.retryChance = 5;
  }

  /**
   */
  async init() {
    // 모델 선언
    this.model = new Model();

    await this.model.init(this.config.dbInfo);

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
    console.log('runScheduler');
    if (this.setInterval !== null) {
      // BU.CLI('Stop')
      clearInterval(this.setInterval);
    }

    // Scan Interval
    this.setInterval = setInterval(() => {
      this.inquiryDevice();
    }, 1000 * this.scanIntervalSec);

    return true;
  }

  /**
   * 장치로 명령 전송
   * @param {*} msg 보낼 명령
   */
  async writeMsg(msg) {
    console.log('writeMsg', msg);
    // 현재 수행 중인 명령 입력
    this.currentScanCmd = msg;

    await this.deviceController.write(msg);
  }

  /** 주기적으로 요청할 로직 */
  inquiryDevice() {
    // BU.CLI('inquiryDevice', this.startScanCmd);
    this.retryChance = 5;
    this.writeMsg(this.startScanCmd);

    // 스캔 종료
    setTimeout(() => {
      this.retryChance = 5;
      this.writeMsg(this.endScanCmd);
      // DB에 데이터 삽입
      this.model.insertDB();
    }, 1000 * this.scanDurationSec);
  }

  /**
   * Device Controller에서 새로운 이벤트가 발생되었을 경우 알림
   * @param {string} eventName 'dcConnect' 연결, 'dcClose' 닫힘, 'dcError' 에러
   */
  onEvent(eventName) {
    // BU.CLI(eventName);
    const { CONNECT, DISCONNECT } = this.definedControlEvent;

    switch (eventName) {
      case CONNECT:
        this.emit(CONNECT);
        // 즉시 스캔 명령 요청
        this.inquiryDevice();
        // Scan 스케줄러 동작
        this.runScheduler();
        break;
      case DISCONNECT:
        this.emit(DISCONNECT);
        // Scan 스케줄러 종료
        this.setInterval !== null && clearInterval(this.setInterval);
        this.model.insertDB();
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
    // 에러 메시지를 수신받았고 현재 수행중인 명령이 있고 재시도 횟수가 존재할 경우
    if (bufData === 'ERROR' && this.currentScanCmd.length && this.retryChance > 0) {
      this.retryChance -= 1;
      return this.writeMsg(this.currentScanCmd);
    }
    // 전송메시지가 성공했을 경우
    if (bufData === 'OK') {
      this.retryChance = 5;
      this.currentScanCmd = '';
    }

    console.log(bufData.toString());
    // BU.log(bufData.toString());
    this.model.onData(bufData);
  }
}
module.exports = Control;
