const jwt = require('jsonwebtoken');

let verify = (req, res, next) => {

    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.verifiedUser = verified;
        next();
    } catch (err) {

    }
}


module.exports = verify;