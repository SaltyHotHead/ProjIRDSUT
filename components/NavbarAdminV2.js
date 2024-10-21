import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const NavbarAdminV2 = ({ courseId }) => {
  const navigation = useNavigation();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#" onClick={() => navigation.navigate('HomeAdmin')}>
          <img src='../assets/images/logo.jpg' style={{ height: 70, width: 200 }} />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => navigation.navigate('CourseDetail', { courseId })}>ข้อมูลการอบรม</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => navigation.navigate('EnrolUser', { courseId })}>ข้อมูลผู้สมัคร</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={() => navigation.navigate('ExportToExcel', { courseId })}>ดาวน์โหลดข้อมูลผู้สมัคร</a>
            </li>
          </ul>
          <div className="ms-auto">
            <a href="#" onClick={() => navigation.navigate('Profile')}>
              <img src='../assets/images/user.png' alt="Profile" style={{ width: '50px', height: '50px' }} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdminV2;