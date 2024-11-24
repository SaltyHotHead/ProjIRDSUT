import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { ref, getDownloadURL } from '@firebase/storage';
import { storage } from "../firebaseconfig";
import html2canvas from 'html2canvas'; // Import html2canvas
import './CertificateGenerator.css'; // Import your CSS for styling

const CertificateGenerator = ({ userName, courseId }) => {
  const containerRef = useRef(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateBackground, setCertificateBackground] = useState(null);

  useEffect(() => {
    const loadFont = async () => {
      try {
        // Create a FontFace object
        const SUTFont = new FontFace('SUTFont', 'url("/assets/fonts/SUT Bold ver 1.00.ttf")');

        // Wait for font to load
        await SUTFont.load();

        // Add the loaded font to the document
        document.fonts.add(SUTFont);
      } catch (error) {
        console.error('Error loading font:', error);
      }
    };

    loadFont();
  }, []);

  const downloadCertificate = async () => {
    const img = new Image();
    img.src = certificateBackground;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = await html2canvas(containerRef.current, {
      useCORS: true,
      backgroundColor: null,
      scale: 2,
      letterRendering: true
    });  
    const dataUrl = canvas.toDataURL('image/png');

    // Create a link element to download the image
    const link = document.createElement('a');
    console.log(link)
    link.href = dataUrl;
    link.download = 'certificate.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Function to toggle the certificate display
  const toggleCertificate = () => {
    setShowCertificate(!showCertificate);
  };

  // Get the appropriate background image for the certificate
  useEffect(() => {
    const fetchCertificateBackground = async () => {
      if (!courseId) {
        return;
      }

      try {
        // Use courseId to fetch the certificate template
        const certificateRef = ref(storage, `certificates/${courseId}.jpg`);
        const url = await getDownloadURL(certificateRef);
        setCertificateBackground(url);
      } catch (error) {
        console.error('Error fetching certificate background:', error);
      }
    };

    if (showCertificate) {
      fetchCertificateBackground();
    }
  }, [courseId, showCertificate]);

  return (
    <View style={styles.container}>
      {/* Show/Hide Certificate button */}
      <TouchableOpacity onPress={toggleCertificate} style={styles.button}>
        <Text style={styles.buttonText}>
          {showCertificate ? 'ซ่อนใบประกาศ' : 'แสดงใบประกาศ'}
        </Text>
      </TouchableOpacity>

      {/* Display Certificate */}
      {showCertificate && (
        <>
          <ImageBackground
            source={certificateBackground}
            style={styles.certificate}
            resizeMode="contain"
            ref={containerRef}
          >
            <View style={styles.fontContainer}>
              {/* User's Name */}
              <Text className="certificateText" style={styles.certificateText}>{userName}</Text>
            </View>
          </ImageBackground>

          {/* Download Certificate Button */}
          <TouchableOpacity onPress={downloadCertificate} style={styles.button}>
            <Text style={styles.buttonText}>ดาวน์โหลดใบประกาศ</Text>
          </TouchableOpacity>

        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24, // Increased header font size for better readability
    marginBottom: 20,
  },
  certificate: {
    width: 600,  // Slightly increased certificate width
    height: 400, // Adjusted height for better image fit
    justifyContent: 'center',
  },

  fontContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  certificateText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 28,
    color: '#333',
    fontFamily: 'SUTFont', // Using the custom font
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});


export default CertificateGenerator;