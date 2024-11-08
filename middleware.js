const Campground=require('./models/campground')
const Review=require('./models/review')
const ExpressError = require('./utilities/ExpressError')
const {campgroundSchema, reviewSchema}=require('./schemas')
const supabase=require('./supabase/supabase')

module.exports.deleteAllFromSupabase=async(campground)=>{
        let files = [];
        let nextPageToken = 0;

        // Loop until all files are retrieved
        while (true) {
            const { data, error, next } = await supabase
                .storage
                .from('images')
                .list('public', { offset: nextPageToken });  // List files with pagination

            if (error) throw error;

            files = [...files, ...data];  // Append new files to the list

            if (!next) break;  // If no more pages, exit the loop
            nextPageToken = next;
        }

        for(let file of files){
            const { data, error } = await supabase.storage
            .from('images') // Replace with your bucket name
            .remove(`public/${file.name}`);
        }
}

module.exports.deleteFromSupabase=async(campground)=>{
    if(campground && campground.images){
        const allCampgrounds=await Campground.find()
        for(let img of campground.images){
        const elementsWithSameFilename=allCampgrounds.filter(camp => camp.images.filter(image => image.filename===img.filename).length>0).length;
        if(elementsWithSameFilename===1){
        const { data, error } = await supabase.storage
            .from('images') // Replace with your bucket name
            .remove(`public/${img.filename}`);
        }}
    }}

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')
    }
    next()
}

module.exports.storeReturnTo=(req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo=req.session.returnTo
    }
    next()
}

module.exports.validateCampground=(req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if(error){
        const msg=error.details.map(e=>e.message).join(', ')
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}

module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const campground= await Campground.findById(id)
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isReviewAuthor=async(req,res,next)=>{
    const {id, reviewId}=req.params
    const review= await Review.findById(reviewId)
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview=(req,res,next)=>{
    const {error}=reviewSchema.validate(req.body)
    if(error){
        const msg=error.details.map(e=>e.message).join(', ')
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}
