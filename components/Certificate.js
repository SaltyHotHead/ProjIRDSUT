import React, { useState, useRef } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import html2canvas from 'html2canvas'; // Import html2canvas
import './CertificateGenerator.css'; // Import your CSS for styling

const CertificateGenerator = ({ userName, trainingName, trainingDetails, trainingDate, certIssueDate, organizationName }) => {
  const containerRef = useRef(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certStyle, setCertStyle] = useState(2); // Certificate style state

  const downloadCertificate = async () => {
    const canvas = await html2canvas(containerRef.current);
    const dataUrl = canvas.toDataURL('image/png');

    // Create a link element to download the image
    const link = document.createElement('a');
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

  // Function to switch certificate styles
  const switchStyle = () => {
    setCertStyle(prevStyle => (prevStyle === 1 ? 2 : 1)); // Toggle between style 1 and 2
  };

  // Get the appropriate background image for the certificate
  const getCertImage = () => {
    return certStyle === 1
      ? require('./certificate.jpg') // Use the first background for style 1
      : require('./certificate2.jpg'); // Use the second background for style 2
  };

  // Styles based on certStyle
  const getStyles = () => {
    if (certStyle === 1) {
      return {
        orgName: styles.orgNameStyle1,
        orgSubName: styles.orgSubNameStyle1,
        certificateText: styles.certificateTextStyle1,
        courseName: styles.courseNameStyle1,
        courseDetails: styles.courseDetailsStyle1,
        courseDate: styles.courseDateStyle1,
        issueDate: styles.issueDateStyle1,
      };
    } else {
      return {
        orgName: styles.orgNameStyle2,
        orgSubName: styles.orgSubNameStyle2,
        certificateText: styles.certificateTextStyle2,
        courseName: styles.courseNameStyle2,
        courseDetails: styles.courseDetailsStyle2,
        courseDate: styles.courseDateStyle2,
        issueDate: styles.issueDateStyle2,
      };
    }
  };

  const currentStyles = getStyles();

  return (
    <View style={styles.container}>
      {/* Show/Hide Certificate button */}
      <TouchableOpacity onPress={toggleCertificate} style={styles.button}>
        <Text style={styles.buttonText}>
          {showCertificate ? 'Hide Certificate' : 'Show Certificate'}
        </Text>
      </TouchableOpacity>

      {/* Display Certificate */}
      {showCertificate && (
        <>
          <ImageBackground
            source={getCertImage()}
            style={styles.certificate}
            resizeMode="contain"
            ref={containerRef}
          >
            <View style={styles.fontContainer}>
              {/* Organization Name */}
              <Text style={currentStyles.orgName}>Research and Development Institute</Text>
              <Text style={currentStyles.orgSubName}>{organizationName}</Text>

              {/* User's Name */}
              <Text style={currentStyles.certificateText}>{userName}</Text>

              {/* Course and Date Containers */}
              <View style={styles.container}>
                <View style={styles.courseContainer}>
                  <Text style={currentStyles.courseName}>{trainingName}</Text>
                </View>

                <View style={styles.detailsContainer}>
                  <Text style={currentStyles.courseDetails}>{trainingDetails}</Text>
                </View>

                <View style={styles.dateContainer}>
                  <Text style={currentStyles.courseDate}>{`Date of Completion: ${trainingDate}`}</Text>
                </View>
              </View>

              {/* Date issued */}
              <Text style={currentStyles.issueDate}>{`Issued on ${certIssueDate}`}</Text>
            </View>
          </ImageBackground>

            {/* Download Certificate Button */}
            <TouchableOpacity onPress={downloadCertificate} style={styles.button}>
              <Text style={styles.buttonText}>Download Certificate</Text>
            </TouchableOpacity>

          {/* Switch Certificate Style button 
          <TouchableOpacity onPress={switchStyle} style={styles.button}>
            <Text style={styles.buttonText}>Switch Certificate Style</Text>
          </TouchableOpacity>
          */}
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
      width: 580,  // Slightly increased certificate width
      height: 400, // Adjusted height for better image fit
      justifyContent: 'center',
    },
  
    fontContainer: {
      width: '100%',
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    // Styles for certificate style 1
    orgNameStyle1: {
      position: 'absolute',
      top: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: '#964B00',
      textAlign: 'center',
    },
    orgSubNameStyle1: {
      position: 'absolute',
      top: 24,
      fontSize: 16,
      color: '#555',
      textAlign: 'center',
    },
    certificateTextStyle1: {
      position: 'absolute',
      top: 100,
      fontSize: 22,
      color: '#000',
      fontFamily: 'Times New Roman',
      textAlign: 'center',
    },
    courseNameStyle1: {
      top: 70,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 50,
    },
    courseDetailsStyle1: {
      top: 60,
      fontSize: 14,
      color: '#555',
      textAlign: 'center',
      marginTop: 10,
    },
    courseDateStyle1: {
      top: 120,
      fontSize: 10,
      color: '#888',
      textAlign: 'center',
      marginTop: 20,
    },
    issueDateStyle1: {
      top: 70,
      fontSize: 8,
      color: '#555',
      textAlign: 'center',
      marginTop: 30,
    },
  
    // Styles for certificate style 2
    orgNameStyle2: {
      position: 'absolute',
      top: 27,
      fontSize: 24,
      fontWeight: 'bold',
      color: '#003366',
      textAlign: 'center',
    },
    orgSubNameStyle2: {
      position: 'absolute',
      top: 60,
      fontSize: 18,
      color: '#444',
      textAlign: 'center',
    },
    certificateTextStyle2: {
      position: 'absolute',
      top: 110,
      fontSize: 24,
      color: '#333',
      fontFamily: 'Arial',
      textAlign: 'center',
    },
    courseNameStyle2: {
      top: 75,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 60,
    },
    courseDetailsStyle2: {
      top: 60,
      fontSize: 15,
      color: '#666',
      textAlign: 'center',
      marginTop: 15,
    },
    courseDateStyle2: {
      top: 55,
      fontSize: 15,
      color: '#777',
      textAlign: 'center',
      marginTop: 25,
    },
    issueDateStyle2: {
      fontSize: 13,
      color: '#666',
      textAlign: 'center',
      marginTop: 35,
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