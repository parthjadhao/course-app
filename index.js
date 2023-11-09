//given below code import mongoose library which is used in managing the database
const mongoose = require('mongoose');
//given below code import jsonbtoken library which allow you to to encrypte and decrypte
// the string and used in authentication
const jwt = require('jsonwebtoken');
// given below code improt the express library which allow you to create HTTP Server
const express = require('express');
const app = express();
app.use(express.json());


// Step-01:define the schemas(shapes of data that you will insert in the database)
// define mongoose schemas[shape of data that goes in data base]
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  // google given below code 
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});
const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean
});

// step- 2 Define mongoose models
//const RefrenceToCollectionName = mongoose.model(collectionName,SchemaofCollection_name);
const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);

// step - 3 Connect the database(mongodb) to http server
mongoose.connect("mongodb+srv://eren:8dDLIEWuMHPX8njc@cluster0.71nwtlh.mongodb.net/data", { useNewUrlParser: true, useUnifiedTopology: true });

//Authetication
const admineSecretKey = "admineSuperKey";
const userSecreateKey = "userSuperKey";
const admineJWT = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, admineSecretKey, { expiresIn: '1h' });
};

const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, admineSecretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

//google what is async
//google what is await
// Admin routes
app.post('/admin/signup', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username }).maxTimeMS(15000);//this will find username whether the username is present in the Admine collection database
  if (admin) {
    res.status(403).json({ message: 'Admin already exists' });
  } else {
    // const newAdmin = new Admin({username,password});
    const newAdmin = new Admin({ username: username, password: password })
    await newAdmin.save();
    const token = admineJWT(newAdmin);
    res.json({ message: 'Admin created successfully', token });
  }
});
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = admineJWT(admin);
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});

app.post('/admin/courses', authenticateJwt, async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({ message: 'Course created successfully' });
});

app.put('/admin/courses/:courseId', authenticateJwt, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
  if (course) {
    res.json({ message: 'Course updated successfully' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/admin/courses', authenticateJwt, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses });
});
// user routes
app.post('/users/signup', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: 'User already exists' });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: 'user' }, userSecreateKey, { expiresIn: '1h' });
    res.json({ message: 'User created successfully', token });
  }
});

app.post('/users/login', async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = admineJWT(user);
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'User authentication failed' });
  }
});

app.get('/users/courses', authenticateJwt, async (req, res) => {
  const courses = await Course.find({ published: true });
  res.json({ courses });
});

app.post('/users/courses/:courseId', authenticateJwt, async (req, res) => {
  // route for purchasing the course
  const course = await Course.findById(req.params.courseId);
  if (course) {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.purchasedCourses.push(course);
      await user.save();
      res.json({ message: "Course purchased successfully" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "course not found" });
  }
});

app.get('/users/purchasedCourses', authenticateJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate('purchasedCourses')
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});