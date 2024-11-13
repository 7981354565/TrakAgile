import React, { useState } from 'react';
import './EmployeeView.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { IoMdArrowBack } from 'react-icons/io';

const EmployeeView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { employee } = location.state || {};
    const [showModal, setShowModal] = useState(false);

    const handleImageClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className='employee-page'>
            <div className='empl-create-headings'><center><h5>Employee Personal Information</h5></center></div>
            <div className='d-flex justify-content-between'>
                <div>
                    <div className='p-1'><strong>Employee Name :</strong> {employee.empName}</div>
                    <div className='p-1'><strong>Father Name :</strong> {employee.empFatherName}</div>
                    <div className='p-1'><strong>Date of Birth :</strong> {employee.dob}</div>
                    <div className='p-1'><strong>Aadhar Number :</strong> {employee.aadhar}</div>
                    <div className='p-1'><strong>PAN Number :</strong> {employee.pan}</div>
                    <div className='p-1'><strong>Email ID :</strong> {employee.email}</div>
                    <div className='p-1'><strong>Mobile Number :</strong> {employee.phone}</div>
                    <div className='p-1'><strong>Blood Group :</strong> {employee.bloodGroup || 'N/A'}</div>
                    <div className='p-1'><strong>Licence Number :</strong> {employee.licenceNo || 'N/A'}</div>
                </div>

                <div>
                    <img
                        className='employee-image'
                        src={employee.profilePicUrl}
                        alt="Employee"
                        onClick={handleImageClick}
                        style={{ cursor: 'pointer' }} // Add pointer cursor for clickable indication
                    />
                </div>
            </div>
                <div className="empl-create-headings"><center><h5>Work Address</h5></center></div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="p-1"><strong>Address:</strong> {employee.address}</div>
                        <div className="p-1"><strong>Country:</strong> {employee.country}</div>
                        <div className="p-1"><strong>State:</strong> {employee.countryState}</div>
                        <div className="p-1"><strong>Package :</strong> {employee.userPackage || 'N/A'}</div>
                    </div>
                    <div className="col-md-6">
                        <div className="p-1"><strong>District:</strong> {employee.district}</div>
                        <div className="p-1"><strong>Zonal:</strong> {employee.zonal}</div>
                        <div className="p-1"><strong>Mandal:</strong> {employee.mandal}</div>
                        {/* <div className="p-1"><strong>Gp:</strong> {employee.gp}</div> */}
                    </div>
                </div>

            <div className='empl-create-headings '><center><h5>Emergency Contact</h5></center></div>
            {employee.empEmergencyDto && employee.empEmergencyDto.length > 0 ? (
                employee.empEmergencyDto.map((contact, index) => (
                    <div key={index} className='p-1'>
                        <div><strong>Name:</strong> {contact.name || 'N/A'}</div>
                        <div><strong>Mobile Number:</strong> {contact.phone || 'N/A'}</div>
                        <div><strong>Email Id:</strong> {contact.email || 'N/A'}</div>
                        <div><strong>Relation To Employee:</strong> {contact.relation || 'N/A'}</div>
                    </div>
                ))
            ) : (
                <p>No Emergency Information...</p>
            )}

            <div className='empl-create-headings '><center><h5><center><h5> Work Information</h5></center></h5></center></div>
            <div>
                <div className='p-1'><strong>Date of Joining :</strong> {employee.doj}</div>
                <div className='p-1'><strong>Work Location :</strong> {employee.workLocation}</div>
                <div className='p-1'><strong>Designation :</strong> {employee.designation}</div>
                <div className='p-1'><strong>Manager :</strong> {employee.managerName}</div>
                <div className='p-1'><strong>Is Manager :</strong> {employee.isManager ? 'Yes' : 'No'}</div>
            </div>

            <div className='empl-create-headings '><center><h5>Vehicle Information</h5></center></div>
            {employee.vehicleInfoDto && employee.vehicleInfoDto.length > 0 ? (
                employee.vehicleInfoDto.map((vehicle, index) => (
                    <div key={index} className='p-1'>
                        <div><strong>Vehicle Name:</strong> {vehicle.vehicleName || 'N/A'}</div>
                        <div><strong>Vehicle Make:</strong> {vehicle.vehicleMake || 'N/A'}</div>
                        <div><strong>Vehicle Type:</strong> {vehicle.vehicleType || 'N/A'}</div>
                        <div><strong>Registration Number:</strong> {vehicle.regNo || 'N/A'}</div>
                    </div>
                ))
            ) : (
                <p>No Vehicle Information...</p>
            )}

            <div className='button-div'>
                <button className='button' onClick={() => {
                    navigate('/employees')
                }}> <IoMdArrowBack/> Back</button>
            </div>

            {/* Modal for Full-Screen Image */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Body>
                    <img
                        src={employee.profilePicUrl}
                        alt="Employee Full Screen"
                        className='img-fluid'
                        style={{ width: '100%' }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default EmployeeView;
