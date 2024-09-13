import React from 'react';
import './EventDetails.css'; // สำหรับการจัดการสไตล์

const EventDetails = ({ imageUrl, name, schedule, status }) => {
  const statusLabels = {
    registered: 'ลงทะเบียน',
    paid: 'ชำระเงิน',
    pending: 'รอการตรวจสอบ',
    completed: 'ลงทะเบียนเสร็จสิ้น'
  };

  return (
    <div className="event-details">
      <img src={imageUrl} alt={name} className="event-image" />
      <div className="event-info">
        <h2>{name}</h2>
        <p>กำหนดการ: {schedule}</p>
        <div className="status-bar">
          {Object.keys(statusLabels).map((key) => (
            <div
              key={key}
              className={`status-item ${status === key ? 'active' : ''}`}
            >
              {statusLabels[key]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
