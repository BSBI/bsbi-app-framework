import {EventHarness} from "../framework/EventHarness";

export class DeviceType extends EventHarness {
	static DEVICE_TYPE_UNKNOWN = 'unknown';
	static DEVICE_TYPE_UNCHECKED = 'unchecked';
	static DEVICE_TYPE_MOBILE = 'mobile';
	static DEVICE_TYPE_IMMOBILE = 'immobile';

	/**
	 * global flag affecting behaviour of some GPS functionality
	 * e.g. on a non-mobile device, don't automatically seek GPS locality for new records
	 * @private
	 *
	 * @type {string}
	 */
	static _deviceType = DeviceType.DEVICE_TYPE_UNCHECKED;

	/**
	 * @returns {string}
	 */
	static getDeviceType() {
		if (DeviceType._deviceType === DeviceType.DEVICE_TYPE_UNCHECKED) {
			// noinspection JSUnresolvedReference
			if (navigator.userAgentData && "mobile" in navigator.userAgentData) {
				DeviceType._deviceType = navigator.userAgentData.mobile ?
					DeviceType.DEVICE_TYPE_MOBILE : DeviceType.DEVICE_TYPE_IMMOBILE;
				console.log(`Evaluated device using mobile flag, result: ${DeviceType._deviceType}`);
			} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
				// see https://javascript.plainenglish.io/how-to-detect-a-mobile-device-with-javascript-1c26e0002b31
				console.log(`Detected mobile via use-agent string: ${navigator.userAgent}`);
				DeviceType._deviceType = DeviceType.DEVICE_TYPE_MOBILE;
			} else {
				console.log('Flagging device type as unknown.');
				DeviceType._deviceType = DeviceType.DEVICE_TYPE_UNKNOWN;
			}
		}

		return DeviceType._deviceType;
	}
}
