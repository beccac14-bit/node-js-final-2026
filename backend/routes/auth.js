const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();
const userRepository = dataSource.getRepository('User');


// POST /api/users/signup 註冊新會員帳號
const postUsers = async (req, res) => {
const { name, email, password } = req.body;
  
  // 1. 檢查欄位是否正確：錯誤 400：缺少必要欄位
  
    const standardFields = ['name', 'email', 'password'];
    const validateFieldsResult = standardFields.filter(field => !userInfo[field]); // 如果有缺就回陣列

    if ( validateFieldsResult.length > 0 ) {
        return res.status(400).json({
          status: 'false', 
          message: `欄位未填寫正確`});  
    };

  // 2. 檢查密碼是否符合規則
  // 錯誤 400：密碼規則由後端把關：必須同時包含英文大寫、英文小寫、數字，長度 8～16 字
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
    const passwordCorrectFormat = passwordRegex.test(userInfo.password);
    
    if( !passwordCorrectFormat ){
      return res.status(400).json({
        status: 'false',
        message: `密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字`});  
    };

  // 3. 檢查是否有重複
  // 錯誤 409：Email 已被使用
  
    const existingUser = await userRepository.findOneBy({ email });
  
    if (existingUser) {
      return res.status(409).json({
        status: 'failed',
        message: 'Email 已被使用'});
    };

  // 4.註冊用戶
    // a. 產生 Salt（rounds = 10）
    const salt = await bcrypt.genSalt(10);
    // b. 將密碼加鹽雜湊後儲存（模擬存入資料庫）
    const hashedPassword = await bcrypt.hash( password, salt );
    // c. 將新使用者（包含 id、email、加密後 password）存進 user（先 create 再 save）
    const newUser = userRepository.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: 'USER' });
    ;
    const savedUser = await userRepository.save(newMember)
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: savedPackage.id,
          name: savedPackage.name }}
    });
    
};



module.exports = {
  postUsers,
  
};

