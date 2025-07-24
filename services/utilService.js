class UtilService {
    checkValidString(inpVal) {
        return inpVal != null && 'string' == typeof inpVal && inpVal.trim() != '';
    }

    checkValidNumber(inpVal) {
        return 'undefined' != typeof inpVal && inpVal != null && (/^\d+$/).test(inpVal);
    }

    checkValidObject(inpVal) {
        return inpVal != null && 'object' == typeof inpVal && !Array.isArray(inpVal);
    }

    checkValidArray(inpVal) {
        return inpVal != null && 'object' == typeof inpVal && Array.isArray(inpVal);
    }

    checkValidEmailId(inpVal) {
        return this.checkValidString(inpVal) && (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(inpVal);
    }
}

module.exports = new UtilService();