if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const express=require('express')
const app=express()
const path=require('path')
const ejsMate=require('ejs-mate')
const mongoose=require('mongoose')
const ExpressError = require('./utilities/ExpressError')
const campgroundRoutes=require('./routes/campgrounds')
const reviewRoutes=require('./routes/reviews')
const userRoutes=require('./routes/users')
const session=require('express-session')
const flash=require('connect-flash')
const methodOverride=require('method-override')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')
const mongoSanitize=require('express-mongo-sanitize')
const { name } = require('ejs')
const helmet=require('helmet')
const MongoStore=require('connect-mongo')
const { func } = require('joi')

const dbUrl= process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp'

mongoose.connect(dbUrl)
.then(()=>{
    console.log("Mongo connection open!")
})
.catch(err=>{
    console.log(`Mongo connection failed! Error: ${err}`)
})

app.set('views', path.join(__dirname,'/views/campgrounds'))
app.set('view engine', 'ejs')

app.set('trust proxy', 1);

app.engine('ejs', ejsMate)

app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public')))

const secret= process.env.SECRET || 'badsecret!'

const store=MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    ttl: 24*60*60
})

store.on('error', function(e){
    console.log('Session store error', e)
})

const sessionConfig={
    store,
    name: 'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        expires:Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(mongoSanitize())
app.use(helmet({contentSecurityPolicy:false}))

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js",
    "https://unpkg.com/leaflet.markercluster@1.5.0/dist/leaflet.markercluster.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net/",
    "https://unpkg.com/leaflet@1.9.3/dist/leaflet.css",
    "https://unpkg.com/leaflet.markercluster@1.5.0/dist/MarkerCluster.css",
    "https://unpkg.com/leaflet.markercluster@1.5.0/dist/MarkerCluster.Default.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://plus.unsplash.com/",
                "https://images.unsplash.com",
                "https://*.tile.openstreetmap.org/",
                "https://unpkg.com/",
                "https://rndrxoewmiseleswlbep.supabase.co/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    res.locals.currentUser=req.user
    next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req,res)=>{
    res.render('../home')
})

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404))
})

app.use((err,req,res,next)=>{
    const {status=500, message='Something went wrong'}=err
    res.status(status).render('error', {err})
})

const port=process.env.PORT || 3000

app.listen(port, ()=>{
    console.log(`Serving on port ${port}!`)
})