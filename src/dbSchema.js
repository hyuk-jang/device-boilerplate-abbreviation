/**
 * @typedef {Object} ZGB_BAT  지그비 배터리
 * @property {number} zgb_bat_seq 지그배 배터리 시퀀스
 * @property {string} ieee_addr IEEE 주소
 * @property {string} alias 별명
 * @property {string} model_name 모델 명
 * @property {string} antenna 안테나
 * @property {string} role 롤
 * @property {string} bat 배터리
 * @property {Date} update_date 등록 시간
 */

/**
 * @typedef {Object} ZGB_BAT_DATA  지그비 배터리 수신데이터
 * @property {number} zgb_bat_data_seq 지그비 배터리 수신데이터 시퀀스
 * @property {number} zgb_bat_seq 지그배 배터리 시퀀스
 * @property {string} count_no 입력 번호
 * @property {Date} recv_time 입력 시간
 */

/**
 * @typedef {Object} ZGB_PIR  지그비 PIR
 * @property {number} zgb_pir_seq 지그비 PIR 시퀀스
 * @property {string} ieee_addr IEEE 주소
 * @property {string} alias 별명
 * @property {string} model_name 모델 명
 * @property {string} antenna 안테나
 * @property {string} role 롤
 * @property {string} bat 배터리
 * @property {Date} update_date 등록 시간
 */

/**
 * @typedef {Object} ZGB_PIR_DATA  지그비 PIR 수신데이터
 * @property {number} zgb_pir_data_seq 지그비 PIR 수신데이터 시퀀스
 * @property {number} zgb_pir_seq 지그비 PIR 시퀀스
 * @property {Date} recv_time 입력 시간
 */

/**
 * @typedef {Object} BLE_SCAN  블루투스 스캔
 * @property {number} ble_scan_seq 블루투스 스캔 시퀀스
 * @property {string} ble_addr 블루투스 주소
 * @property {string} model_name 770 or 780
 * @property {string} alias 별명
 * @property {Date} update_date 등록 시간
 */

/**
 * @typedef {Object} BLE_SCAN_DATA  블루투스 스캔 데이터
 * @property {number} ble_scan_data_seq 블루투스 스캔 데이터 시퀀스
 * @property {number} ble_scan_seq 블루투스 스캔 시퀀스
 * @property {string} model_name 770 or 780
 * @property {string} data_flag 데이터 플래그
 * @property {number} tx_power Tx Power
 * @property {string} gpio GPIO
 * @property {number} adc1 ADC1
 * @property {number} adc0 ADC0
 * @property {number} bat_v BAT_V
 * @property {number} temp TEMP
 * @property {number} rssi RSSI
 * @property {Date} recv_time 입력 시간
 */

/**
 * @desc VIEW TABLE
 * @typedef {Object} V_BLE_SCAN_DATA 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
 * @property {string} model_name 770 or 780
 * @property {string} alias 별명
 * @property {string} ble_addr 블루투스 주소
 * @property {number} ble_scan_data_seq 블루투스 스캔 데이터 시퀀스
 * @property {number} ble_scan_seq 블루투스 스캔 시퀀스
 * @property {string} data_flag 데이터 플래그
 * @property {number} tx_power Tx Power
 * @property {string} gpio GPIO
 * @property {number} adc1 ADC1
 * @property {number} adc0 ADC0
 * @property {number} bat_v BAT_V
 * @property {number} temp TEMP
 * @property {number} rssi RSSI
 * @property {Date} recv_time 입력 시간
 */

/**
 * @desc VIEW TABLE
 * @typedef {Object} V_BLE_SCAN_STATUS 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
 * @property {string} alias 별명
 * @property {string} ble_addr 블루투스 주소
 * @property {number} ble_scan_data_seq 블루투스 스캔 데이터 시퀀스
 * @property {number} ble_scan_seq 블루투스 스캔 시퀀스
 * @property {string} data_flag 데이터 플래그
 * @property {number} tx_power Tx Power
 * @property {string} gpio GPIO
 * @property {number} adc1 ADC1
 * @property {number} adc0 ADC0
 * @property {number} bat_v BAT_V
 * @property {number} temp TEMP
 * @property {number} rssi RSSI
 * @property {Date} recv_time 입력 시간
 */

/**
 * @desc VIEW TABLE
 * @typedef {Object} V_ZGB_BAT_DATA 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
 * @property {string} ieee_addr IEEE 주소
 * @property {string} count_no 입력 번호
 * @property {Date} recv_time 입력 시간
 */

/**
 * @desc VIEW TABLE
 * @typedef {Object} V_ZGB_BAT_STATUS 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
 * @property {string} ieee_addr IEEE 주소
 * @property {string} count_no 입력 번호
 * @property {Date} recv_time 입력 시간
 */

/**
 * @desc VIEW TABLE
 * @typedef {Object} V_ZGB_PIR_DATA 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
 * @property {string} ieee_addr IEEE 주소
 * @property {Date} recv_time 입력 시간
 */

/**
 * @desc VIEW TABLE
 * @typedef {Object} V_ZGB_PIR_STATUS 종속성 오류를 극복하기 위해 임시 테이블을 생성합니다.
 * @property {string} ieee_addr IEEE 주소
 * @property {Date} recv_time 입력 시간
 */

module;
