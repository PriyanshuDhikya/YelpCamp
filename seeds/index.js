require('dotenv').config()

const mongoose=require('mongoose')
const Campground=require('../models/campground')
const cities=require('./cities')
const {places,descriptors}=require('./seedHelpers')
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/YelpCamp'

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl)
  .then(()=>{
    console.log('database connection established!')
  })
  .catch((err)=>{
    console.log('error while connecting to database!!')
  })
}

const sample= (array) => array[Math.floor(Math.random() * array.length)];

const seedDB= async()=>{
  await Campground.deleteMany({})
  for(let i=0;i<50;i++){
    const random1000=Math.floor(Math.random()*1000)
    const price=Math.floor(Math.random()*20)+10
    const camp=new Campground({
      author: '67324034e5c1f93fac15971a',
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state} `,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum quasi doloremque libero maiores nihil at qui, temporibus sunt adipisci sed exercitationem totam quas consequuntur perferendis unde voluptatem, maxime harum alias.',
      price: price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dbmpwyvt9/image/upload/v1731256851/SecondYelpCamp/zglvjkf71fzkh7qqjast.jpg',
          filename: 'SecondYelpCamp/v4ciav1juzgvhqpa9xqw',
        },
        {
          url: 'https://res.cloudinary.com/dbmpwyvt9/image/upload/v1731256848/SecondYelpCamp/dfggzyzfxm8bszj9or6i.jpg',
          filename: 'SecondYelpCamp/awfrsoqgm15fwsjnbyer',
        },
        {
          url: 'https://res.cloudinary.com/dbmpwyvt9/image/upload/v1731256847/SecondYelpCamp/o3xnojfhve8dhhjpsol4.jpg',
          filename: 'SecondYelpCamp/awfrsoqgm15fwsjnbyer',
        }    
      ]
    })
    await camp.save()
  }
}
seedDB().then(()=>{
  mongoose.connection.close();
})