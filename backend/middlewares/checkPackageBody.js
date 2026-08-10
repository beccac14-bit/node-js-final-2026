const checkPackageBody = (req, res, next) => {
  const { name, credit_amount, price } = req.body;

// 400
    // 任一欄位沒給；name 不是字串或為空；
    // credit_amount 或 price 不是數字、是負數、或帶小數 
  if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確',
        });
    }

  if (!Number.isInteger(credit_amount) || credit_amount <= 0 ){
        return res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確',
        });
    }

  if (!Number.isInteger(price) || price <= 0 ){
        return res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確',
        });
    }

  next();
};

module.exports = checkPackageBody;
