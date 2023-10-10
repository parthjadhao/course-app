const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// ##############################
// given below are middleware
// ##############################

// admine Authentication middleware
const admineAuthentication = (req, res, next) => {
    // const {username,password}=req.headers;
    const username = req.headers.username;
    const password = req.headers.password;
    // google this given below also [1]
    const admin = ADMINS.find(a => a.username === username && a.password === password)
    if (admin) {
        next();
    } else {
        res.status(403).json({ message: 'admine authentication failed' })
    }
}

// user authentication middleware
const userAuthentication = (req, res, next) => {
    const { username, password } = req.headers;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        req.user = user//added user in request to routes
        next();
    } else {
        res.status(403).json({ message: 'user authentication failed' })
    }
}

// ############################
// given below are all admine routes
// ############################

app.post('/admin/signup', (req, res) => {
    // logic to sign up admin
    const admin = req.body;
    // how below code works ?
    const existingAdmin = ADMINS.find(a => a.username === admin.username)
    if (existingAdmin) {
        res.status(403).json({ message: 'Admin already exists' });
    } else {
        ADMINS.push(admin);
        res.json({ message: 'Admin created successfully' })
    }
});

// admineAuthentication is middleware
app.post('/admin/login', admineAuthentication, (req, res) => {
    // logic to log in admin
    res.json({ message: 'logged in successfully' })
});

app.post('/admin/courses', (req, res) => {
    // logic to create a course
    const course = req.body;
    course.id = Date.now();
    COURSES.push(course)
    res.json({ message: 'courese created succesfully', courseID: course.id })
});

app.put('/admin/courses/:courseId', (req, res) => {
    // logic to edit a course
    const coureId = Number(req.params.courseId);
    const course = COURSES.find(c => c.id === coureId);
    if (course) {
        Object.assign(course, req.body);//google this [2]
        res.json({ message: 'course updated succesfully' })
    } else {
        res.status(404).json({ message: 'course not found' })
    }
});

app.get('/admin/courses', (req, res) => {
    // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
    // logic to sign up user
    // google this given 
    // const user = {...req.body,purchasedCourses:[]};
    const user = {
        username: req.body.username,
        password: req.body.password,
        purchasedCourses: []
    }
    USERS.push(user);
    res.json({ message: 'user created succesfully' });
});

// ############################
// given below are all user routes
// ############################

app.post('/users/login', (req, res) => {
    // logic to log in user
    res.json({ message: 'logged in successfully' })
});

app.get('/users/courses', (req, res) => {
    // logic to list all courses
    COURSES.filter(c => c.published)
    let filteredCourses = [];
    for (let i = 0; i < array.length; i++) {
        if (COURSES[i].published) {
            filteredCourses.push(COURSES[i])
        }
        else {
            res.json({ course: filteredCourses })
        }
    }
});

app.post('/users/courses/:courseId', (req, res) => {
    // logic to purchase a course
    const courseId = parseInt(req.params.courseId);
    const course = COURSES.find(c => c.id === courseId && c.published);
    if(course){
        req.user.purchasedCourses.push(courseId)
        res.json({message:"course purchased succesfully"})
    }else{
        res.status(404).json({message:"course not found or not available"})
    }
});

app.get('/users/purchasedCourses', (req, res) => {
    // logic to view purchased courses
    // we need to extact the complete course object from COURSES
    // which have id which are present in the req.user.purchasedCourses
    // google the given below commented code to understand it
    // const purchasedCourses = CORSES.filter(c=> req.user.purchasedCourses.include(c.id))
    var purchaseCourseIds = req.user.purchasedCourses;
    var purchaseCourses = [];
    for(let i = 0;i<COURSES.length;i++){
        if(purchaseCourseIds.indexOf(COURSES[i].id)!==-1){
            purchaseCourses.push([COURSES[i]])
        }
    }
    res.json({purchaseCourses})
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});