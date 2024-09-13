import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { ref, listAll, getDownloadURL } from "firebase/storage"; // Import necessary Firebase functions
import { storage } from "../firebaseconfig"; // Ensure this is correctly configured

const Banner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    pauseOnHover: false,
  };

  const [banners, setBanners] = useState([]);

  async function LoadMultiBanner() {
    try {
      const storageRef = ref(storage, 'Banners/');
      const res = await listAll(storageRef);
      const bannerData = await Promise.all(res.items.map(async (item) => {
        const url = await getDownloadURL(item);
        const name = item.name;
        return { url, name };
      }));

      setBanners(bannerData);
    } catch (error) {
      console.error("Failed to load banners: ", error);
    }
  }

  useEffect(() => {
    LoadMultiBanner();
  }, []);

  const bannerContainerStyle = {
    width: '70%',
    margin: '0 auto',
    height: '400px',
    overflow: 'hidden'
  };

  return (
    <div style={bannerContainerStyle}>
      <Slider {...settings}>
        {banners.map((banner, index) => (
          <div key={index} style={{ width: '100%', height: '100%' }}>
            <img 
              src={banner.url} 
              alt={banner.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;