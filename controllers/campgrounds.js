const { deleteFromSupabase } = require('../middleware')
const Campground=require('../models/campground')
const supabase=require('../supabase/supabase')

module.exports.index=async (req,res,next)=>{
    const campgrounds=await Campground.find()
    res.render('home', {campgrounds})
}

module.exports.renderNewForm=(req,res)=>{
    res.render('new')
}

module.exports.createCampground=async (req,res,next)=>{
  try {

    const newCamp=new Campground(req.body.camp)

    const address=req.body.camp.location;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      
        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              const lat = data[0].lat;
              const lon = data[0].lon;
              newCamp.geometry={"type":"Point", "coordinates":[lat,lon]}
            } else {
              console.log('No results found for this address');
            }
          })
          .catch(error => {
            console.error('Error fetching geocoding data:', error);
          });

    if(req.files.length>0){
    const imageUrls = [];

    for (const file of req.files) {

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('images') // Replace with your bucket name
            .upload(`public/${file.originalname}`, file.buffer, {
                contentType: file.mimetype,
                upsert:true
            });

        if (error) {
            throw error;
        }

        // Generate public URL for the uploaded image
        const publicUrl = supabase.storage
            .from('images')
            .getPublicUrl(data.path).data.publicUrl;

        // Save URL to MongoDB
        imageUrls.push({url: publicUrl, filename: file.originalname});
        }

    newCamp.images=imageUrls.map(image => ({url: image.url, filename:image.filename}))
  }

        newCamp.author=req.user._id
        await newCamp.save()
        req.flash('success', 'Successfully made a new campground!')
        res.redirect('/campgrounds')
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'File upload failed' });
}}

module.exports.renderEditForm=async (req,res,next)=>{
    const {id}=req.params
    const camp=await Campground.findById(id)
    res.render('edit', {camp})
}

module.exports.updateCampground=async (req,res,next)=>{
    const {id}=req.params
    const camp=await Campground.findByIdAndUpdate(id,req.body.camp)
    if(req.files.length>0){
        const imageUrls = [];
    
        for (const file of req.files) {
    
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('images') // Replace with your bucket name
                .upload(`public/${file.originalname}`, file.buffer, {
                    contentType: file.mimetype,
                    upsert:true
                });
    
            if (error) {
                throw error;
            }
    
            // Generate public URL for the uploaded image
            const publicUrl = supabase.storage
                .from('images')
                .getPublicUrl(data.path).data.publicUrl;
    
            // Save URL to MongoDB
            imageUrls.push({url: publicUrl, filename: file.originalname});
            }
    
        const imgs=imageUrls.map(image => ({url: image.url, filename:image.filename}))
        camp.images.push(...imgs)
      }    
        if(req.body.deleteImages){
            const allCampgrounds=await Campground.find()
            for(let filename of req.body.deleteImages){
            const elementsWithSameFilename=allCampgrounds.filter(campground => campground.images.filter(image => image.filename===filename).length>0).length;
            if(elementsWithSameFilename===1){
            const { data, error } = await supabase.storage
                .from('images') // Replace with your bucket name
                .remove(`public/${filename}`);
        }
        await camp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
        }}
    await camp.save()

    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${id}`)
}

module.exports.showCampground=async (req,res,next)=>{
    const {id}=req.params
    const camp=await Campground.findById(id).populate({path:'reviews', populate: {path:'author'}}).populate('author')
    if(!camp){
        req.flash('error', 'Cannot find requested campground!')
        return res.redirect('/campgrounds')
    }
    res.render('show', {camp})
}

module.exports.deleteCampground=async (req,res,next)=>{
    const {id}=req.params
    const campground=await Campground.findById(id)
    deleteFromSupabase(campground)
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}