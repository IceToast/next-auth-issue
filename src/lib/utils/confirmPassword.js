import bcrypt from 'bcrypt'

/**
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 * @description Compare plain password with hashed password
 */
export default (plainPassword, hashedPassword) => {
    return new Promise(resolve => {
        bcrypt.compare(plainPassword, hashedPassword, function (err, res) {
            if (err) return resolve(false)
            resolve(res)
        })
    })
}
