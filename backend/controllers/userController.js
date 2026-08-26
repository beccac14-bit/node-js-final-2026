const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const dataSource = require('../config/data-source');
const userRepository = dataSource.getRepository('User');
const creditPackagePurchaseRepository = dataSource.getRepository('CreditPackagePurchase');
const courseBookingRepository = dataSource.getRepository('CourseBooking');
const { validatePassword } = require('../utils/validate');
const { IsNull } = require('typeorm');

// POST /api/users/signup 註冊新會員帳號
const postUsersSignup = async (req, res) => {
const { name, email, password } = req.body;
  
  // 1. 檢查欄位是否正確
  // 錯誤 400：缺少必要欄位
    if ( !name?.trim() || !email?.trim() || !password?.trim() ) {
        return res.status(400).json({
          status: 'failed', 
          message: `欄位未填寫正確`});  
    };

  // 2. 檢查密碼是否符合規則
  // 錯誤 400：密碼規則由後端把關：必須同時包含英文大寫、英文小寫、數字，長度 8～16 字
    
    if( !validatePassword(password) ){
      return res.status(400).json({
        status: 'failed',
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
      role: 'USER' 
    });

    const savedUser = await userRepository.save(newUser)
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: savedUser.id,
          name: savedUser.name }}
    });
    
};


// POST /api/users/login 會員登入，取得 JWT token
const postUsersLogin = async (req, res) => {
  // 1. 檢查欄位是否正確
  // 錯誤 400：缺少必要欄位
    const { email, password } = req.body;
    if ( !email?.trim() || !password?.trim() ) {
        return res.status(400).json({
          status: 'failed', 
          message: `欄位未填寫正確`});  
    };

  // 2. 檢查密碼是否符合規則
  // 錯誤 400：必須同時包含英文大寫、英文小寫、數字，長度 8～16 字
    
    if( !validatePassword(password) ){
      return res.status(400).json({
          status: 'failed', 
          message: `密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字`}); 
    };

  // 3. 檢查 email 是否有符合的使用者
  // 錯誤 400：使用者不存在或密碼輸入錯誤
    const existingUser = await userRepository.findOneBy({ email });

    if( !existingUser ){
        return res.status(400).json({
          status: 'failed', 
          message: `帳號或密碼錯誤`});
    }
  // 4. 驗證 password 是否輸入正確
    // 錯誤 400：使用者不存在或密碼輸入錯誤
    const isMatch = await bcrypt.compare(password , existingUser.password);
    if(!isMatch){
        return res.status(400).json({
          status: 'failed', 
          message: `帳號或密碼錯誤`});
    };

  // 5. 回傳 201：用 jwt.sign 簽出 token，payload 必須包含 { id, role, exp } 
    // secret 使用 process.env.JWT_SECRET，有效期設為 10 天
    
    const tenDaysInSeconds = 10 * 24 * 60 * 60; // 864000 秒
    const exp = Math.floor(Date.now() / 1000) + tenDaysInSeconds;
    const payload = { id:existingUser.id, role:existingUser.role, exp };
    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign( payload, SECRET);
    res.status(201).json({ 
      status: 'success',
      data: { token, user: { name: existingUser.name} }
    });
};


// GET /api/users/profile 取得個人資料
const getUsersProfile = async (req, res) => {
  
  const { id } = req.user; 
  const existingUser = await userRepository.findOneBy({ id });
  
  res.status(200).json({
    status: 'success',
    data: { user: {
      name: existingUser.name, 
      email: existingUser.email 
    }}
  })

};

// PUT /api/users/profile 更新本人的暱稱
const putUsersProfile = async (req, res) => {
  
  const { id } = req.user; 
  const { name } = req.body;
  const existingUser = await userRepository.findOneBy({ id });
  
  // 1. 錯誤 400：檢查新名稱與目前名稱相同
    if( existingUser.name === name ){
      return res.status(400).json({
        status: 'failed',
        message: '使用者名稱未變更'
      })
    }

  // 2. 錯誤 400：name 缺漏或為空字串
    if ( !name?.trim() ) {
        return res.status(400).json({
          status: 'failed', 
          message: `欄位未填寫正確`});  
    };

  // 3. 錯誤 400：更新沒有生效（極少見的邊角情況）
    const updatedResult = await userRepository.update({ id }, { name }); 
    const UpdatedUser = await userRepository.findOneBy({ id });

    if(updatedResult.affected === 0) {
      return res.status(400).json({ 
        status: 'failed',
        message: '更新使用者資料失敗' });
    };

  // 4. 成功：更新使用者 name
    res.status(200).json({
      status: 'success',
      data: { 
        user: {
        name: UpdatedUser.name  
        }
      }
    });

 
};

// PUT /api/users/password 修改本人的登入密碼
const putUsersPassword = async (req, res) => {

  const { id } = req.user
  const { password, new_password, confirm_new_password } = req.body; 
  const existingUser = await userRepository.findOneBy({ id });
  
  // 1. 錯誤 400：三個欄位任一缺漏或為空字串
    if ( !password?.trim() || !new_password?.trim() || !confirm_new_password?.trim() ) {
        return res.status(400).json({
          status: 'failed', 
          message: `欄位未填寫正確`});  
    };

  // 2. 錯誤 400：密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字
    if( !validatePassword(new_password) ){
        return res.status(400).json({
            status: 'failed', 
            message: `密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字`}); 
    };

  // 3. 錯誤 400：新密碼與確認新密碼不一致
    if( new_password !== confirm_new_password){
      return res.status(400).json({
        status: 'failed', 
        message: `新密碼與驗證新密碼不一致`
      });
    };

  // 4. 錯誤 400：舊密碼比對錯誤
    const isMatch = await bcrypt.compare(password , existingUser.password);
    if( !isMatch ){
      return res.status(400).json({
          status: 'failed', 
          message: `密碼輸入錯誤`});
      }

  // 5. 錯誤 400：新密碼與舊密碼相同
    const isSame = await bcrypt.compare(new_password, existingUser.password);
    if( isSame ){
        return res.status(400).json({
          status: 'failed', 
          message: `新密碼不能與舊密碼相同`});
    };

  // 6. 修改密碼

    // a. 產生 Salt（rounds = 10）
      const salt = await bcrypt.genSalt(10);
    // b. 將密碼加鹽雜湊後儲存（模擬存入資料庫）
      const hashedPassword = await bcrypt.hash( new_password, salt );
    // c. 將新密碼更新存進 user
      await userRepository.update({ id }, { password: hashedPassword });  
      return res.status(200).json({
              status: 'success', 
              data: null });

};


// GET /api/users/credit-package 取得本人的購買方案紀錄
const getUserCreditPackage = async (req, res) => {

  const { id: userId } = req.user;
  const userCreditPackage = await creditPackagePurchaseRepository.find({ 
    where: { user_id: userId },
    // package 是 relations 裡定義的關聯屬性名稱，
    // 指定要從關聯的 Credit_package 表裡撈出哪些欄位
    select: {
        buy_at: true,
        package: { 
          name: true, 
          credit_amount: true, 
          price: true}
      },
    // relations：告訴 TypeORM 要 join 哪張關聯表
    // key（package）要對應到 credit_package_purchase.js 裡 relations 定義的屬性名稱
    relations: {
      package: true
    },
    order: {
      buy_at: 'DESC', // 依 buy_at 新到舊排序（最新的排最前面）
    },
  });

  const result = userCreditPackage.map( item => ({
      name: item.package.name,
      purchased_credits: item.package.credit_amount,
      price_paid: item.package.price,
      purchase_at: item.buy_at
  }));

  
  res.status(200).json({
    status: 'success', 
    data: result
  });

};

// GET /api/users/courses 取得本人的課表與剩餘堂數
const getUserBookedCoursesAndLeftCredits = async (req, res) => {

  const { id: userId } = req.user;

  // 1. 計算 credit_remain 和 credit_usage
    // a. 先查 user 購買的所有 package 並取出 credit_amount 進行加總
    const creditPackageUserBuy = await creditPackagePurchaseRepository.find({ 
      where: { user_id: userId },
      relations: { package: true },
      select: {
        package: { credit_amount: true }
      }
    });

    const totalCreditsUserbuy = creditPackageUserBuy.reduce( (acc, cur) => 
     acc + cur.package.credit_amount , 0);

    // b. 再查 user 報名的課程（排除已取消）
    const coursesUserBooked = await courseBookingRepository.find({ 
      where: { user_id: userId, 
             cancelled_at: IsNull() },
      select: {
        course_id: true,
        cancelled_at: true,
        course: { 
          name: true,
          start_at: true,
          end_at: true,
          meeting_url: true,
          coach: { user: { name: true } }
                },
      },
      relations: { 
        course: { coach: { user: true } }
      },
      order: { start_at: 'ASC' }
    });

    // c. 接著相減得出剩餘的堂數
    const creditUserLeft = totalCreditsUserbuy - coursesUserBooked.length;
  
  const result = coursesUserBooked.map( item => ({
    course_id: item.course_id ,
    name: item.course.name,
    start_at: item.course.start_at ,
    end_at: item.course.end_at,
    meeting_url: item.course.meeting_url,
    coach_name: item.course.coach.user.name,
    cancelled_at: item.cancelled_at,    
  }));

  res.status(200).json({
    status: 'success', 
    data: {
      credit_remain: creditUserLeft,
      credit_usage: coursesUserBooked.length,
      course_booking: result
    }  
  });
  
};


module.exports = {
  postUsersSignup,
  postUsersLogin,
  getUsersProfile,
  putUsersProfile,
  putUsersPassword,
  getUserCreditPackage,
  getUserBookedCoursesAndLeftCredits
};
