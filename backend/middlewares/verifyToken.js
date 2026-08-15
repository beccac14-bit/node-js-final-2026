const jwt = require('jsonwebtoken');

const verifyToken = function (req, res, next) {
const headerAuth = req.headers.authorization; 
  
    // 1. 錯誤 401：沒帶 Authorization header 或缺 token
    if( !headerAuth || !headerAuth.startsWith('Bearer ') ){
        return res.status(401).json({ status: 'failed', message: '請先登入' });
    };

    const token = req.headers.authorization.split(' ')[1];
    const SECRET = process.env.JWT_SECRET;
    
    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        // 2. 錯誤 401：token 已過期：「Token 已過期」
        if (err.name === 'TokenExpiredError'){  
            return res.status(401).json({ status: 'failed', message: 'Token 已過期' });
        };
        // 3. 錯誤 401：token 無效（內容不對、或查無此使用者）：
        if(err.name === 'JsonWebTokenError'){
            return res.status(401).json({ status: 'failed', message: '無效的 token' });
        }
    
    }
};


module.exports = verifyToken;