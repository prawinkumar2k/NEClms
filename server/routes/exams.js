import mongoose from "mongoose";

export const handleGetExams = async (req, res) => {
  try {
    const Exam = mongoose.model("Exam");
    const { status, department, course } = req.query;

    let query = {};
    if (status) query.status = status;
    
    // Role-based filtering
    if (req.user.role === "student") {
      query.department = req.user.dept || req.user.department;
    } else if (req.user.role === "faculty" || req.user.role === "hod") {
      // Auto-filter by faculty/HOD's department if they don't specify one
      query.department = department || req.user.dept || req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (course) query.course = course;

    console.log(`🔍 [EXAMS] Fetching for role: ${req.user.role}, query:`, query);

    const exams = await Exam.find(query)
      .populate("course", "title code")
      .populate("faculty", "name")
      .populate("department", "name")
      .sort({ scheduledAt: 1 });

    res.json(exams);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetExamById = async (req, res) => {
  try {
    const Exam = mongoose.model("Exam");
    const exam = await Exam.findById(req.params.id)
      .populate("course")
      .populate("faculty", "name");
      
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
