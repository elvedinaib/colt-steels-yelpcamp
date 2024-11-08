if(process.env.NODE_ENV!=='production'){
    require('dotenv').config()
}

const mongoose=require('mongoose')
const Campground=require('../models/campground')
const cities=require('./cities')
const {places, descriptors}=require('./helpers')
const { deleteAllFromSupabase } = require('../middleware')
const supabase=require('../supabase/supabase')

const randomElement=array=>{return array[Math.floor(Math.random()*array.length)]}

mongoose.connect('mongodb://localhost:27017/yelpcamp')
.then(()=>console.log("Connection open!"))
.catch((err)=>(`Connection failed! Error: ${err}`))

const seedDB=async function(){
    deleteAllFromSupabase()
    await Campground.deleteMany({})
    for(let i=0; i<50; i++){
        const random1000=Math.floor(Math.random()*1000)
        const price=Math.floor(Math.random()*20)+10
        const camp=new Campground({
            title: `${randomElement(descriptors)} ${randomElement(places)}`,
            images: [{url:'https://plus.unsplash.com/premium_photo-1665311514766-16cba123d6ae?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                filename: 'premium_photo-1665311514766-16cba123d6ae'
            },
        {url:'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2FtcGluZ3xlbnwwfHwwfHx8MA%3D%3D',
            filename: 'photo-1504280390367-361c6d9f38f4'
        }],
            geometry: {type:"Point", coordinates: [cities[random1000].latitude, cities[random1000].longitude]},
            price,
            description: 'Nestled in the heart of nature, our campground offers a serene escape from the hustle and bustle of everyday life. Surrounded by lush forests and tranquil lakes, it’s the perfect spot for outdoor enthusiasts and families alike. Enjoy hiking, fishing, and stargazing under the clear night sky. With modern amenities and spacious sites, you’ll have everything you need for a comfortable and memorable stay. Come and reconnect with nature at our beautiful campground!',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: '67090698ea01f48c10c13e62'
        })
    await camp.save()
    }
}

seedDB().then(()=> mongoose.connection.close())
