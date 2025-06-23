import {EventHarness} from "../framework/EventHarness";

export class DeviceType extends EventHarness {
	static DEVICE_TYPE_UNKNOWN = 'unknown';
	static DEVICE_TYPE_UNCHECKED = 'unchecked';
	static DEVICE_TYPE_MOBILE = 'mobile';
	static DEVICE_TYPE_IMMOBILE = 'immobile';

	/**
	 * global flag affecting the behaviour of some GPS functionality,
	 * e.g. on a non-mobile device don't automatically seek GPS locality for new records
	 * @private
	 *
	 * @type {string}
	 */
	static _deviceType = DeviceType.DEVICE_TYPE_UNCHECKED;

	/**
	 * @type {App}
	 */
	static app;

	/**
	 * @returns {string}
	 */
	static getDeviceType() {
		if (DeviceType._deviceType === DeviceType.DEVICE_TYPE_UNCHECKED) {
			const override = DeviceType?.app?.getOption?.('mobileOverride');

			if (override === 'mobile') {
				DeviceType._deviceType = DeviceType.DEVICE_TYPE_MOBILE;
			} else if (override === 'immobile') {
				DeviceType._deviceType = DeviceType.DEVICE_TYPE_IMMOBILE;
			} else {
				DeviceType._deviceType = DeviceType.getDeviceTypeUncached();
			}
		}

		return DeviceType._deviceType;
	}

	/**
	 *
	 * @returns {boolean} true if the device type has changed
	 */
	static reevaluate() {
		const previous = DeviceType._deviceType;
		DeviceType._deviceType = DeviceType.DEVICE_TYPE_UNCHECKED; // reset
		DeviceType._deviceType = DeviceType.getDeviceType();

		return previous !== DeviceType._deviceType;
	}

	/**
	 *
	 * @param {string} deviceType
	 */
	static setDeviceType(deviceType) {
		DeviceType._deviceType = deviceType;
	}

	// /**
	//  * @returns {string}
	//  */
	// static getDeviceType() {
	// 	if (DeviceType._deviceType === DeviceType.DEVICE_TYPE_UNCHECKED) {
	// 		// noinspection JSUnresolvedReference
	// 		if (navigator.userAgentData && "mobile" in navigator.userAgentData) {
	// 			DeviceType._deviceType = navigator.userAgentData.mobile ?
	// 				DeviceType.DEVICE_TYPE_MOBILE : DeviceType.DEVICE_TYPE_IMMOBILE;
	// 			console.log(`Evaluated device using mobile flag, result: ${DeviceType._deviceType}`);
	// 		} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
	// 			// see https://javascript.plainenglish.io/how-to-detect-a-mobile-device-with-javascript-1c26e0002b31
	// 			console.log(`Detected mobile via use-agent string: ${navigator.userAgent}`);
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_MOBILE;
	// 		} else if (navigator.platform && /iPhone|iPad/.test(navigator.platform)) {
	// 			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
	// 			console.log(`Detected mobile via platform string: ${navigator.platform}`);
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_MOBILE;
	// 		} else if (navigator.platform && /Win32|^Mac/.test(navigator.platform)) {
	// 			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
	// 			console.log(`Detected immobility via platform string: ${navigator.platform}`);
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_IMMOBILE;
	// 		} else {
	// 			console.log('Flagging device type as unknown.');
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_UNKNOWN;
	// 		}
	// 	}
	//
	// 	return DeviceType._deviceType;
	// }

	/**
	 * Evaluates the device type based on browser information, does not consider user-set overrides.
	 *
	 * @returns {string}
	 */
	static getDeviceTypeUncached() {
		// noinspection JSUnresolvedReference
		if (navigator.userAgentData && "mobile" in navigator.userAgentData) {
			return navigator.userAgentData.mobile ?
				DeviceType.DEVICE_TYPE_MOBILE : DeviceType.DEVICE_TYPE_IMMOBILE;
			// console.log(`Evaluated device using mobile flag, result: ${DeviceType._deviceType}`);
		} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
			// see https://javascript.plainenglish.io/how-to-detect-a-mobile-device-with-javascript-1c26e0002b31
			//console.log(`Detected mobile via use-agent string: ${navigator.userAgent}`);
			return DeviceType.DEVICE_TYPE_MOBILE;
		} else if (navigator.platform && /iPhone|iPad/.test(navigator.platform)) {
			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
			//console.log(`Detected mobile via platform string: ${navigator.platform}`);
			return DeviceType.DEVICE_TYPE_MOBILE;
		} else if (navigator.platform && /Win32|^Mac/.test(navigator.platform)) {
			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
			//console.log(`Detected immobility via platform string: ${navigator.platform}`);
			return DeviceType.DEVICE_TYPE_IMMOBILE;
		} else {
			//console.log('Flagging device type as unknown.');
			return DeviceType.DEVICE_TYPE_UNKNOWN;
		}
	}
}
