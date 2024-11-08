const mongoose=require('mongoose')
const Review=require('./review')

const campgroundSchema=new mongoose.Schema({
    title:String,
    images:[{url: String, filename:String}],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    price:Number,
    description:String,
    location:String,
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    reviews:[{type:mongoose.Schema.Types.ObjectId, ref:'Review'}]
})

campgroundSchema.post('findOneAndDelete', async(camp)=>{
    if(camp){
        console.log(camp)
        await Review.deleteMany({_id:{$in:camp.reviews}})
    }
})

const Campground=mongoose.model('Campground', campgroundSchema)

module.exports=Campground