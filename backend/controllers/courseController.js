const express = require('express');
const router = express.Router();
const dataSource = require('../config/data-source');
const courseRepository = dataSource.getRepository('Course');
const courseBookingRepository = dataSource.getRepository('CourseBooking');
const creditPackagePurchaseRepository = dataSource.getRepository('CreditPackagePurchase');
const { LessThanOrEqual, MoreThan, IsNull } = require('typeorm');

// GET　/api/courses　取得全站「進行中」的課程列表（公開，不用登入）
const getCourseList = async (req, res) => {

  const now = new Date();
  const ongoingCourses = await courseRepository.find({   // 如果無資料會回傳空陣列
      where: { start_at: LessThanOrEqual(now), end_at: MoreThan(now), }, // 判斷標準：start_at <= 現在時間 < end_at。
      select: {
        id: true,
        name: true,
        description: true,
        start_at: true,
        end_at: true,
        max_participants: true,
        coach: { id: true, user: { name: true }},
        skill: { name: true }
      },
      relations: {
        coach: { user: true },
        skill: true
      },
  }); 

  const result = ongoingCourses.map( course => ({ // 空陣列 map 出來也是空陣列，因此不需要多加一層 .length===0 的判斷
        id: course.id,
        name: course.name,
        description: course.description,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants: course.max_participants,
        coach_name: course.coach.user.name,
        skill_name: course.skill.name,
    }));
  
   res.status(200).json({
     status: 'success',
     data: result    
   });
               
};


// POST 報名課程（學員用 token 報名一門課，最容易踩雷）
const postCourse = async (req, res) => {
  
  // 1. 錯誤 400：courseId 查無此課程
    const { courseId } = req.params;
    const existingCourse = await courseRepository.findOneBy( {id: courseId} );
    if( !existingCourse ){
      return res.status(400).json({
        status: 'failed',
        message: 'ID錯誤'
      });
    };

  // 2. 錯誤 400： 這位使用者對這門課已有報名紀錄（包含已取消的紀錄）
    const { id: userId } = req.user;
    const alreadyBooked = await courseBookingRepository.find( { where: { user_id: userId, course_id: courseId }} );
    
    if( alreadyBooked.length > 0 ){
      return res.status(400).json({
        status: 'failed',
        message: '已經報名過此課程'
      });
    };

  // 3. 錯誤 400：剩餘堂數歸零，已無可使用堂數

    // a. 先查 user 購買的所有 package 並取出 credit_amount 進行加總
    const creditPackageUserBuy = await creditPackagePurchaseRepository.find({ 
      where: { user_id: userId },
      relations: { package: true },
      select: {
        package: { credit_amount: true }
      }
    });

    const totalCreditsUserbuy = creditPackageUserBuy.reduce( (acc, cur) => 
     acc + cur.credit_amount , 0);

    // b. 再查 user 報名的課程（排除已取消）
    const coursesUserBooked = await courseBookingRepository.find({ 
      where: { user_id: userId, 
              course_id: courseId,
             cancelled_at: IsNull() }
    });

    // c. 接著相減得出剩餘的堂數
    const creditUserLeft = totalCreditsUserbuy - coursesUserBooked.length;
    if( creditUserLeft <= 0 ){
      return res.status(400).json({
        status: 'failed',
        message: '已無可使用堂數'
      })
    };

  // 4. 錯誤 400：這門課目前的有效報名人數已達名額上限
    // a. 這堂課未取消的已報名數量
    const courseBookingCount = await courseBookingRepository.find({ 
      where: { course_id: courseId, 
              cancelled_at: IsNull() } 
    });
    // b. 取出這堂課程最大的報名人數
    const courseMaxParticipantsObj = await courseRepository.findOne({
      where: { id: courseId },
      select: { max_participants: true }
    });
    // c. 如果 未取消的已報名數量 = 課程最大的報名人數，代表已額滿
    if( courseBookingCount.length === courseMaxParticipantsObj.max_participants ){
      return res.status(400).json({
        status: 'failed',
        message: '已達最大參加人數，無法參加'
      })
    };
  
  // 5. 建立報名紀錄 
    const newBooking = courseBookingRepository.create({
      user_id: userId, 
      course_id: courseId
    });

    await courseBookingRepository.save(newBooking);

    res.status(201).json({
          status: 'success',
          data: null
       });

}



// DELETE api/courses/{courseId} 取消課程報名（軟刪除：紀錄保留、標記取消、堂數自動歸還）
const cancellBookedCourse = async (req, res) => {
  
  // 錯誤 400：找不到「這位使用者對這門課、尚未取消」的報名紀錄（課程不存在／從未報名／已經取消過，三種情況都回這句） 
  const { id: userId } = req.user;
  const { courseId } = req.params;
  
  const existingBooking = await courseBookingRepository.findOne({
    where: {
      user_id: userId, 
      course_id: courseId,
      cancelled_at: IsNull()
    }
  });

  if( !existingBooking ){ // 如果沒有資料會回傳 null
    return res.status(400).json({
        status: 'failed',
        message: 'ID錯誤'
      });
  };

  // 取消成功（報名紀錄被標記為已取消，堂數歸還）
  await courseBookingRepository.update(
    { id: existingBooking.id }, // 用前面找出的 existingBooking 的 id 抓出要更新的那筆資料
    { cancelled_at: new Date() } // 更新資訊
  );

  res.status(200).json({
          status: 'success',
          data: null
       });
};

module.exports = { 
  getCourseList,
  postCourse,
  cancellBookedCourse
 };



