const db = require('../../../config/db/db.js');

const updateAutomationStatus =
async(req,res)=>{

  try{

    const { auto_mode } = req.body;

    if(
      auto_mode !== 0 &&
      auto_mode !== 1
    ){
      return res.status(400).json({
        success:false,
        message:
          'auto_mode must be 0 or 1'
      });
    }

    await db.query(`
      UPDATE automation_settings
      SET auto_mode=?
      WHERE id=1
    `,
    [auto_mode]);

    return res.json({
      success:true,
      auto_mode
    });

  }
  catch(err){

    return res.status(500).json({
      success:false,
      message:err.message
    });

  }

};




const getAutomationStatus =
async(req,res)=>{

  try{

    const [[setting]] =
      await db.query(`
        SELECT auto_mode
        FROM automation_settings
        LIMIT 1
      `);

    return res.json({
      success:true,
      auto_mode:
        setting?.auto_mode || 0
    });

  }
  catch(err){

    return res.status(500).json({
      success:false,
      message:err.message
    });

  }

};




module.exports =
  { updateAutomationStatus, getAutomationStatus };