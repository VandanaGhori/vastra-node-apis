module.exports = {
    sendResponse : function (success, code, message, data = null) {
        return { 'success': success, "code": code, "message": message, "data": data };
    }
}
