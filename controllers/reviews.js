const Review=require('../models/review')
const Campground=require('../models/campground')

module.exports.createReview=async (req,res,next)=>{
    const {id}=req.params
    const camp=await Campground.findById(id)
    const review=new Review(req.body.review)
    review.author=req.user._id
    camp.reviews.push(review)
    await review.save()
    await camp.save()
    req.flash('success', 'Successfully made a new review!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview=async(req,res,next)=>{
    const {id, reviewId}=req.params
    await Campground.findByIdAndUpdate(id, {$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}