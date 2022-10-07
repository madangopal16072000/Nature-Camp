const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/yelp-camp");
  console.log("Database Connected");
}
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 1; i <= 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 10) + 20;
    const camp = await new Campground({
      author: "62d1572d45915c0c24e48645",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro quas repellendus voluptate eius, eveniet consequuntur labore natus illo! Doloribus, nihil.",
      price,
      geometry : { "type" : "Point", "coordinates" : [ cities[random1000].longitude, cities[random1000].latitude ] },
      images: [
        {
          url : "https://res.cloudinary.com/dpo7yvwxc/image/upload/v1657563711/YelpCamp/young-woman-loving-nature-she-makes-heart-with-hands-picture-id1317283862_lvbijy.jpg",
          filename : "YelpCamp/young-woman-loving-nature-she-makes-heart-with-hands-picture-id1317283862_lvbijy",
        },
        {
          url: "https://res.cloudinary.com/dpo7yvwxc/image/upload/v1657562822/YelpCamp/jebhda3bgvadjsghhrnl.jpg",
          filename: "YelpCamp/jebhda3bgvadjsghhrnl",
        },
        {
          url: "https://res.cloudinary.com/dpo7yvwxc/image/upload/v1657562822/YelpCamp/coyl69yvuhmm35xrbicx.jpg",
          filename: "YelpCamp/coyl69yvuhmm35xrbicx",
        },
        {
          url: "https://res.cloudinary.com/dpo7yvwxc/image/upload/v1657562822/YelpCamp/ozevmlvrn3p5hmae3m9n.jpg",
          filename: "YelpCamp/ozevmlvrn3p5hmae3m9n",
        },
      ],
    });
    camp.save();
  }
};

seedDB();
