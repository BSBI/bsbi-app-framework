import {EventHarness} from "../framework/EventHarness";

/**
 * Wrapper for GPS access, including support for user-interface nudges
 */
export class GPSRequest extends EventHarness {

    static DEVICE_TYPE_UNKNOWN = 'unknown';
    static DEVICE_TYPE_UNCHECKED = 'unchecked';
    static DEVICE_TYPE_MOBILE = 'mobile';
    static DEVICE_TYPE_IMMOBILE = 'immobile';

    static EVENT_GPS_PERMISSION_CHANGE = 'gpspermissionchange';

    /**
     * global flag affecting behaviour of some GPS functionality
     * e.g. on a non-mobile device, don't automatically seek GPS locality for new records
     *
     * @type {string}
     */
    static _deviceType = GPSRequest.DEVICE_TYPE_UNCHECKED;

    /**
     * @returns {string}
     */
    static getDeviceType() {
        if (GPSRequest._deviceType === GPSRequest.DEVICE_TYPE_UNCHECKED) {
            if (navigator.userAgentData) {
                GPSRequest._deviceType = navigator.userAgentData.mobile ?
                    GPSRequest.DEVICE_TYPE_MOBILE : GPSRequest.DEVICE_TYPE_IMMOBILE;
                console.log(`Evaluated device using mobile flag, result: ${GPSRequest._deviceType}`);
            } else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                // see https://javascript.plainenglish.io/how-to-detect-a-mobile-device-with-javascript-1c26e0002b31
                console.log(`Detected mobile via use-agent string: ${navigator.userAgent}`);
                GPSRequest._deviceType = GPSRequest.DEVICE_TYPE_MOBILE;
            } else {
                console.log('Flagging device type as unknown.');
                GPSRequest._deviceType = GPSRequest.DEVICE_TYPE_UNKNOWN;
            }
        }

        return GPSRequest._deviceType;
    }

    static GPS_PERMISSION_UNKNOWN = 'unknown';
    static GPS_PERMISSION_UNCHECKED = 'unchecked';
    static GPS_PERMISSION_GRANTED = 'granted';
    static GPS_PERMISSION_DENIED = 'denied';
    static GPS_PERMISSION_PROMPT = 'prompt';

    static _gpsPermission = GPSRequest.GPS_PERMISSION_UNCHECKED;

    /**
     * @type {GPSRequest}
     */
    static gpsEventObject;

    /**
     * @returns {string} GPSRequest.GPS_PERMISSION_
     */
    static async haveGPSPermission() {
        if (GPSRequest._gpsPermission === GPSRequest.GPS_PERMISSION_UNCHECKED) {
            GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN; // make unknown while checking to avoid any race condition
            GPSRequest.gpsEventObject = new GPSRequest();

            if (navigator.permissions && navigator.permissions.query) {
                await navigator.permissions.query({name: 'geolocation'}).then(function (permissionStatus) {
                    permissionStatus.onchange = function () {
                        console.log('geolocation permission status has changed to ', this.state);
                        GPSRequest._gpsPermission = this.state;
                        GPSRequest.gpsEventObject.fireEvent(GPSRequest.EVENT_GPS_PERMISSION_CHANGE, GPSRequest._gpsPermission);
                    };

                    //console.log({'GPS permission state': permissionStatus.state});
                    GPSRequest._gpsPermission = permissionStatus.state;
                })
            } else {
                GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN;
            }
        }

        return GPSRequest._gpsPermission;
    }

    /**
     * returns a promise with GPSRequest.GPS_PERMISSION_ parameter
     *
     * @returns {Promise<string>} GPSRequest.GPS_PERMISSION_
     */
    static haveGPSPermissionPromise() {
        if (GPSRequest._gpsPermission === GPSRequest.GPS_PERMISSION_UNCHECKED) {
            GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN; // make unknown while checking to avoid any race condition

            GPSRequest.gpsEventObject = new GPSRequest();

            if (navigator.permissions && navigator.permissions.query) {
                return navigator.permissions.query({name: 'geolocation'}).then(function (permissionStatus) {
                    permissionStatus.onchange = function () {
                        console.log('geolocation permission status has changed to ', this.state);
                        GPSRequest._gpsPermission = this.state;
                        GPSRequest.gpsEventObject.fireEvent(GPSRequest.EVENT_GPS_PERMISSION_CHANGE, GPSRequest._gpsPermission);
                    };

                    //console.log({'GPS permission state': permissionStatus.state});
                    GPSRequest._gpsPermission = permissionStatus.state;
                    return GPSRequest._gpsPermission;
                })
            } else {
                GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_UNKNOWN;

                return new Promise(() => GPSRequest._gpsPermission);
            }
        } else {
            return new Promise(() => GPSRequest._gpsPermission);
        }
    }

    static _setGPSPermission(state) {
        if (GPSRequest._gpsPermission !== state) {
            GPSRequest._gpsPermission = state;

            if (GPSRequest.gpsEventObject) {
                GPSRequest.gpsEventObject.fireEvent(GPSRequest.EVENT_GPS_PERMISSION_CHANGE, GPSRequest._gpsPermission);
            }
        }
    }

    /**
     *
     * @param {string=} gpsPromptBannerId
     * @return Promise
     */
    static seekGPS (gpsPromptBannerId) {
        GPSRequest.haveGPSPermission(); // ensures that GPSRequest._gpsPermission is initialised

        // for delayed prompt see Google's UI advice here: https://developers.google.com/web/fundamentals/native-hardware/user-location
        let nudge = gpsPromptBannerId ? document.getElementById(gpsPromptBannerId) : null;

        let showNudgeBanner = nudge ? function() {
            nudge.style.display = "block";
        } : function() {};

        let hideNudgeBanner = nudge ? function() {
            nudge.style.display = "none";
        } : function() {};

        let nudgeTimeoutId;

        if (nudge && GPSRequest._gpsPermission !== GPSRequest.GPS_PERMISSION_GRANTED) {
            nudgeTimeoutId = setTimeout(showNudgeBanner, 5000);
        } else {
            nudgeTimeoutId = null;
        }

        return new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy : true,
                timeout : 30 * 1000, // 30 second timeout
                maximumAge : 20 * 1000, // can use a cached response from up to 20s ago
            })
        ).then((position) => {
            // const latitude  = position.coords.latitude;
            // const longitude = position.coords.longitude;

            //
            //
            // const gridCoords = GridCoords.from_latlng(latitude, longitude);
            // const gridRef = gridCoords.to_gridref(1000);
            //
            // console.log(`Got grid-ref: ${gridRef}`);
            // this.value = gridRef;
            // this.fireEvent(FormField.EVENT_CHANGE);

            const latitude  = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log(`Got GPS fix ${latitude} , ${longitude}`);
            //@todo maybe should prevent use of readings if speed is too great (which might imply use of GPS in a moving vehicle)

            // this.processLatLngPosition(
            //     position.coords.latitude,
            //     position.coords.longitude,
            //     position.coords.accuracy * 2
            // );

            if (nudge) {
                clearTimeout(nudgeTimeoutId);
                hideNudgeBanner();
            }

            // unsure if this should be set as permission may only have been one-off
            //GPSRequest._gpsPermission = GPSRequest.GPS_PERMISSION_GRANTED;
            GPSRequest._setGPSPermission(GPSRequest.GPS_PERMISSION_GRANTED);

            return position;
        }, (error) => {
            console.log({'gps look-up failed' : error});

            switch(error.code) {
                case error.TIMEOUT:
                case error.PERMISSION_DENIED:
                    // The user didn't accept the callout
                    nudge && showNudgeBanner();
                    break;
            }

            return null;
        });
    }
}


