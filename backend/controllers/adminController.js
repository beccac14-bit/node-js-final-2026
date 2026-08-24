const express = require('express');
const router = express.Router();
const dataSource = require('../config/data-source');
const userRepository = dataSource.getRepository('User');
const coachRepository = dataSource.getRepository('Coach');
const coachLinkSkillRepository = dataSource.getRepository('CoachLinkSkill');
const skillRepository = dataSource.getRepository('Skill');
const courseRepository = dataSource.getRepository('Course');
const courseBookingRepository = dataSource.getRepository('CourseBooking');
const { In, IsNull  } = require('typeorm');


// POST /api/admin/coaches/{userId} 將指定使用者升級為教練
const postAdminCoaches = async (req, res) => {
  const { userId } = req.params;
  const { experience_years, description, profile_image_url } = req.body;

  // 1. 錯誤 400：欄位未填寫正確
  //    experience_years 必須是 0 以上的整數；description 不能是空字串；
  //    profile_image_url 選填（可不給或給空字串），但只要有給非空值就必須以 https 開頭
  if (
    !Number.isInteger(experience_years) || experience_years < 0 || 
    !description?.trim() ||
    ( profile_image_url && !profile_image_url.startsWith('https') )
  ) {
    return res.status(400).json({
      status: 'failed',
      message: '欄位未填寫正確',
    });
  }

  // 2. 錯誤 400：userId 查不到對應的使用者
  const existingUser = await userRepository.findOneBy({ id: userId });

  if (!existingUser) {
    return res.status(400).json({
      status: 'failed',
      message: '使用者不存在',
    });
  }

  // 3. 錯誤 409：該使用者已經是教練（重複升級）
  const existingCoach = await coachRepository.findOneBy({ user_id: userId });

  if (existingCoach) {
    return res.status(409).json({
      status: 'failed',
      message: '使用者已經是教練',
    });
  }

  // 4. 建立教練資料，並把使用者 role 改成 COACH
  const newCoach = coachRepository.create({
    user_id: userId,
    experience_years,
    description,
    profile_image_url: profile_image_url || null,
  });
  const savedCoach = await coachRepository.save(newCoach);

  await userRepository.update({ id: userId }, { role: 'COACH' });
  const updatedUser = await userRepository.findOneBy({ id: userId });

  res.status(201).json({
    status: 'success',
    data: {
      user: {
        name: updatedUser.name,
        role: updatedUser.role,
      },
      coach: {
        id: savedCoach.id,
        user_id: savedCoach.user_id,
        experience_years: savedCoach.experience_years,
        description: savedCoach.description,
        profile_image_url: savedCoach.profile_image_url,
        created_at: savedCoach.created_at,
        updated_at: savedCoach.updated_at,
      }
    },
  });
};

// GET /api/admin/coaches 取得教練本人的後台資料
const getCoachProfile = async (req, res) => {
  
  const { id: userId } = req.user; 
  const existingCoach = await coachRepository.findOneBy({ user_id: userId });

  // 1. 錯誤 401：這個使用者還沒升級成教練
    if (!existingCoach) {
        return res.status(401).json({
        status: 'failed',
        message: '使用者尚未成為教練',
        });
    }

  const links = await coachLinkSkillRepository.find({ where: { coach_id: existingCoach.id } });
  const skill_ids = links.map( (link) => link.skill_id );

  res.status(200).json({
    status: 'success',
    data: {
        id: existingCoach.id,
        experience_years: existingCoach.experience_years,
        description: existingCoach.description,
        profile_image_url: existingCoach.profile_image_url,
        skill_ids
    }
  });

};


// PUT /api/admin/coaches 更新教練本人的後台資料（含整批更換技能）
const putCoachProfile = async (req, res) => {
    
    const { id: userId } = req.user;
    const { experience_years, description, profile_image_url, skill_ids } = req.body;

    // 1. 錯誤 400：欄位未填寫正確
        // 這支 profile_image_url 是必填（跟升級教練那支不同），skill_ids 必須是非空陣列且每個元素是合法 uuid
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 
        if (
            !Number.isInteger(experience_years) || experience_years < 0 ||
            !description?.trim() ||
            !profile_image_url?.trim() || !profile_image_url.startsWith('https') ||
            !Array.isArray(skill_ids) || skill_ids.length === 0 ||
            skill_ids.some((id) => typeof id !== 'string' || !UUID_REGEX.test(id))
        ){
            return res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確',
            });
        }
    
    // 2. 檢查傳入的 skill 是否真的存在 
        const foundSkills = await skillRepository.findBy({ id: In(skill_ids) });
        if (foundSkills.length !== skill_ids.length) {
            return res.status(400).json({
                status: 'failed',
                message: '欄位未填寫正確',
            });
        };

    // 2. 錯誤 401：這個使用者還沒升級成教練
        const existingCoach = await coachRepository.findOneBy({ user_id: userId });

        if (!existingCoach) {
            return res.status(401).json({
                status: 'failed',
                message: '使用者尚未成為教練',
            });
        }

    // 3. 更新教練本人欄位（年資、介紹、大頭貼）
        await coachRepository.update(
            { user_id: userId },
            { experience_years, description, profile_image_url }
        );

    // 4. 整批覆蓋 skill_ids：先刪光這個教練原本所有的技能綁定，再照新清單整批插入
        await coachLinkSkillRepository.delete({ coach_id: existingCoach.id });

    const newLinks = skill_ids.map((skill_id) =>
        coachLinkSkillRepository.create({ coach_id: existingCoach.id, skill_id })
    );
    await coachLinkSkillRepository.save(newLinks);

    // 5. 回傳更新後的資料
    res.status(200).json({
        status: 'success',
        data: {
            id: existingCoach.id,
            experience_years,
            description,
            profile_image_url,
            skill_ids,
        },
    });
};


// GET /api/admin/coaches/courses 取得教練本人開設的全部課程列表
const getCoachCourses = async (req, res) => {
    
    // 1. 檢查登入者 role 是否為教練
    const { id: userId } = req.user;
    const existingCoach = await coachRepository.findOneBy({ user_id: userId });

        if (!existingCoach) {
            return res.status(401).json({
                status: 'failed',
                message: '使用者尚未成為教練',
            });
        };
    
    // 2. 比對 coach_id 抓出 Course 資料
    const courses = await courseRepository.find({ where: { coach_id: existingCoach.id } });
    
    // 3. 沒開過課時 data 為空陣列）
    if (courses.length === 0) {
        return res.status(200).json({ 
            status: 'success', 
            data: [] 
        });
    }

    // 4. 取得課程列表
    const courseIds = courses.map((course) => course.id);
    const activeBookings = await courseBookingRepository.find({
        where: { course_id: In(courseIds), cancelled_at: IsNull() },
    });
    const counts = activeBookings.reduce((acc, booking) => {
        acc[booking.course_id] = (acc[booking.course_id] || 0) + 1;
        return acc;
    }, {});

    // 5. 回傳資料
    const now = new Date();
    const data = courses.map((course) => {
        let status;
        if (now < course.start_at) status = '尚未開始';
        else if (now < course.end_at) status = '進行中';
        else status = '已結束';

        return {
            id: course.id,
            name: course.name,
            status,
            start_at: course.start_at,
            end_at: course.end_at,
            max_participants: course.max_participants,
            meeting_url: course.meeting_url,
            participants: counts[course.id] || 0,
        };
    });

    res.status(200).json({ 
        status: 'success', 
        data 
    });
   
    
}


// POST /api/admin/coaches/courses 教練開設新課程
const postCoachCourses = async (req, res) => {

    // 1. 檢查登入者 role 是否為教練
    const { id: userId } = req.user;
    const existingCoach = await coachRepository.findOneBy({ user_id: userId });

        if (!existingCoach) {
            return res.status(401).json({
                status: 'failed',
                message: '使用者尚未成為教練',
            });
        };
        
    // 2. 錯誤 400：欄位未填寫正確
        // 全部欄位都必填；max_participants 必須是「數字型別」的 0 以上整數（字串會被擋）；
        // meeting_url 必須是 https 開頭
    const {skill_id, name, description, start_at, end_at, max_participants, meeting_url} = req.body;

    if (
        !skill_id?.trim() ||
        !name?.trim() ||
        !description?.trim() ||
        !start_at?.trim() ||
        !end_at?.trim() ||
        !Number.isInteger(max_participants) || max_participants < 0 ||
        !meeting_url?.trim() || !meeting_url.startsWith('https')
    ){
        return res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確',
        });
    }

    // 3. 確認 skill_id 真的存在，避免等一下 insert 時撞到外鍵約束變成沒處理過的 500
    const existingSkill = await skillRepository.findOneBy({ id: skill_id });
    if (!existingSkill) {
        return res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確',
        });
    }

    // 4. 建立課程：開課教練是 token 本人（existingCoach.id），不採用 body 傳進來的任何教練資訊
    const newCourse = courseRepository.create({
        coach_id: existingCoach.id,
        skill_id,
        name,
        description,
        start_at,
        end_at,
        max_participants,
        meeting_url,
    });
    const savedCourse = await courseRepository.save(newCourse);

    res.status(201).json({
        status: 'success',
        data: {course: {
            id: savedCourse.id,
            user_id: savedCourse.user_id,
            skill_id: savedCourse.skill_id,
            name: savedCourse.name,
            description: savedCourse.description,
            start_at: savedCourse.start_at,
            end_at: savedCourse.end_at,
            max_participants: savedCourse.max_participants,
            meeting_url: savedCourse.meeting_url,
            created_at: savedCourse.created_at,
            updated_at: savedCourse.updated_at
        }}
    });
};

// GET /api/admin/coaches/courses/{courseId} 取得單一課程詳情（編輯課程時的初始值）
const getCoachSpecificCourse = async (req, res) => {
    const { id: userId } = req.user;
    const { courseId } = req.params;

    const existingCoach = await coachRepository.findOneBy({ user_id: userId });

    // 1. 錯誤 400：檢查不是教練 → 一律當「課程不存在」，不要另外報「使用者尚未成為教練」
    if (!existingCoach) {
        return res.status(400).json({ 
            status: 'failed', 
            message: '課程不存在' });
    }

    // 2. 查詢：id 跟 coach_id 兩個條件放進同一個 where，一次查「這堂課存在且是我的」
    const course = await courseRepository.findOne({
        where: { id: courseId, coach_id: existingCoach.id },
        relations: { skill: true } ,   // 順便帶出 skill 關聯，拿 skill_name 用
    });

    // 3. 錯誤 400：課程不存在
    if (!course) {
        return res.status(400).json({ 
            status: 'failed', 
            message: '課程不存在' });
    }

    // 扁平物件，不包一層 course
    res.status(200).json({
        status: 'success',
        data: {
            id: course.id,
            name: course.name,
            description: course.description,
            start_at: course.start_at,
            end_at: course.end_at,
            max_participants: course.max_participants,
            skill_name: course.skill.name,
            skill_id: course.skill_id,
            meeting_url: course.meeting_url,
        },
    });
};

// PUT /api/admin/coaches/courses/{courseId} 更新單一課程
const putCoachSpecificCourse = async (req, res) => {
    const { id: userId } = req.user;
    const { courseId } = req.params;
    const { skill_id, name, description, start_at, end_at, max_participants, meeting_url } = req.body;

    // 1. 錯誤 400：先驗欄位（文件明講：先驗欄位、再驗擁有者）
        // 任一欄位缺漏／空字串／max_participants 非數字整數
        // meeting_url 不是 https 開頭 →「欄位未填寫正確」
    if (
        !skill_id?.trim() ||
        !name?.trim() ||
        !description?.trim() ||
        !start_at?.trim() ||
        !end_at?.trim() ||
        !Number.isInteger(max_participants) || max_participants < 0 ||
        !meeting_url?.trim() || !meeting_url.startsWith('https')
    ){
        return res.status(400).json({ 
            status: 'failed', 
            message: '欄位未填寫正確' });
    };

    // 2. 錯誤 400：再驗擁有者
        //  確認登入者是否為教練，並取出 coach_id 作下一步的查詢用
    const existingCoach = await coachRepository.findOneBy({ user_id: userId });

    if (!existingCoach) {
        return res.status(400).json({ 
            status: 'failed', 
            message: '課程不存在' });
    };
        // 課程 id 不存在或不是登入者本人開的
         // 如果這堂課不存在、或存在但 coach_id 是別人，這個查詢就會是 null
    const existingCourse = await 
    courseRepository.findOneBy({ id: courseId, coach_id: existingCoach.id });

    if (!existingCourse) {
        return res.status(400).json({ 
            status: 'failed', 
            message: '課程不存在' });
    };

    // 3. 確認 skill_id 真的存在，避免撞到外鍵約束變成沒處理過的 500
    const existingSkill = await skillRepository.findOneBy({ id: skill_id });
    if (!existingSkill) {
        return res.status(400).json({
            status: 'failed',
            message: '欄位未填寫正確',
        });
    };

    // 4. 更新，回傳更新後的完整物件（這支有包一層 course，跟 GET 的扁平形狀不同）
    await courseRepository.update(
        { id: courseId },
        { skill_id, name, description, start_at, end_at, max_participants, meeting_url }
    );
    const updatedCourse = await courseRepository.findOneBy({ id: courseId });

    res.status(200).json({
        status: 'success',
        data: { course: updatedCourse },
    });
};

// GET /api/admin/coaches/revenue 取得教練本人指定月份的營收統計
const getCoachRevenue = async (req, res) => {

  // 錯誤 400：month 沒帶、或不是合法的英文小寫月份名（例如送了 6、June、2026-06）時觸發。

    month = req.query
 enum [january, february, march, april, may, june, july, august, september, october, november, december]

  
   return res.status(400).json({
              status: 'failed',
              message: '欄位未填寫正確',
          });

  //  1. 撈出教練本人的課程
  const { id: userId } = req.user;
  
  



  total: {
    revenue: 0, // floor(該月未取消報名筆數 × 單堂均價)，單堂均價 = 全部方案 Σprice ÷ Σcredit_amount
    participants: 0, // 該月不重複的報名學員數
    course_count: 0 // 該月未取消的報名筆數（欄位名雖叫 course_count，語意是報名數）
  }
       
                                           
  
};



module.exports = {
  postAdminCoaches,
  getCoachProfile,
  putCoachProfile,
  getCoachCourses,
  postCoachCourses,
  getCoachSpecificCourse,
  putCoachSpecificCourse
};
