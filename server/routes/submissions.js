import mongoose from "mongoose";

export const handleGetSubmissions = async (req, res) => {
  console.log("🔍 [API] Fetching Submissions Query:", req.query);
  try {
    const Submission = mongoose.model("Submission");
    const { examId, status, studentId } = req.query;

    let query = {};
    if (examId) query.exam = examId;
    if (status) query.status = status;
    if (studentId) query.student = studentId;

    const submissions = await Submission.find(query)
      .populate("student", "name rollNumber")
      .populate("exam", "title")
      .populate("device", "hostname ip")
      .sort({ updatedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetViolationsByExam = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const { examId } = req.params;
    
    const submissions = await Submission.find({ exam: examId, "violations.0": { $exists: true } })
      .populate("student", "name rollNumber")
      .select("student violations totalViolations");
      
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetGlobalViolations = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const violations = await Submission.find({ totalViolations: { $gt: 0 } })
      .populate("student", "name rollNumber email")
      .populate("exam", "title")
      .sort({ updatedAt: -1 })
      .limit(200);
      
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── POST /api/submissions/start ──────────────────────────────────────────────
export const handleStartExam = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");
    const { examId } = req.body;
    const studentId = req.user.id || req.user._id;

    // Check if submission already exists
    let submission = await Submission.findOne({ exam: examId, student: studentId });
    if (submission && submission.status !== "in_progress") {
      return res.status(400).json({ message: "Exam already submitted" });
    }

    if (!submission) {
      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ message: "Exam not found" });

      submission = await Submission.create({
        student: studentId,
        exam: examId,
        status: "in_progress",
        startTime: new Date(),
        device: req.body.deviceId || null,
        ipAddress: req.ip
      });

      // Notify HOD/Faculty
      const io = req.app.get("io");
      if (io) {
        const fullExam = await Exam.findById(examId);
        io.to("admin-dashboard").emit("exam-started", {
          examTitle: fullExam?.title,
          studentName: req.user.name,
          studentId: studentId
        });
      }
    }

    res.json(submission);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PUT /api/submissions/:id/answers ─────────────────────────────────────────
export const handleUpdateAnswers = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const { answers, violations } = req.body;
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Session not found" });

    if (answers) {
      submission.answers = answers;
      submission.markModified("answers"); // Required for Mixed type
    }
    
    if (violations) {
      submission.violations = violations;
      submission.totalViolations = violations.length;
      
      const User = mongoose.model("User");
      const user = await User.findById(req.user.id || req.user._id);

      // Emit socket event for real-time monitoring
      const io = req.app.get("io");
      if (io) {
        io.emit("new-violation", {
          student: user?.name || "Student",
          exam: submission.exam,
          type: violations[violations.length - 1]?.type,
          count: submission.totalViolations
        });
      }
    }

    await submission.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/submissions/:id/submit ─────────────────────────────────────────
export const handleSubmitExam = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");
    
    const submission = await Submission.findById(req.params.id).populate("exam");
    if (!submission) return res.status(404).json({ message: "Session not found" });

    const { answers } = req.body;
    if (answers) {
      submission.answers = answers;
      submission.markModified("answers");
    }
    
    submission.status = "submitted";
    submission.endTime = new Date();
    
    // Auto-grading for MCQ
    let score = 0;
    const examQuestions = submission.exam.questions;
    Object.keys(submission.answers || {}).forEach((idxStr) => {
      const idx = parseInt(idxStr);
      const ans = submission.answers[idxStr];
      const question = examQuestions[idx];
      if (question && question.type === "mcq" && question.correctAnswer === ans) {
        score += question.marks || 1;
      }
    });

    submission.score = score;
    submission.percentage = (score / submission.exam.totalMarks) * 100;
    
    await submission.save();

    const io = req.app.get("io");
    if (io) io.emit("new-activity", { type: "submission", student: req.user.name });

    res.json({ success: true, score, percentage: submission.percentage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
