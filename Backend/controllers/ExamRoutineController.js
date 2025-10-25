const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db.js");

const exam_routine_add_update = async (req , res ) =>{
   try{
       const payload = req.body ; 
       console.log(req.body) 
    const db = getDB() ;
     if (!payload.classId || !payload.examName || !payload.routines || !payload.batchNumber) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const collection = db.collection("exam_routines") ;
     const existing = await collection.findOne({
      classId: payload.classId,
      batchNumber:payload.batchNumber,
      
    });
    if(existing){
        const updateResult = await collection.updateOne(
            {_id: existing._id} ,
            {
                $set:{...payload , updateAt:new Date()}
            }
        )
        return res.status(200).json({
            message: "Exam routine updated successfully" ,
            result : updateResult
        })
    }
    else{
        const insertResult = await collection.insertOne({
            ...payload,
            createAt:new Date() ,
            updateAt: new Date() 
        })
        return res.status(201).json({
            message: "Exam routine created successfully",
        result: insertResult,
        })
    }
    
   }catch(error){
    console.error("Error in exam_routine_add_update:", error);
    res.status(500).json({ message: "Internal server error", error });
   }
}

const get_exam_routines = async (req, res) => {
  try {
    const { classId, batchNumber } = req.params; // read filters from query params
    //console.log(classId, batchNumber)
    const db = getDB();
    const collection = db.collection("exam_routines");

    let filter = {};
    if (classId) filter.classId = classId;
    if (batchNumber) filter.batchNumber = batchNumber;
    
    const routines = await collection.find(filter).toArray();

    return res.status(200).json(routines);
  } catch (error) {
    console.error("Error in get_exam_routines:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
    exam_routine_add_update ,
    get_exam_routines
}