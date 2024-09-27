import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Link } from 'react-router-dom'; // นำเข้า Link จาก react-router-dom
import logo from '../assets/images/logo.jpg'
import { useNavigation } from '@react-navigation/native'; // นำเข้า useNavigation เพื่อใช้ฟังก์ชันการนำทาง

const NavbarAdminV2 = () => {
    const navigation = useNavigation(); // ใช้ useNavigation เพื่อเข้าถึง navigation object

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{ backgroundColor: '#ffffff' }} >
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
                            <a className="nav-link " href="#" onClick={() => navigation.navigate('Course')}>ข้อมูลการอบรม</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link " href="#" onClick={() => navigation.navigate('TrainingUser')} >ข้อมูลผู้สมัคร</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link " href="#" onClick={() => navigation.navigate('MyTrainingUser')} >ดาวน์โหลดข้อมูลผู้สมัคร</a>
                        </li>
                    </ul>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <div className="ms-auto">
                            <a href="#" style={{ outline: 'none', boxShadow: 'none', border: 'none' }} onClick={() => navigation.navigate('Profile')}>
                                <img src='../assets/images/user.png' alt="Profile" style={{ width: '50px', height: '50px' }} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavbarAdminV2;
