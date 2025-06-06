const jwt = require('jsonwebtoken');
const baseResponse = require("../config/baseResponseStatus");

const jwtMiddleware = (req, res, next) => {
    const token = req.cookies.x_auth;
    if (!token) {
        return res.send(baseResponse.TOKEN_EMPTY);
    }

    const p = new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, verifiedToken) => {
            if (err) reject(err);
            resolve(verifiedToken);
            // console.log("JWT_SECRET: "+ process.env.JWT_SECRET);
        });
    });

    const onError = (error) => {
        return res.send(baseResponse.TOKEN_VERIFICATION_FAILURE);
    };

    p.then((verifiedToken) => {
        req.verifiedToken = verifiedToken;
        next();
    }).catch(onError);
};

module.exports = jwtMiddleware;
