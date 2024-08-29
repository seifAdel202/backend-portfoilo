const User = require('../models/userModel');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require("multer");
const sharp = require("sharp");
require('dotenv').config();
const authenticateToken = require('../middleware/authentication');
const SignUp = require('../models/signUpModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});



const getData = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json(users);
});




const SIGNUP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await SignUp.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSignUP = new SignUp({
      name,
      email,
      password: hashedPassword,
    });

    await newSignUP.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn: '1h'
  });
};

const LOGIN = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await SignUp.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_secret_key');
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addData = catchAsync(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new AppError('No data provided to create user.', 400));
  }

  let user = await User.findOne();

  if (user) {
    user = await User.findByIdAndUpdate(
      user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
  } else {
    user = await User.create(req.body);
  }

  res.status(user.isNew ? 201 : 200).json({
    status: 'success',
    data: {
      user
    }
  });
});



const removeItem = catchAsync(async (req, res, next) => {
  const { userId, fieldName, item } = req.body;
  const allowedFields = ['softSkill', 'techSkill', 'projects'];

  if (!allowedFields.includes(fieldName)) {
    return next(new AppError('Invalid field name', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!Array.isArray(user[fieldName])) {
    return next(new AppError(`${fieldName} is not an array`, 400));
  }

  if (!user[fieldName].includes(item)) {
    return next(new AppError(`Item '${item}' not found in ${fieldName}`, 404));
  }

  user[fieldName] = user[fieldName].filter(i => i !== item);

  await user.save().catch(err => {
    console.error("Error saving the user document:", err);
    return next(new AppError('Failed to save updated user document', 500));
  });

  res.status(200).json({
    status: 'success',
    data: user
  });
});

module.exports = {
  SIGNUP,
  LOGIN,
  addData,
  getData,
  removeItem
};
