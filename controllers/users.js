const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const passport = require("passport");

const Student = require("../models/student");
const Owner = require("../models/owner");

const { json_secret } = require("../config/keys");
const { funcSendMail } = require("../config/sendmail");

const validationFunc = (request) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array()[0];
    throw error;
  }
};

const userDetailsFunc = (userParam, errMsg) => {
  if (!userParam) {
    const error = new Error(errMsg);
    error.statusCode = 401;
    throw error;
  }
};

// USERS DETAILS
exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find();
    userDetailsFunc(students, "Students Not Found");
    res
      .status(200)
      .json({ message: "Successfully Fetched Students", data: students });
  } catch (error) {
    next(error);
  }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.studentId);
    // const student = await Student.findById("64b468dd331074d7216b2550")
    userDetailsFunc(student, "Student Not Found");
    res
      .status(200)
      .json({ message: "Successfully Fetched Student", data: student });
  } catch (error) {
    next(error);
  }
};

exports.getOwners = async (req, res, next) => {
  try {
    const owners = await Owner.find();
    userDetailsFunc(owners, "Owners Not Found");

    res
      .status(200)
      .json({ message: "Successfully Fetched Owners", data: owners });
  } catch (error) {
    next(error);
  }
};

exports.getOwner = async (req, res, next) => {
  try {
    // const owner = await Owner.findById(req.params.ownerId)
    const owner = await Owner.findById("64bbdb2d96a757dcc75e80f4");
    userDetailsFunc(owner, "Owner Not Found");

    res
      .status(200)
      .json({ message: "Successfylly Fetched Owner", data: owner });
  } catch (error) {
    next(error);
  }
};

// USERS SIGNUP & LOGIN
exports.studentSignUp = async (req, res, next) => {
  validationFunc(req);

  const { firstname, lastname, email, password } = req.body;
  try {
    const hashpassword = await bcrypt.hash(password, 12);
    const student = new Student({
      firstname,
      lastname,
      email,
      password: hashpassword,
    });
    const newStudent = await student.save();
    res.status(201).json({
      message: `Successfully Signed up with email: ${newStudent.email}`,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.ownerSignUp = async (req, res, next) => {
  validationFunc(req);

  const { firstname, lastname, address, email, password } = req.body;
  try {
    const hashPassword = await bcrypt.hash(password, 12);
    const owner = new Owner({
      firstname,
      lastname,
      address,
      email,
      password: hashPassword,
    });
    const newOwner = await owner.save();
    res.status(201).json({
      message: `Successfully Signed up with email: ${newOwner.email}`,
    });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.userLogin = async (req, res, next) => {
  const { email, password, user_type } = req.body;

  if (!user_type) {
    userDetailsFunc(
      user_type,
      "User type was not provided, please provide a valid user type"
    );
  }
  const modelToUse = () => {
    if (user_type === "student") {
      return Student;
    } else {
      return Owner;
    }
  };

  try {
    const oldUser = await modelToUse.findOne({ email });
    userDetailsFunc(
      oldUser,
      "Email does not exist in database, Please sign up!"
    );

    const okPassword = await bcrypt.compare(password, oldUser.password);
    userDetailsFunc(okPassword, "Incorrect Password");

    const token = jwt.sign(
      { email: oldUser.email, studentId: oldUser._id.toString() },
      json_secret,
      { expiresIn: ".25h" }
    ); // signed in for 15 mins
    res.status(200).json({ token: token, userId: oldUser._id.toString() });
  } catch (error) {
    next(error);
  }
};

exports.studentLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const oldStudent = await Student.findOne({ email });
    userDetailsFunc(
      oldStudent,
      "Email does not exist in database, Please sign up!"
    );

    const okPassword = await bcrypt.compare(password, oldStudent.password);
    userDetailsFunc(okPassword, "Incorrect Password");

    const token = jwt.sign(
      { email: oldStudent.email, studentId: oldStudent._id.toString() },
      json_secret,
      { expiresIn: ".25h" }
    ); // signed in for 15 mins
    res
      .status(200)
      .json({ token: token, studentId: oldStudent._id.toString() });
  } catch (error) {
    next(error);
  }
};

exports.ownerLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const oldOwner = await Owner.findOne({ email });
    userDetailsFunc(oldOwner, "Email does not exist, please sign up!");

    const okPassword = await bcrypt.compare(password, oldOwner.password);
    userDetailsFunc(okPassword, "Incorrect Passowrd");

    const token = jwt.sign(
      { email: oldOwner.email, ownerId: oldOwner._id.toString() },
      json_secret,
      { expiresIn: ".25h" }
    );
    res.status(200).json({ token: token, ownerId: oldOwner._id.toString() });
  } catch (error) {
    next(error);
  }
};

exports.studentReset = async (req, res, next) => {
  let token;
  crypto.randomBytes(32, (err, buff) => {
    if (err) {
      const error = new Error("Problem generating encryption");
      error.statusCode = 404;
      throw error;
    }
    token = buff.toString("hex");
  });

  try {
    const student = await Student.findOne({ email: req.body.email });
    if (!student) {
      const error = new Error("Email does not exist, please sign up!");
      error.statusCode = 404;
      throw error;
    }

    student.token = token;
    student.tokenExp = Date.now() + 900000; // expires in 15 mins
    await student.save();

    const data = await funcSendMail(
      student.email,
      "/student/passwordForm",
      token
    );
    // data has been undefined all these while
    console.log(data);
    if (!data) {
      const error = new Email("Error sending email");
      error.statusCode = 402;
      throw error;
    }
    res.status(200).json({ message: "Successfully sent email", result: data });
  } catch (error) {
    next(error);
  }
};

exports.studentChangePassword = async (req, res, next) => {
  const { token, password, passwordConfirm } = req.body;
  // inform frontend to add a hidden input field that fetches
  // the token from the url that brought the user to the
  // password form page

  if (password !== passwordConfirm) {
    const error = new Error("Passwords do not match");
    error.statusCode = 401;
    throw error;
  }

  try {
    const student = await Student.findOne({
      token,
      tokenExp: { $gt: Data.now() },
    });
    if (!student) {
      const error = new Error(
        "Invalid token OR token already expired, note that token expiration date is 15 mins"
      );
      error.statusCode = 403;
      throw error;
    }
    const hashPassword = await bcrypt.hash(password, 12);
    student.password = hashPassword;
    student.token = undefined;
    student.tokenExp = undefined;
    const newStudent = await student.save();
    res.status(200).json({
      message: `Successfully reset password for user with id: ${newStudent._id}`,
    });
  } catch (error) {
    next(error);
  }
};

// GOOGLE LOGIN
exports.gglConsentScreen = passport.authenticate("google", {
  scope: ["email", "profile"],
});

exports.gglCallback = passport.authenticate("google", {
  session: false,
  successRedirect: "/auth/google/success",
  failureRedirect: "/auth/google/failure",
});

exports.jsnWebToken = (req, res) => {
  jwt.sign(
    { user: req.user },
    json_secret,
    { expiresIn: ".25" },
    (err, token) => {
      if (err) {
        return res.status(500).json({ token: null });
      }
      res.status(200).json({ token, userId: req.user });
    }
  );
};

exports.jsnValidteToken = passport.authenticate("jwt", { session: false });

exports.onSuccess = (req, res) => {
  console.log("You are now logged in");
  res.status(200).json({ message: "Successfully signed in" });
};

exports.onFailure = (req, res) => {
  console.log("Login in Failed");
  res.status(500).json({ message: "Error login in" });
  // res.send("Error login in")
};
