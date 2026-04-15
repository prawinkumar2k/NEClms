import mongoose from "mongoose";

export const handleGetQuestions = async (req, res) => {
  try {
    const role = req.user.role;
    const facultyId = req.user.id || req.user._id;
    const dept = req.user.dept || req.user.department;
    const QuestionBank = mongoose.model("QuestionBank");
    
    // Create query - if role is not HOD we only show questions for their dept or created by them
    let query = {};
    if (role === "hod") {
      query.department = new mongoose.Types.ObjectId(dept);
    } else {
      query.createdBy = new mongoose.Types.ObjectId(facultyId);
    }
    
    const questions = await QuestionBank.find(query).populate('course', 'title code').sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleCreateQuestion = async (req, res) => {
  try {
    const facultyId = req.user.id || req.user._id;
    const departmentId = req.user.dept || req.user.department;
    const { questionText, type, course, difficulty, options, correctAnswer, marks, testCases, topic } = req.body;
    
    let courseId = course;
    if (course && !mongoose.Types.ObjectId.isValid(course)) {
      const Course = mongoose.model("Course");
      const foundCourse = await Course.findOne({ 
        $or: [{ code: course }, { title: course }]
      });
      if (foundCourse) courseId = foundCourse._id;
    }

    const QuestionBank = mongoose.model("QuestionBank");
    const doc = {
        questionText,
        type: (type || "mcq").toLowerCase(),
        course: mongoose.Types.ObjectId.isValid(courseId) ? courseId : null,
        difficulty: (difficulty || "medium").toLowerCase(),
        options: options || {},
        correctAnswer,
        marks: marks || 1,
        testCases: testCases || [],
        topic,
        createdBy: new mongoose.Types.ObjectId(facultyId),
        department: new mongoose.Types.ObjectId(departmentId)
    };

    const q = await QuestionBank.create(doc);
    const populated = await QuestionBank.findById(q._id).populate('course', 'title code');
    res.status(201).json(populated);
  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const handleDeleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const QuestionBank = mongoose.model("QuestionBank");
    await QuestionBank.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
