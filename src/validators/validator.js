/**
 * Validates a username.
 * Username must be at least 3 characters long and contain only alphanumeric characters and underscores.
 * 
 * @param {string} username - The username to validate.
 * @returns {boolean} True if the username is valid, false otherwise.
 */
export function validateUsername(username) {
    const validUsername = /^[a-zA-Z0-9_]{3,}$/;
    return validUsername.test(username);
}

/**
 * Validates a password.
 * Password must be at least 6 characters long and contain at least one uppercase letter,
 * one lowercase letter, one number, and one special character.
 * 
 * @param {string} password - The password to validate.
 * @returns {boolean} True if the password is valid, false otherwise.
 */
export function validatePassword(password) {
    const validPassword = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return validPassword.test(password);
}


