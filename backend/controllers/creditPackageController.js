const dataSource = require('../config/data-source');
const packageRepository = dataSource.getRepository('CreditPackage');
const creditPackagePurchaseRepository = dataSource.getRepository('CreditPackagePurchase')

// GET /api/credit_package 取得購買方案列表
const getPackages = async (req, res) => {
  
  const creditPackages = await packageRepository.find(); // 等於 GET

  res.status(200).json({
    status: 'success',
    data: creditPackages,
  });
};

// POST /api/credit-package 新增購買方案

const postPackages = async (req, res) => {
    
  // 1. 檢查是否有重複
  const { name } = req.body;
  const existingPackage = await packageRepository.findOneBy({ name });

  if (existingPackage) {
    return res.status(409).json({
      status: 'failed',
      message: '資料重複',
    });
  }  

  // 2. 新增組合包
  const newPackage = packageRepository.create({ 
    name: req.body.name, 
    credit_amount: req.body.credit_amount, 
    price: req.body.price }); 
    // 要傳進去物件而非字串，和 enities 定義的相同
  
    const savedPackage = await packageRepository.save(newPackage); 
  // create 完（把一個普通物件「轉型」成 TypeORM 認得的 Entity 實例）後要 save，資料才會真正存入

  res.status(200).json({
    status: 'success',
    data: savedPackage,
  });
};


// POST api/credit-package/{creditPackageId} 購買堂數方案（需登入）
const userBuyPackage = async (req, res) => {
  
  // 錯誤 400：creditPackageId 查無對應方案
    const { creditPackageId } = req.params;
    const existingPackage = await packageRepository.findOneBy({ where: { id: creditPackageId } });

    if( !existingPackage ){
      return res.status(400).json({
        status: 'failed',
        message: "ID錯誤"
      });
    };

  // 建立使用者的方案購買紀錄
    const { id: userId } = req.user;
    const newPackageUserBuy = creditPackagePurchaseRepository.create({
      user_id: userId,
      package_id: creditPackageId
    });

    await creditPackagePurchaseRepository.save(newPackageUserBuy);
      
    res.status(200).json({
      status: 'success',
      data: null
    });
  
};


// DELETE /api/credit-package/{creditPackageId} 刪除購買方案

const deletePackages = async (req, res) => {
  
  // 1. 檢查有無此 id
  const { creditPackageId } = req.params;
  const existingPackage = await packageRepository.findOneBy({ id: creditPackageId });

  if ( !existingPackage ) {
    return res.status(400).json({
      status: 'failed',
      message: 'ID錯誤',
    });
  }  
  
  // 2. 刪除方案
  const result = await packageRepository.delete( creditPackageId );

  res.status(200).json({
    status: 'success',
    data: { "raw": [], 
      "affected": result.affected
    },
  });
} 



module.exports = {
  getPackages,
  postPackages,
  deletePackages,
  userBuyPackage
};
