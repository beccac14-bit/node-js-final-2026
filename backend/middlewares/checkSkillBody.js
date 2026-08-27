const checkSkillBody = (req, res, next) => {
  const { name } = req.body;

// 400
    // 沒給 name（undefined）、name 不是字串（typeof != string）
    // 或 name 是空字串／全空白（trim() === ''）
  if (typeof name !== 'string' || name.trim() === ''){
    return res.status(400).json({
      status: 'failed',
      message: '欄位未填寫正確',
    });
  };

  next();

};

module.exports = checkSkillBody;