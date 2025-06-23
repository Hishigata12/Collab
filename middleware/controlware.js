function isStrongPassword(pw) {
    return pw.length >= 8 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw);
}

module.exports = { isStrongPassword }