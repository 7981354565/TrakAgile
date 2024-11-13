import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pagination } from 'react-bootstrap'; // Ensure Pagination is imported
import { FaCircle, FaCheck } from 'react-icons/fa';
import { Button, Form, Row, Col, Table, Modal } from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { Pencil, Trash } from 'react-bootstrap-icons'; // Import icons for edit and delete
import '../Css/ManagerEmployeeUpdate.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ManagerEmployeeUpdate = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { employee } = location.state || {};
    const [formData, setFormData] = useState({
        emp : {
            id : employee.id,
            empName: employee.empName,
            empId: employee.empId,
            bloodGroup: employee.bloodGroup,
            countryState: employee.countryState,
            licenceNo: employee.licenceNo,
            address: employee.address, 
            empAddress : employee.empAddress,
            country : employee.country,        // Added the address field
            mandal: employee.mandal,          // Adjusted Mandal capitalization
            email: employee.email,
            zonal : employee.zonal,
            // gp : employee.gp,
            role: employee.role,
            empFatherName: employee.empFatherName,
            dob: employee.dob,
            doj: employee.doj,
            district : employee.district,
            designation: employee.designation,
            managerName: employee.managerName,
            phone: employee.phone,
            aadhar: employee.aadhar,
            manager: employee.manager,
            pan: employee.pan,
            userPackage: employee.userPackage,
            workLocation: employee.workLocation,
            frtTeam: false
        },
        empEmergencyDto: [
            {
                name: employee.empEmergencyDto[0].name || '',
                phone: employee.empEmergencyDto[0].phone || '',
                email: employee.empEmergencyDto[0].email || '',
                relation: employee.empEmergencyDto[0].relation || ''
            }
        ],
        
        vehicleInfoDto: [
            {
                vehicleName: employee.vehicleInfoDto[0].vehicleName || '',
                vehicleMake: employee.vehicleInfoDto[0].vehicleMake || '',
                vehicleType: employee.vehicleInfoDto[0].vehicleType || '',
                regNo: employee.vehicleInfoDto[0].regNo || '',
            
            }
        ]
    });
    
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [packages, setPackages] = useState([]);
    const [zones, setZones] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mandals, setMandals] = useState([]);
    // const [villages, setVillages] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [errors, setErrors] = useState({});
    
    useEffect(() => {
        axios.get('http://68.183.86.1:8080/trackagile/employee/create/init')
            .then(response => {
                // Extract designations, roles, and vehicleTypes from the API response
                const { designations, roles, vehicleTypes } = response.data.data;
                setDesignations(designations || []);
                setRoles(roles || []);
                setVehicleTypes(vehicleTypes || []);
            })
            .catch(error => {
                console.error('Error fetching designations, roles, and vehicle types', error);
            });
    }, []);

     // Handle vehicle type change specifically
     const handleVehicleTypeChange = (e) => {
        const updatedVehicleType = { ...formData.vehicleInfoDto[0], vehicleType: e.target.value };
        setFormData({ ...formData, vehicleInfoDto: [updatedVehicleType] });
    };

    // Fetch countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await axios.get('http://68.183.86.1:8080/trackagile/api/countries');
                setCountries(response.data);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountries();
    }, []);

    // Fetch states based on selected country
    useEffect(() => {
        if (formData.emp.country) {
            const fetchStates = async () => {
                try {
                    const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.emp.country}/states`);
                    setStates(response.data);
                    setFormData((prev) => ({ ...prev,countryState: '', userPackage: '', zonal: '', district: '', mandal: '', gp: '' }));
                } catch (error) {
                    console.error("Error fetching states:", error);
                }
            };
            fetchStates();
        }
    }, [formData.emp.country]);

    // Fetch packages based on selected state
    useEffect(() => {
        if (formData.emp.countryState) {
            const fetchPackages = async () => {
                try {
                    const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.emp.country}/states/${formData.emp.countryState}/pkgs`);
                    setPackages(response.data);
                    setFormData((prev) => ({ ...prev, userPackage: '', zonal: '', district: '', mandal: '', gp: '' }));
                } catch (error) {
                    console.error("Error fetching packages:", error);
                }
            };
            fetchPackages();
        }
    }, [formData.emp.countryState]);

    // Fetch zones based on selected package
    useEffect(() => {
        if (formData.emp.userPackage) {
            const fetchZones = async () => {
                try {
                    const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.emp.country}/states/${formData.emp.countryState}/pkg/${formData.emp.userPackage}/zone`);
                    setZones(response.data);
                    setFormData((prev) => ({ ...prev, zonal: '', district: '', mandal: '', gp: '' }));
                } catch (error) {
                    console.error("Error fetching zones:", error);
                }
            };
            fetchZones();
        }
    }, [formData.emp.userPackage]);

    // Fetch districts based on selected zone
    useEffect(() => {
        if (formData.emp.zonal) {
            const fetchDistricts = async () => {
                try {
                    const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.emp.country}/states/${formData.emp.countryState}/pkg/${formData.emp.userPackage}/zone/${formData.emp.zonal}/dist`);
                    setDistricts(response.data);
                    setFormData((prev) => ({ ...prev, district: '', mandal: '', gp: '' }));
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        }
    }, [formData.emp.zonal]);

    // Fetch mandals based on selected district
    useEffect(() => {
        if (formData.emp.district) {
            const fetchMandals = async () => {
                try {
                    const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.emp.country}/states/${formData.emp.countryState}/pkg/${formData.emp.userPackage}/zone/${formData.emp.zonal}/districts/${formData.emp.district}/mandals`);
                    setMandals(response.data);
                    setFormData((prev) => ({ ...prev, mandal: '', gp: '' }));
                } catch (error) {
                    console.error("Error fetching mandals:", error);
                }
            };
            fetchMandals();
        }
    }, [formData.emp.district]);

    // Fetch villages based on selected mandal
    // useEffect(() => {
    //     if (formData.emp.mandal) {
    //         const fetchVillages = async () => {
    //             try {
    //                 const response = await axios.get(`http://68.183.86.1:8080/trackagile/api/${formData.emp.country}/states/${formData.emp.countryState}/pkg/${formData.emp.userPackage}/zone/${formData.emp.zonal}/districts/${formData.emp.district}/mandals/${formData.emp.mandal}/villages`);
    //                 setVillages(response.data);
    //                 setFormData((prev) => ({ ...prev, gp: '' }));
    //             } catch (error) {
    //                 console.error("Error fetching villages:", error);
    //             }
    //         };
    //         fetchVillages();
    //     }
    // }, [formData.emp.mandal]);
    
    const handleFormChange = (event) => {
        const { name, value } = event.target;
    
        // Check if the field belongs to the emp object
        if (name.startsWith('emp.')) {
            const field = name.split('.')[1]; // Extract the actual field name (e.g., 'empName')
    
            setFormData((prevData) => ({
                ...prevData,
                emp: {
                    ...prevData.emp,
                    [field]: value, // Update the specific field in the emp object
                }
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value, // Update fields outside the emp object
            }));
        }
    
        // Reset the error for the changed field
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '', // Resetting the specific error
        }));
    };
    
    // const [errors, setErrors] = useState({});
    const [contacts1, setContacts1] = useState([]);
    const [errors1, setErrors1] = useState({});
    const [showForm1, setShowForm1] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [managersList, setManagersList] = useState([]);
    const [loadingManagers, setLoadingManagers] = useState(true);
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [managerSearchTerm, setManagerSearchTerm] = useState('');
    const [chosenManager, setChosenManager] = useState(null); // Track the selected manager
    const [finalManager, setFinalManager] = useState(null); // Track confirmed manager for final update

    // Use different pagination variable names to avoid conflicts
    const [managerPage, setManagerPage] = useState(1);
    const [managersPerPage] = useState(5); // Number of records per page

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const response = await fetch('http://68.183.86.1:8080/trackagile/employee/managerInfo');
                const data = await response.json();
                if (data.status === 'OK' && data.data) {
                    setManagersList(data.data);
                } else {
                    console.error('Error fetching manager data:', data.message);
                }
            } catch (error) {
                console.error('Error fetching manager data:', error);
            } finally {
                setLoadingManagers(false);
            }
        };

        fetchManagers();
    }, []);

    // Handle manager selection (circle click)
    const handleManagerSelection = (manager) => {
        setChosenManager(manager); // Set selected manager when circle is clicked
    };

    // Handle final confirmation when the button is clicked
    const handleConfirmManagerSelection = () => {
        if (chosenManager) {
            setFinalManager(chosenManager); // Store the confirmed manager
            handleFormChange({
                target: {
                    name: 'managerName',
                    value: chosenManager.empName, // Only set the manager's name in the form
                },
            });
            setShowManagerModal(false); // Close modal after confirming
        }
    };

    // Filter managers based on search term
    const filteredManagersList = managersList.filter((manager) =>
        manager.empName.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        manager.empId.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        manager.phone.includes(managerSearchTerm) ||
        manager.designation.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        manager.userPackage.toLowerCase().includes(managerSearchTerm.toLowerCase()) ||
        manager.workLocation.toLowerCase().includes(managerSearchTerm.toLowerCase())
    );

    // Calculate total pages for pagination
    const totalManagerPages = Math.ceil(filteredManagersList.length / managersPerPage);

    // Calculate start and end indices for paginated data
    const startManagerIndex = (managerPage - 1) * managersPerPage;
    const endManagerIndex = startManagerIndex + managersPerPage;
    const paginatedManagersList = filteredManagersList.slice(startManagerIndex, endManagerIndex);

    // Handle page change for manager pagination
    const handleManagerPageChange = (pageNumber) => {
        setManagerPage(pageNumber);
    };

    // const handleFormChange = (e) => {
    //     const { id, value, checked, type } = e.target;
    //     setFormData({ ...formData, [id]: type === 'checkbox' ? checked : value });
    // };

    const handleEditClick = (index) => {
        const contactToEdit = contacts1[index];
        setFormData({ ...formData, empEmergencyDto: [contactToEdit] });
        setShowForm1(true); // Show the form for editing
      };
      
      const handleDeleteClick = (index) => {
        const updatedContacts = contacts1.filter((_, i) => i !== index);
        setContacts1(updatedContacts);
      };

      const validateForm = () => {
        const newErrors = {};
    
        // Reset the errors object
        setErrors({});
    
        // List of mandatory fields (nested under `emp`)
        const requiredFields = [
            'empName', 'empFatherName', 'empId', 'dob', 'email', 'aadhar', 'pan', 'phone', 
            'country', 'countryState', 'district', 'mandal', 'address', 'userPackage',
            'zonal', 'doj', 'workLocation', 'designation', 'role'
        ];
    
        requiredFields.forEach((field) => {
            const value = formData.emp[field] || ''; // Access fields within the `emp` object
            if (!value.trim()) {
                newErrors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
            }
        });
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Returns true if there are no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            try {
                // Create FormData to handle file and other form fields
              
                
                // Prepare the employee data structure according to the API requirements
                const empData = {
                    emp: formData.emp,
                    empEmergencyDto: formData.empEmergencyDto,
                    vehicleInfoDto: formData.vehicleInfoDto
                };
               
                // Send the data via POST request
                const response = await axios.post('http://68.183.86.1:8080/trackagile/employee/update', empData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                alert('Employee updated successfully');
                console.log('Server response:', response.data);
            } catch (error) {
                console.error('Error updating employee:', error);
                alert('Failed to update employee. Please try again.');
            }
        } else {
            alert('Please fill in all mandatory fields.');
        }
    };    
    
    const handleSave = () => {
      setContacts1(prevContacts => [...prevContacts, formData.empEmergencyDto[0]]);
      setShowTable(true);
      setShowForm1(false);
  
      // Update formData.empEmergencyDto in case you want to submit the form right away
      setFormData(prevState => ({
          ...prevState,
          empEmergencyDto: [...prevState.empEmergencyDto], // Retain the current list
      }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Handle array updates (e.g., empEmergencyDto[0].name)
    if (name.includes('empEmergencyDto')) {
        const [fieldArray, index, fieldName] = name.split(/[\[\]\.]+/);
    
        setFormData((prevData) => {
            const updatedArray = [...prevData[fieldArray]];
            updatedArray[index] = {
                ...updatedArray[index],
                [fieldName]: value, // Update specific field in array item
            };
        
            return {
                ...prevData,
                [fieldArray]: updatedArray, // Update the array in the formData
            };
        });
    } else {
        // Handle other non-array fields
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    // Reset the error for the changed field
    setErrors1((prevErrors) => ({
        ...prevErrors,
        [name]: '', // Resetting the specific error
    }));
};
    
    
    const handleAddClick = () => {
        setShowForm1(true);
    };

    const handleCancel1 = () => {
        setShowForm1(false);
        setErrors1({});
    };

    return (
        <div className="employee-page">           
           
                <div className="employee-form-container">
                    <Form className="employee-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <center><h5 className='empl-create-headings'>Employee Personal Information</h5></center>
                            <Row>
                            <Form.Group as={Row} controlId="empName">
                                <Form.Label column sm={3}>Name <span className='chukkas'>*</span></Form.Label>
                                <Col sm={9}>
                                    <div className='inputMoving'>
                                        <Form.Control
                                            type="text"
                                            name="emp.empName" // Dot notation to reflect the nested structure
                                            value={formData.emp.empName}
                                            onChange={handleFormChange}
                                            isInvalid={!!errors.empName}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.empName}</Form.Control.Feedback>
                                    </div>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} controlId="empId">
                                <Form.Label column sm={3}>Employee Id <span className='chukkas'>*</span></Form.Label>
                                <Col sm={9}>
                                    <div className='inputMoving'>
                                        <Form.Control
                                            type="text"
                                            name="emp.empId" // Dot notation to reflect the nested structure
                                            value={formData.emp.empId}
                                            onChange={handleFormChange}
                                            isInvalid={!!errors.empId}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.empId}</Form.Control.Feedback>
                                    </div>
                                </Col>
                            </Form.Group>


            <Form.Group as={Row} controlId="empFatherName">
                <Form.Label column sm={3}>Father's Name <span className='chukkas'>*</span></Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='emp.empFatherName'
                            value={formData.emp.empFatherName}
                            onChange={handleFormChange}
                            isInvalid={!!errors.empFatherName}
                        />
                        <Form.Control.Feedback type="invalid">{errors.empFatherName}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="dob">
                <Form.Label column sm={3}>Date of Birth <span className='chukkas'>*</span></Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="date"
                            name='emp.dob'
                            value={formData.emp.dob}
                            onChange={handleFormChange}
                            isInvalid={!!errors.dob}
                        />
                        <Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="aadhar">
                <Form.Label column sm={3}>Aadhar Number <span className='chukkas'>*</span></Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='emp.aadhar'
                            value={formData.emp.aadhar}
                            onChange={handleFormChange}
                            isInvalid={!!errors.aadhar}
                        />
                        <Form.Control.Feedback type="invalid">{errors.aadhar}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="pan">
                <Form.Label column sm={3}>PAN Number <span className='chukkas'>*</span></Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='emp.pan'
                            value={formData.emp.pan}
                            onChange={handleFormChange}
                            isInvalid={!!errors.pan}
                        />
                        <Form.Control.Feedback type="invalid">{errors.pan}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="email">
                <Form.Label column sm={3}>Email ID</Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="email"
                            name='emp.email'
                            value={formData.emp.email}
                            onChange={handleFormChange}
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="phone">
                <Form.Label column sm={3}>Mobile Number <span className='chukkas'>*</span></Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="tel"
                            name='emp.phone'
                            value={formData.emp.phone}
                            onChange={handleFormChange}
                            isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="bloodGroup">
                <Form.Label column sm={3}>Blood Group</Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='emp.bloodGroup'
                            value={formData.emp.bloodGroup}
                            onChange={handleFormChange}
                            isInvalid={!!errors.bloodGroup}
                        />
                        <Form.Control.Feedback type="invalid">{errors.bloodGroup}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="licenceNo">
                <Form.Label column sm={3}>License Number</Form.Label>
                <Col sm={9}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='emp.licenceNo'
                            value={formData.emp.licenceNo}
                            onChange={handleFormChange}
                            isInvalid={!!errors.licenceNo}
                        />
                        <Form.Control.Feedback type="invalid">{errors.licenceNo}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>
                                <div className="form-section"> <br />
                            <center><h5 className='empl-create-headings'>Address</h5></center>
                            <Form.Group as={Row} controlId="empAddress">
                                <Form.Label column sm={3}>Personal Address </Form.Label>
                                <Col sm={9}>
                                                <Form.Control
                                                    type="text"
                                                    name='emp.empAddress'
                                                    value={formData.emp.empAddress}
                                                    onChange={handleFormChange}
                                                    isInvalid={!!errors.empAddress}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.empAddress}</Form.Control.Feedback>
                                            
                                </Col>
                            </Form.Group>
                        </div>

                            </Row>
                        </div>
                        <div className="form-section">
                          <center><h5 className='empl-create-headings'>Emergency Contact Details</h5></center>
                          <Button className="btn btn-primary" onClick={handleAddClick}>Update Emergency Contact <Plus/></Button>
                          {showForm1 && (
                            <Form className='contacts-form'>
                              <Row>
                                <Col md={6}>
                                  <Form.Group controlId="contactName">
                                    <Form.Label>Name <span className='chukkas'>*</span></Form.Label>
                                    <Form.Control
                                      type="text"
                                      name='empEmergencyDto[0].name'
                                      value={formData.empEmergencyDto[0].name}
                                      onChange={handleChange}
                                      isInvalid={!!errors1.name}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors1.name}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group controlId="contactPhone">
                                    <Form.Label>Phone <span className='chukkas'>*</span></Form.Label>
                                    <Form.Control
                                      type="tel"
                                      name='empEmergencyDto[0].phone'
                                      value={formData.empEmergencyDto[0].phone}
                                      onChange={handleChange}
                                      isInvalid={!!errors1.phone}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors1.phone}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group controlId="contactEmail">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                      type="email"
                                      name='empEmergencyDto[0].email'
                                      value={formData.empEmergencyDto[0].email}
                                      onChange={handleChange}
                                      isInvalid={!!errors1.email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors1.email}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                                <Col md={6}>
                                  <Form.Group controlId="relation">
                                    <Form.Label>Relation</Form.Label>
                                    <Form.Control
                                      type="text"
                                      name='empEmergencyDto[0].relation'
                                      value={formData.empEmergencyDto[0].relation}
                                      onChange={handleChange}
                                      isInvalid={!!errors1.relation}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors1.relation}</Form.Control.Feedback>                
                                  </Form.Group>
                                </Col>
                              </Row>
                              <div className="d-flex justify-content-end">
                                <Button variant="success" onClick={handleSave} className="me-2">Save</Button>
                                <Button variant="secondary" onClick={handleCancel1}>Cancel</Button>
                              </div>
                            </Form>
                          )}
                        
                          {showTable && (
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Phone</th>
                                  <th>Email</th>
                                  <th>Relation</th>
                                  <th>Actions</th> {/* New column for action buttons */}
                                </tr>
                              </thead>
                              <tbody>
                                {contacts1.map((contact, index) => (
                                  <tr key={index}>
                                    <td>{contact.name}</td>
                                    <td>{contact.phone}</td>
                                    <td>{contact.email}</td>
                                    <td>{contact.relation}</td>
                                    <td>
                                      {/* Edit button */}
                                      <Button
                                        variant="outline-primary"
                                        className="me-2"
                                        onClick={() => handleEditClick(index)}
                                      >
                                        <Pencil /> {/* Pencil icon for editing */}
                                      </Button>
                                      {/* Delete button */}
                                      <Button
                                        variant="outline-danger"
                                        onClick={() => handleDeleteClick(index)}
                                      >
                                        <Trash /> {/* Trash icon for deleting */}
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </div>
                    <div className="form-section">
                            <center><h5 className='empl-create-headings'>Employee Work Details</h5></center>
                            <Form.Group as={Row} controlId="address">
                                <Form.Label column sm={3}>Address <span className='chukkas'>*</span></Form.Label>
                                <Col sm={9}>
                                                <Form.Control
                                                    type="text"
                                                    name='emp.address'
                                                    value={formData.emp.address}
                                                    onChange={handleFormChange}
                                                    isInvalid={!!errors.address}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                                            
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="country">
                                <Form.Label column sm={3}>
                                    Country <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.country'
                                        value={formData.emp.country}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.country}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map(country => (
                                            <option key={country.id} value={country.country}>
                                                {country.country}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.country}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                                    
                            <Form.Group as={Row} controlId="countryState">
                                <Form.Label column sm={3}>
                                    State <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.countryState'
                                        value={formData.emp.countryState}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.countryState}
                                    >
                                        <option value="">Select State</option>
                                        {states.map(state => (
                                            <option key={state.id} value={state.state}>
                                                {state.state}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.countryState}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                                    
                            <Form.Group as={Row} controlId="userPackage">
                                <Form.Label column sm={3}>
                                    Package <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.userPackage'
                                        value={formData.emp.userPackage}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.userPackage}
                                    >
                                        <option value="">Select Package</option>
                                        {packages.map(pkg => (
                                            <option key={pkg.id} value={pkg.pkg}>
                                                {pkg.pkg}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.userPackage}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                                    
                            <Form.Group as={Row} controlId="zonal">
                                <Form.Label column sm={3}>
                                    Zonal <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.zonal'
                                        value={formData.emp.zonal}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.zonal}
                                    >
                                        <option value="">Select Zonal</option>
                                        {zones.map(zone => (
                                            <option key={zone.id} value={zone.zone}>
                                                {zone.zone}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.zonal}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                                    
                            <Form.Group as={Row} controlId="district">
                                <Form.Label column sm={3}>
                                    District <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.district'
                                        value={formData.emp.district}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.district}
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(district => (
                                            <option key={district.id} value={district.dist}>
                                                {district.dist}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.district}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                                    
                            <Form.Group as={Row} controlId="mandal">
                                <Form.Label column sm={3}>
                                    Mandal <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.mandal'
                                        value={formData.emp.mandal}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.mandal}
                                    >
                                        <option value="">Select Mandal</option>
                                        {mandals.map(mandal => (
                                            <option key={mandal.id} value={mandal.mandal}>
                                                {mandal.mandal}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.mandal}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                                    
                            {/* <Form.Group as={Row} controlId="gp">
                                <Form.Label column sm={3}>
                                    Village/GP <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.gp'
                                        value={formData.emp.gp}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.gp}
                                    >
                                        <option value="">Select Village/GP</option>
                                        {villages.map(village => (
                                            <option key={village.id} value={village.village}>
                                                {village.village}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.gp}</Form.Control.Feedback>
                                </Col>
                            </Form.Group> */}
                            <Form.Group as={Row} controlId="doj">
                                <Form.Label column sm={3}>Date of Joining <span className='chukkas'>*</span></Form.Label>
                                <Col sm={9}>
                                <Form.Control
                                                    type="date"
                                                    name='emp.doj'
                                                    value={formData.emp.doj}
                                                    onChange={handleFormChange}
                                                    isInvalid={!!errors.doj}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.doj}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="workLocation">
                                <Form.Label column sm={3}>Work Location <span className='chukkas'>*</span></Form.Label>
                                <Col sm={9}>
                                <Form.Control
                                                    type="text"
                                                    name='emp.workLocation'
                                                    value={formData.emp.workLocation}
                                                    onChange={handleFormChange}
                                                    isInvalid={!!errors.workLocation}
                                                />
                                                <Form.Control.Feedback type="invalid">{errors.workLocation}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            {/* Designation Dropdown */}
                            <Form.Group as={Row} controlId="designation">
                                <Form.Label column sm={3}>
                                    Designation <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.designation'
                                        value={formData.emp.designation}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.designation}
                                        className="custom-selectt custom-selectt-containerr"
                                    >
                                        <option value="">Select Designation</option>
                                        {designations.map(designation => (
                                            <option key={designation.id} value={designation.listItem}>
                                                {designation.listItem}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.designation}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                                    
                            {/* Role Dropdown */}
                            <Form.Group as={Row} controlId="role">
                                <Form.Label column sm={3}>
                                    Role <span className='chukkas'>*</span>
                                </Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='emp.role'
                                        value={formData.emp.role}
                                        onChange={handleFormChange}
                                        isInvalid={!!errors.role}
                                        className="custom-selectt custom-selectt-containerr"
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.listItem}>
                                                {role.listItem}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.role}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>                                   
                            <Form.Group as={Row} controlId="managerName">
                                    <Form.Label column sm={3}>Reporting Manager</Form.Label>
                                    <Col sm={9}>
                                        <Form.Control
                                            type="text"
                                            name="managerName"
                                            onClick={() => setShowManagerModal(true)} // Open modal on click
                                            value={finalManager?.empName || ''} // Display confirmed manager's name
                                            readOnly // Make the field readonly
                                            isInvalid={!!errors.managerName}
                                            placeholder='Select Manager'
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.managerName}
                                        </Form.Control.Feedback>
                                    </Col>
                                </Form.Group>

                                {/* Modal for manager selection */}
                                <Modal show={showManagerModal} onHide={() => setShowManagerModal(false)} size="lg" centered>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Select Reporting Manager</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        {/* Search input */}
                                        <Form.Control
                                            type="text"
                                            placeholder="Search managers..."
                                            value={managerSearchTerm}
                                            onChange={(e) => setManagerSearchTerm(e.target.value)}
                                        />
                                        {/* Table to display managers */}
                                        <Table striped bordered hover>
                                            <thead className="table-header-white"> {/* Add a class to style the header */}
                                                <tr>
                                                    <th>Select</th> {/* For circle selection */}
                                                    <th>Employee ID</th>
                                                    <th>Employee Name</th>
                                                    <th>Phone</th>
                                                    <th>Designation</th>
                                                    <th>Package</th>
                                                    <th>Work Location</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedManagersList.map((manager) => (
                                                    <tr key={manager.id}>
                                                        <td>
                                                            {/* Checkmark selection icon */}
                                                            {chosenManager?.id === manager.id ? (
                                                                <FaCheck
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: 'green', // Highlight selected manager with a green checkmark
                                                                    }}
                                                                />
                                                            ) : (
                                                                <FaCircle
                                                                    onClick={() => handleManagerSelection(manager)} // Set selected manager
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: 'gray', // Default color for unselected
                                                                    }}
                                                                />
                                                            )}
                                                        </td>
                                                        <td>{manager.empId}</td>
                                                        <td>{manager.empName}</td>
                                                        <td>{manager.phone}</td>
                                                        <td>{manager.designation}</td>
                                                        <td>{manager.userPackage}</td>
                                                        <td>{manager.workLocation}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                            
                                        {/* Pagination Component */}
                                        <div className='managerTablePagenation'>
                                            <Pagination className="justify-content-start">
                                                <Pagination.Prev
                                                    disabled={managerPage === 1}
                                                    onClick={() => handleManagerPageChange(managerPage - 1)}
                                                />
                                                {Array.from({ length: totalManagerPages }).map((_, index) => (
                                                    <Pagination.Item
                                                        key={index}
                                                        active={managerPage === index + 1}
                                                        onClick={() => handleManagerPageChange(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </Pagination.Item>
                                                ))}
                                                <Pagination.Next
                                                    disabled={managerPage === totalManagerPages}
                                                    onClick={() => handleManagerPageChange(managerPage + 1)}
                                                />
                                            </Pagination>
                                        </div>
                                            
                                        {/* Confirm Selection Button */}
                                        <Button
                                            variant="primary"
                                            className="mt-3"
                                            onClick={handleConfirmManagerSelection}
                                            disabled={!chosenManager} // Disable if no manager is selected
                                        >
                                            Confirm Selection
                                        </Button>
                                    </Modal.Body>
                                </Modal>

                            <Form.Group as={Row} controlId="manager">
                                <Col sm={{ span: 9, offset: 3 }}>
                                    <Form.Check type="checkbox" name='manager' label="Is Manager" checked={formData.emp.manager} onChange={handleFormChange} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="isFRTMember">
                                <Col sm={{ span: 9, offset: 3 }}>
                                    <Form.Check type="checkbox" name='isFRTMember' label="Is FRT Member" checked={formData.emp.isFRTMember} onChange={handleFormChange} />
                                </Col>
                            </Form.Group>
                        </div>

                        <div className="form-section">
                            <center><h5 className='empl-create-headings'>Employee Vehicle Details</h5></center>
                            <Form.Group as={Row} controlId="vehicleName">
                                <Form.Label column sm={3}>Vehicle Name</Form.Label>
                                <Col sm={9}>
                                <Form.Control
                                                        type="tel"
                                                        name='vehicleName'
                                                        value={formData.vehicleInfoDto[0].vehicleName}
                                                        onChange={(e) => {
                                                            const updatedVehicleName = { ...formData.vehicleInfoDto[0], vehicleName: e.target.value };
                                                            setFormData({ ...formData, vehicleInfoDto: [updatedVehicleName] });
                                                        }}
                                                        isInvalid={!!errors1.vehicleName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors1.vehicleName}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="vehicleMake">
                                <Form.Label column sm={3}>Vehicle Make</Form.Label>
                                <Col sm={9}>
                                <Form.Control
                                                        type="tel"
                                                        name='vehicleMake'
                                                        value={formData.vehicleInfoDto[0].vehicleMake}
                                                        onChange={(e) => {
                                                            const updatedVehicleMake = { ...formData.vehicleInfoDto[0], vehicleMake: e.target.value };
                                                            setFormData({ ...formData, vehicleInfoDto: [updatedVehicleMake] });
                                                        }}
                                                        isInvalid={!!errors1.vehicleMake}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors1.vehicleMake}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="vehicleType">
                                <Form.Label column sm={3}>Vehicle Type</Form.Label>
                                <Col sm={9}>
                                    <Form.Control
                                        as="select"
                                        name='vehicleType'
                                        value={formData.vehicleInfoDto[0].vehicleType}
                                        onChange={handleVehicleTypeChange}
                                        isInvalid={!!errors.vehicleType}
                                        className="custom-selectt custom-selectt-containerr"
                                    >
                                        <option value="">Select Vehicle Type</option>
                                        {vehicleTypes.map(vehicleType => (
                                            <option key={vehicleType.id} value={vehicleType.listItem}>
                                                {vehicleType.listItem}
                                            </option>
                                        ))}
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.vehicleType}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="regNo">
                                <Form.Label column sm={3}>Registration Number</Form.Label>
                                <Col sm={9}>
                                <Form.Control
                                                        type="tel"
                                                        name='regNo'
                                                        value={formData.vehicleInfoDto[0].regNo}
                                                        onChange={(e) => {
                                                            const updatedRegNo = { ...formData.vehicleInfoDto[0], regNo: e.target.value };
                                                            setFormData({ ...formData, vehicleInfoDto: [updatedRegNo] });
                                                        }}
                                                        isInvalid={!!errors1.regNo}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{errors1.regNo}</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        </div>
                        <div className='submit-cance'> <center>
                        <Button className="submit-btn" type="submit">Update Employee</Button> &nbsp;
                        <Button className="cancel-btn" type="button" onClick={() => {navigate('/employees')}}>Cancel</Button>
                        </center>
                    
                        </div>
                    </Form>
                </div>
        </div>
    );
};

export default ManagerEmployeeUpdate;