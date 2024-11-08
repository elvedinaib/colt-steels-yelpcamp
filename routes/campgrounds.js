const express=require('express')
const router=express.Router()
const catchAsync=require('../utilities/catchAsync')
const methodOverride=require('method-override')
const {isLoggedIn, isAuthor, validateCampground}=require('../middleware')
const campgrounds=require('../controllers/campgrounds')
const multer=require('multer')
const storage = multer.memoryStorage();
const upload=multer({storage})

router.use(express.urlencoded({extended:true}))
router.use(methodOverride('_method'))

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

router.route('/:id')
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .get(catchAsync(campgrounds.showCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports=router