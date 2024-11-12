const Campground = require('../models/campground')
const {cloudinary} = require('../cloudinary/index');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async(req,res)=>{
  const campgrounds = await Campground.find()
  res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req,res)=>{
  res.render('campgrounds/new')
}

module.exports.createCampground = async(req,res)=>{
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry;
  campground.images = req.files.map(f=> ({url:f.path, filename:f.filename}))
  campground.author = req.user._id;
  await campground.save()
  req.flash('success', "New Campground is successfully  created");
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.updateCampground = async(req,res)=>{
  const {id}=req.params
  const data=req.body.campground
  const campground=await Campground.findByIdAndUpdate(id, data, {runValidators: true, new: true}).populate('reviews')
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  campground.geometry = geoData.features[0].geometry;
  const imgs = req.files.map(f =>({url: f.path, filename: f.filename}))
  campground.images.push(...imgs)
  await campground.save()
  if(req.body.deleteImages){
    for(let filename of req.body.deleteImages){
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
  }
  req.flash('success', "Campground is  successfully updated");
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderEditForm = async(req,res)=>{

  const {id}=req.params
  const campground=await Campground.findById(id)
  if(!campground) {
    req.flash('error', "Campground not found");
    return res.redirect('/campgrounds')
    }
  res.render('campgrounds/edit' , {campground})
}

module.exports.showCampground = async(req,res)=>{
  const {id}=req.params;
  const campground = await Campground.findById(id).populate({
    path:'reviews',
    populate: {
      path: 'author',
    }
  }).populate('author');
  if(!campground) {
    req.flash('error', 'Campground not found');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show',{campground})
}

module.exports.deleteCampground = async(req,res)=>{
  const {id}=req.params
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds')
}