import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Banner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false, // ซ่อนปุ่มลูกศร
    pauseOnHover: false, // ไม่หยุดเมื่อเอาเมาส์ชี้
  };

  const images = [
    <img src='../assets/images/banner1.jpg' alt='Banner 1' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />,
    <img src='../assets/images/banner2.png' alt='Banner 2' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />,
    <img src='../assets/images/banner3.png' alt='Banner 3' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />,
    <img src='../assets/images/banner4.png' alt='Banner 4' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ];

  const bannerContainerStyle = {
    width: '70%', /* ปรับขนาดแบนเนอร์เป็น 70% ของหน้าจอ */
    margin: '0 auto', /* จัดให้อยู่กลางจอ */
    height: '400px', /* ความสูงของกรอบ */
    overflow: 'hidden' /* ซ่อนส่วนที่เกินออกมา */
  };

  return (
    <div style={bannerContainerStyle}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} style={{ width: '100%', height: '100%' }}>
            {image}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;
