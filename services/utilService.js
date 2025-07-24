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

    capitalizeEachWord(sentence) {
        const words = sentence.split(' ');
        const capitalizedWords = words.map(word => {
            if (word.length === 0) {
                return '';
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        return capitalizedWords.join(' ');
    }

}

module.exports = new UtilService();