const User=require('../models/user')

module.exports.renderRegister=(req,res)=>{
    res.render('../users/register')
}

module.exports.register=async (req,res,next)=>{
    const {username, password, email}=req.body
    const user=new User({username, email})
    const registeredUser=await User.register(user,password)
    req.login(registeredUser, err=>{
        if (err) return next(err)
        req.flash('success', 'Welcome to Yelp Camp!')
        res.redirect('/campgrounds')
    })
}

module.exports.renderLogin=(req,res)=>{
    res.render('../users/login')
}

module.exports.login=(req,res)=>{
    req.flash('success', 'Welcome back!')
    const redirectUrl=res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl)
}

module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err) return next(err)
        req.flash('success', 'Goodbye!')
        res.redirect('/campgrounds')
    })
}