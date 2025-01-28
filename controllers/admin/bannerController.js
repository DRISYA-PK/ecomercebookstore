const Banner = require('../../models/bannerSchema');
const fs = require('fs');
const path = require('path');

const renderAddBannerPage = (req, res) => {
  res.render('banneradd');
};

const createBanner = async (req, res) => {
  try {
    const { title, description, linkUrl } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!imagePath) {
      return res.status(400).send('No image uploaded');
    }

    const newBanner = new Banner({
      title,
      description,
      imagePath: imagePath.replace('uploads/', ''),
      linkUrl
    });

    await newBanner.save();
    res.redirect('/banners/list');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating banner');
  }
};

const listBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.render('banner-list', { banners });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching banners');
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      // Delete image file
      const imagePath = path.join(__dirname, '../uploads/banners', banner.imagePath);
      fs.unlinkSync(imagePath);

      // Delete banner from database
      await Banner.findByIdAndDelete(req.params.id);
      res.redirect('/banners/list');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting banner');
  }
};




module.exports={
    deleteBanner,
    listBanners,
    createBanner,
    renderAddBannerPage,
   }