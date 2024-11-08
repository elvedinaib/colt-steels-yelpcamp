const express=require('express')
const router=express.Router({mergeParams:true})
const Review=require('../models/review')
const catchAsync=require('../utilities/catchAsync')
const methodOverride=require('method-override')
const Campground=require('../models/campground')
const {validateReview, isLoggedIn, isReviewAuthor}=require('../middleware')
const reviews=require('../controllers/reviews')

router.use(express.urlencoded({extended:true}))
router.use(methodOverride('_method'))

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports=router