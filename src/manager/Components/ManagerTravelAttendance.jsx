import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import ManagerTravelAttendenceMap from './ManagerTravelAttendanceMap';
import '../Css/ManagerTravelAttendance.css';

const ManagerTravelAttendence = ({ record }) => {
  // Extracting details from the record prop
  const {
    username = "N/A",
    date = "N/A",
    logInTime = "N/A",
    logoutTime = "N/A",
    status = "N/A",
    startTime = "N/A",
    endTime = "N/A",
    odometerStartReading,
    odometerEndReading,
    startReadingPhotoUrl,
    endReadingPhotoUrl,
    travelledDistance = "N/A",
    lastLocX,
    lastLocY,
    pointWkt,
  } = record || {};

  // Parsing coordinates from pointWkt (Assuming it's in 'MULTIPOINT ((lon lat), (lon lat))' format)
  const coordinates = pointWkt?.match(/[-+]?[0-9]*\.?[0-9]+/g) || [];

  const startLocation = {
    name: 'Start Location',
    lat: coordinates.length > 1 ? parseFloat(coordinates[1]) : 17.385,
    lon: coordinates.length > 1 ? parseFloat(coordinates[0]) : 78.4867,
  };

  const endLocation = {
    name: 'End Location',
    lat: lastLocY || 17.4457,
    lon: lastLocX || 78.3497,
  };

  // Array of locations to be used in the map component
  const locations = [startLocation, endLocation];

  return (
    <Container fluid className="form-container">
      {/* Attendee Details and Map Side by Side */}
      <Row>
        {/* Attendee Details Section */}
        <Col md={6}>
          <Row className="section-header attendee-header">
            <Col><h5>Attendee Details</h5></Col>
          </Row>
          <Row className="form-row">
            <Col md={5}><strong>Name:</strong></Col>
            <Col md={7}>{username}</Col>
          </Row>
          <Row className="form-row">
            <Col md={5}><strong>Date:</strong></Col>
            <Col md={7}>{date}</Col>
          </Row>
          <Row className="form-row">
            <Col md={5}><strong>Login Time:</strong></Col>
            <Col md={7}>{logInTime}</Col>
          </Row>
          <Row className="form-row">
            <Col md={5}><strong>Logout Time:</strong></Col>
            <Col md={7}>{logoutTime || 'N/A'}</Col>
          </Row>
          <Row className="form-row">
            <Col md={5}><strong>Status:</strong></Col>
            <Col md={7}>{status}</Col>
          </Row>
        </Col>

        {/* Map Section */}
        <Col md={6}>
          <ManagerTravelAttendenceMap locations={pointWkt} />
        </Col>
      </Row>

      {/* Travelling Details Section */}
      <Row className="section-header travelling-header">
        <Col><h5>Travelling Details</h5></Col>
      </Row>
      <Row className="form-row">
        <Col md={3}><strong>Start Time:</strong></Col>
        <Col md={3}>{startTime}</Col>
        <Col md={3}><strong>End Time:</strong></Col>
        <Col md={3}>{endTime}</Col>
      </Row>
      <Row className="form-row">
        <Col md={6}>
          <p><strong>Odometer Start Reading : </strong> {odometerStartReading}</p>
          <p><strong>Odometer Start Reading Image</strong></p>
          <Image className='odometer' src={ startReadingPhotoUrl || 'defaultStartImagePath'} fluid />
        </Col>
        <Col md={6}>
        <p><strong>Odometer End Reading : </strong>{odometerEndReading}</p>
          <p><strong>Odometer End Reading Image</strong></p>
          <Image className='odometer' src={ endReadingPhotoUrl || 'defaultEndImagePath'} fluid />
        </Col>
      </Row>
      <Row className="form-row">
        <Col md={3}><strong>Total Distance Travelled:</strong></Col>
        <Col md={9}>{travelledDistance} km</Col>
      </Row>
    </Container>
  );
};

export default ManagerTravelAttendence;
