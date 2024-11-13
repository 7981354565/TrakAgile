import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Row, Col, Table, Modal } from 'react-bootstrap';
import { Pagination } from 'react-bootstrap'; // Ensure Pagination is imported
import { FaUser, FaFileExcel, FaSearch, FaEye, FaCircle, FaCheck } from 'react-icons/fa';
import { BiSolidPencil } from "react-icons/bi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { Link } from 'react-router-dom';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { Plus } from 'react-bootstrap-icons';
import { Pencil, Trash } from 'react-bootstrap-icons'; // Import icons for edit and delete
import EmplyRoute from './EmplyRoute';
import './employees.css';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const EmployeePage = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchParams, setSearchParams] = useState({ name: '', designation: '' });
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Holds employee details
    const [routePoints, setRoutePoints] = useState([]); // Holds route data
    const [mapCenter, setMapCenter] = useState([0, 0]); // Map center coordinates
    const [isMapVisible, setIsMapVisible] = useState(false); // Controls map visibility

    const handleMapIconClick = (empId, type) => {
        console.log(empId);
        fetch(`http://68.183.86.1:8080/trackagile/attendence/getAttendence/${empId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.status === 'OK' && data.data.length > 0) {
                    const attendanceRecord = data.data[0]; // Take the first record from the array
    
                    if (type === 'location') {
                        const { lastLocX, lastLocY } = attendanceRecord;
    
                        if (lastLocX && lastLocY) {
                            // Ensure lastLocX and lastLocY are used correctly
                            setSelectedEmployee({
                                lastLocX,
                                lastLocY,
                            });
                            setRoutePoints([]); // Clear route points when showing only the location
                            setMapCenter([lastLocY, lastLocX]); // Set the center to [longitude, latitude]
                            setIsMapVisible(true); // Show map
                        } else {
                            console.error('Location data not available for this employee');
                        }
                    } else if (type === 'route') {
                        const { pointWkt, lastLocX, lastLocY } = attendanceRecord;
    
                        if (pointWkt) {
                            // Parse the MULTIPOINT WKT string to extract coordinates
                            const points = pointWkt
                                .replace('MULTIPOINT ((', '')
                                .replace('))', '')
                                .split('), (')
                                .map((point) => point.split(' ').map(Number));
    
                            setRoutePoints(points); // Set the points as the route
                            setSelectedEmployee({
                                lastLocX,
                                lastLocY,
                            });
                            setMapCenter([lastLocY, lastLocX]); // Update map center to the last location
                            setIsMapVisible(true); // Show map
                        } else {
                            console.error('Route data not available for this employee');
                        }
                    }
                } else {
                    console.error('No attendance records found for this employee');
                }
            })
            .catch((error) => console.error('Error fetching attendance data:', error));
    };      
   
    const [formData, setFormData] = useState({
        emp : {
            empName: '',
            empId: '',
            bloodGroup: '',
            licenceNo: '',
            address: '', 
            empAddress: '',
            country: '',
            countryState: '',
            userPackage: '',
            zonal: '',
            district: '',   
            mandal: '',
            // gp : '',  
            email: '',
            role: '',
            empFatherName: '',
            dob: '',
            doj: '',
            designation: '',
            managerName: '',
            phone: '',
            aadhar: '',
            pan: '',
            manager: '',
            workLocation: '',
            frtTeam: false
        },
        empEmergencyDto: [
            {
                name: '',
                phone: '',
                email: '',
                relation: ''
            }
        ],
        vehicleInfoDto: [
            {
                vehicleName: '',
                vehicleMake: '',
                vehicleType: '',
                regNo: '',
                empId: ''
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
                        setFormData((prev) => ({ ...prev,countryState: '', userPackage: '', zonal: '', district: '', mandal: '' }));
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
                        setFormData((prev) => ({ ...prev, userPackage: '', zonal: '', district: '', mandal: ''}));
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
                        setFormData((prev) => ({ ...prev, zonal: '', district: '', mandal: ''}));
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
                        setFormData((prev) => ({ ...prev, district: '', mandal: ''}));
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
                        setFormData((prev) => ({ ...prev, mandal: ''}));
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


        // const handleFormChange = (event) => {
        //     const { name, value } = event.target;
        //     setFormData((prevData) => ({
        //         ...prevData,
        //         [name]: value,
        //     }));
        //     // Reset error for the changed field
        //     setErrors((prevErrors) => ({
        //         ...prevErrors,
        //         [name]: '', // Resetting the specific error
        //     }));
        // };

        const [photo, setPhoto] = useState(null); // State for the image file
        const [photoPreview, setPhotoPreview] = useState(null); // State for the image preview URL
        const [inputValues, setInputValues] = useState({ name: '', designation: '' }); // Temporary input values
        // const [errors, setErrors] = useState({});
        const [contacts1, setContacts1] = useState([]);
        const [errors1, setErrors1] = useState({});
        const [showForm1, setShowForm1] = useState(false);
        const [showTable, setShowTable] = useState(false);

        useEffect(() => {
            fetchEmployees();
        }, []);

        useEffect(() => {
            filterEmployees();
        }, [searchParams, employees]);

        const fetchEmployees = async () => {
            try {
                const response = await axios.get('http://68.183.86.1:8080/trackagile/employee/all');
                const employeesData = response.data.data.map(empDto => ({
                    ...empDto.emp,                  // Spread employee details from emp object
                    vehicleInfoDto: empDto.vehicleInfoDto, // Keep vehicle info (not displayed)
                    empEmergencyDto: empDto.empEmergencyDto // Keep emergency contact info (not displayed)
                }));
                setEmployees(employeesData || []);
                console.log(employeesData || []);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        const filterEmployees = () => {
            const { name, designation } = searchParams;
            const filtered = employees.filter((employee) => {
                const empName = employee.empName ? employee.empName.toLowerCase() : '';
                const empDesignation = employee.designation ? employee.designation.toLowerCase() : '';
                const searchName = name.toLowerCase();
                const searchDesignation = designation.toLowerCase();

                return (
                    empName.includes(searchName) &&
                    empDesignation.includes(searchDesignation)
                );
            });
            setFilteredEmployees(filtered);
        };

        const handleInputChange = (e) => {
            const { id, value } = e.target;
            setInputValues({ ...inputValues, [id]: value });
        };
    
        // Handle the search button click to update searchParams
        const handleSearch1 = () => {
            setSearchParams({
                name: inputValues.name,
                designation: inputValues.designation,
            });
            
            // For debugging, log the search parameters
            console.log("Search Params Submitted:", searchParams);
            
            // You can add any logic for fetching employees based on searchParams here.
        };

        const handleFormChange = (e) => {
            const { name, value } = e.target;
            
            setFormData((prevFormData) => ({
                ...prevFormData,
                emp: {
                    ...prevFormData.emp,
                    [name]: value // Dynamically update the `emp` fields like `managerName`
                }
            }));
        };        
        
        const handlePhotoUpload = (e) => {
            const file = e.target.files[0];
            if (file) {
                setPhoto(file);  // Store the file in state
                setPhotoPreview(URL.createObjectURL(file));  // Create a preview URL
            }
        };

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
                // Create FormData to handle file and other form fields
                const formDataToSend = new FormData();
                
                // Append employee data directly from formData
                formDataToSend.append('empDTo', JSON.stringify({
                    emp: formData.emp,
                    empEmergencyDto: formData.empEmergencyDto,
                    vehicleInfoDto: formData.vehicleInfoDto // Get vehicle info from formData directly
                }));
            
                // Append the selected photo
                if (photo) {
                    formDataToSend.append('file', photo); // Append the photo if uploaded
                }
            
                try {
                    const response = await axios.post('http://68.183.86.1:8080/trackagile/employee/create', formDataToSend, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                
                    setShowForm(false);  // Close form after submission
                    
                    fetchEmployees();  // Fetch updated employee data after submission
                    alert('Employee added successfully');
                    console.log('Server response:', response.data);
                } catch (error) {
                    console.error('Error adding employee:', error);
                    alert('Failed to add employee. Please try again.');
                }
            } else {
                alert('Please fill in all mandatory fields.');
            }
        
            // Reset form and errors
            setFormData({
                emp : {
                    empName: '',
                    empId: '',
                    email: '',
                    role: '',
                    empFatherName: '',
                    dob: '',
                    doj: '',
                    bloodGroup: '',
                    designation: '',
                    licenceNo: '',
                    managerName: '',
                    phone: '',
                    aadhar: '',
                    country: '',
                    district: '',
                    // gp: '',
                    mandal: '',
                    empAddress: '',
                    address: '',
                    countryState: '',
                    zonal: '',
                    pan: '',
                    manager: '',
                    userPackage: '',
                    workLocation: '',
                    frtTeam: false
                },
                empEmergencyDto: [{
                    name: '',
                    phone: '',
                    email: '',
                    relation: ''
                }],
                vehicleInfoDto: [{
                    vehicleName: '',
                    vehicleMake: '',
                    vehicleType: '',
                    regNo: '',
                    empId: ''
                }]
            });
        
            setErrors({});
            setContacts1([]);  // Reset contacts array
        };        
    
        // const validateForm1 = () => {
        //     let formErrors = {};
        //     const contact = formData.empEmergencyDto[0];
        //     if (!contact.name) formErrors.name = 'Name is required';
        //     if (!contact.phone) formErrors.phone = 'Phone number is required';
        //     return formErrors;
        // };

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


        const handleChange = (e) => {
            const { name, value } = e.target;
        
            // Update the specific field in empEmergencyDto[0]
            const updatedContact = { ...formData.empEmergencyDto[0], [name]: value };
        
            // Update the formData state with the new contact details
            setFormData(prevState => ({
                ...prevState,
                empEmergencyDto: [updatedContact],
            }));
        };


        const handleAddClick = () => {
            setShowForm1(true);
        };

        const handleCancel1 = () => {
            setShowForm1(false);
            setErrors1({});
        };

        const handleCancel = () => {
            setShowForm(false);
            setFormData({
                emp : {
                    empName: '',
                    empId: '',
                    email: '',
                    role: '',
                    empFatherName: '',
                    dob: '',
                    doj: '',
                    bloodGroup: '',
                    designation: '',
                    licenceNo: '',
                    managerName: '',
                    phone: '',
                    aadhar: '',
                    country: '',
                    district: '',
                    // gp: '',
                    mandal: '',
                    countryState: '',
                    zonal: '',
                    pan: '',
                    manager: '',
                    userPackage: '',
                    workLocation: '',
                    frtTeam: false
                },
            empEmergencyDto: [
                {
                    name: '',
                    phone: '',
                    email: '',
                    relation: ''
                }
            ],
            vehicleInfoDto: [
                {
                    vehicleName: '',
                    vehicleMake: '',
                    vehicleType: '',
                    regNo: '',
                    empId: ''
                }
            ]

            });
            setErrors({});
            setContacts1([]);  // Optionally clear any validation errors
        };
    
        const [currentPage, setCurrentPage] = useState(1);
        const [recordsPerPage] = useState(10); // Number of records per page

        // Calculate total pages
        const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

        // Calculate start and end indices for pagination
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

        // Handle page change
        const handlePageChange = (pageNumber) => {
          setCurrentPage(pageNumber);
        };

        const navigate= useNavigate();

        const [showModal, setShowModal] = useState(false); // For modal control
        const [newImage, setNewImage] = useState(null); // For storing the uploaded image
        const [imagePreview, setImagePreview] = useState(''); // For displaying image preview
      
        // Function to handle image upload
        const handleImageUpload = async () => {
            if (newImage && selectedEmployee) {
              const formData = new FormData();
              formData.append('file', newImage); // Append the new image
            
              try {
                // Call the Spring Boot API to upload the image for the selected employee
                await axios.post(`http://68.183.86.1:8080/trackagile/employee/update-image/${selectedEmployee.id}`, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                });

                // Success handling
                alert('Image uploaded successfully!');
                setShowModal(false); // Close modal after successful upload
                setNewImage(null); // Reset the image state
                setImagePreview(''); // Clear the image preview
              } catch (error) {
                // Improved error handling: Log the full error response
                console.error('Error uploading image:', error.response || error.message || error);
                alert('Failed to upload the image. Please try again.');
              }
            } else {
              alert('Please select an image first.');
            }
          };

          // Function to handle image selection and preview generation
          const handleImageChange = (e) => {
            const file = e.target.files[0]; // Get the selected file
            if (file) {
              setNewImage(file); // Save the selected image to state
              setImagePreview(URL.createObjectURL(file)); // Create and set the preview URL for the image
            } else {
              alert('No file selected.');
            }
          };

        const handleExportToExcel = () => {
            if (!Array.isArray(employees) || employees.length === 0) {
                console.error("No employees data to export.");
                return; // Prevent exporting if no data
            }
        
            try {
                // Create a worksheet from the employees data
                const ws = XLSX.utils.json_to_sheet(employees);
        
                // Create a new workbook
                const wb = XLSX.utils.book_new();
        
                // Append the worksheet to the workbook
                XLSX.utils.book_append_sheet(wb, ws, "Employees");
        
                // Export the workbook to a file
                XLSX.writeFile(wb, "employees.xlsx");
            } catch (error) {
                console.error("Error exporting to Excel:", error);
            }
        };
    
    return (
        <div className="employee-page">
            {!showForm && (
                <>
                    <header className="employee-main-page">
                        <Button className="create-employee-btnn" onClick={() => setShowForm(true)}>
                            <FaUser /> Create Employee
                        </Button>
                        <Button className="export-btn" onClick={handleExportToExcel}>
                        <FaFileExcel /> Export to Excel
                        </Button>
                    </header>

                    <div className="search-section">
                        <div className='empl-details'>
                            <center>
                                <h5>Employee Details</h5>
                            </center>
                        </div>
                        <Form className='main-form'>
                            <Row>
                                {/* Name Input */}
                                <Form.Label htmlFor='name' column sm="1">
                                    Name <span className='chukkas'>*</span>
                                </Form.Label>
                                <div className="col-4">
                                    <Form.Control 
                                        type="text" 
                                        id='name' 
                                        placeholder='Enter Name' 
                                        className='search-input' 
                                        value={inputValues.name} // Update value from inputValues
                                        onChange={handleInputChange} // Track input changes
                                        required 
                                    />
                                </div>

                                {/* Designation Select */}
                                <Form.Label htmlFor='designation' column sm="1">
                                    Designation
                                </Form.Label>
                                <div className="col-4">
                                    <Form.Control 
                                        as="select" 
                                        id="designation" 
                                        value={inputValues.designation} // Update value from inputValues
                                        onChange={handleInputChange} // Track input changes
                                        className='search-input custom-selectt custom-selectt-containerr'
                                    >
                                        <option value="">Select Designation</option>
                                        {designations.map(designation => (
                                            <option key={designation.id} value={designation.listItem}>
                                                {designation.listItem}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </div>
                                    
                                {/* Search Button */}
                                <Col sm={2}>
                                    <Button 
                                        className="search-btn search-input" 
                                        onClick={handleSearch1} // Trigger search on button click
                                    >
                                        Search <FaSearch />
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className="employee-table">
                    <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Actions</th>
                            <th>Image</th>
                            <th>Emp_Id</th>
                            <th>Name</th>
                            <th>Mobile Number</th>
                            <th>Designation</th>
                            <th>Package</th>
                            <th>Zone</th>
                            <th>Work Location</th>
                            <th>Current Location</th>
                            <th>Employee Path</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.isArray(paginatedEmployees) ? paginatedEmployees.map((employee) => (
                            <tr key={employee.id}>
                              <td>
                                <center>
                                  <Button variant="link" className='view-icons' onClick={() => {
                                    navigate("/employee-update", { state: { employee } });
                                  }}>
                                    <BiSolidPencil />
                                  </Button> &nbsp; &nbsp;
                                  <Button variant='link' className='view-icons'>
                                    <FaEye onClick={() => {
                                      navigate("/employeeview", { state: { employee } });
                                    }} />
                                  </Button>
                                </center>
                              </td>
                              <td>
                                <img 
                                  className='circular-image' 
                                  src={employee.profilePicUrl} 
                                  alt="Employee" 
                                  width="50" 
                                  height="50" 
                                  onClick={() => {
                                    setSelectedEmployee(employee); 
                                    setShowModal(true); // Open modal
                                    setImagePreview(employee.profilePicUrl); // Set initial image preview
                                  }} 
                                />
                              </td>
                              <td>{employee.empId}</td>
                              <td>{employee.empName}</td>
                              <td>{employee.phone}</td>
                              <td>{employee.designation}</td>
                              <td>{employee.userPackage}</td>
                              <td>{employee.zonal}</td>
                              <td>{employee.workLocation}</td>
                              <td>
                                <a href="#map" onClick={() => {
                                  handleMapIconClick(employee.id, 'location');
                                  setSelectedEmployee(employee); // Set selected employee for map
                                }}>
                                  <center><FontAwesomeIcon className="mapIcon" icon={faMapMarkerAlt} /></center>
                                </a>
                              </td>
                              <td>
                                <a href="#map" onClick={() => {
                                  handleMapIconClick(employee.id, 'route');
                                  setSelectedEmployee(employee); // Set selected employee for route
                                }}>
                                  <center><FontAwesomeIcon className="mapIcon" icon={faMapMarkerAlt} /></center>
                                </a>
                              </td>
                            </tr>
                          )) : null}
                        </tbody>
                      </table>
                            
                        {/* Modal for showing full-size image and edit option */}
                     {selectedEmployee && (
                       <Modal show={showModal} onHide={() => setShowModal(false)}>
                         <Modal.Header closeButton>
                           <Modal.Title><h5>Edit Employee Image</h5></Modal.Title>
                         </Modal.Header>
                         <Modal.Body>
                           <img 
                             src={imagePreview || selectedEmployee.profilePicUrl} // Display new image preview or default
                             alt="Full-size" 
                             style={{ width: '100%', height: 'auto' }} 
                           />
                           <div style={{ marginTop: '10px', textAlign: 'center' }}>
                             <Button variant="link" onClick={() => document.getElementById('imageUpload').click()}>
                               <BiSolidPencil /> Edit Image
                             </Button>
                             <input 
                               type="file" 
                               id="imageUpload" 
                               style={{ display: 'none' }} 
                               onChange={handleImageChange} // Handle new image selection
                             />
                           </div>
                         </Modal.Body>
                         <Modal.Footer>
                           <Button variant="secondary" onClick={() => setShowModal(false)}>
                             Close
                           </Button>
                           <Button variant="primary" onClick={handleImageUpload}>
                             Upload New Image
                           </Button>
                         </Modal.Footer>
                       </Modal>
                     )}                   
                      <div className='pagenation'>
                    {/* Pagination Component */}
                    <Pagination className="justify-content-start">
                      <Pagination.Prev
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <Pagination.Item
                          key={index}
                          active={currentPage === index + 1}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </Pagination>
                      </div>
                  
                    {/* Employee Route Map */}
                    {selectedEmployee && isMapVisible && (
                      <EmplyRoute
                        lastLocX={selectedEmployee.lastLocX}
                        lastLocY={selectedEmployee.lastLocY}
                        routePoints={routePoints}
                        mapCenter={mapCenter}
                        isMapVisible={isMapVisible}
                        setIsMapVisible={setIsMapVisible}
                      />
                    )}
                </div>
                </>
            )}
            {showForm && (
                <div className="employee-form-container">
                    <Form className="employee-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <center><h5 className='empl-create-headings'>Employee Personal Information</h5></center>
                            <Row>
                            <Col sm={8}>
            <Form.Group as={Row} controlId="empName">
                <Form.Label column sm={4}>Name <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='empName'
                            value={formData.emp.empName}
                            onChange={handleFormChange}
                            isInvalid={!!errors.empName}
                        />
                        <Form.Control.Feedback type="invalid">{errors.empName}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="empId">
                <Form.Label column sm={4}>Employee Id <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='empId'
                            value={formData.emp.empId}
                            onChange={handleFormChange}
                            isInvalid={!!errors.empId}
                        />
                        <Form.Control.Feedback type="invalid">{errors.empId}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="empFatherName">
                <Form.Label column sm={4}>Father's Name <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='empFatherName'
                            value={formData.emp.empFatherName}
                            onChange={handleFormChange}
                            isInvalid={!!errors.empFatherName}
                        />
                        <Form.Control.Feedback type="invalid">{errors.empFatherName}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="dob">
                <Form.Label column sm={4}>Date of Birth <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="date"
                            name='dob'
                            value={formData.emp.dob}
                            onChange={handleFormChange}
                            isInvalid={!!errors.dob}
                        />
                        <Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="aadhar">
                <Form.Label column sm={4}>Aadhar Number <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='aadhar'
                            value={formData.emp.aadhar}
                            onChange={handleFormChange}
                            isInvalid={!!errors.aadhar}
                        />
                        <Form.Control.Feedback type="invalid">{errors.aadhar}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="pan">
                <Form.Label column sm={4}>PAN Number <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='pan'
                            value={formData.emp.pan}
                            onChange={handleFormChange}
                            isInvalid={!!errors.pan}
                        />
                        <Form.Control.Feedback type="invalid">{errors.pan}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="email">
                <Form.Label column sm={4}>Email ID <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="email"
                            name='email'
                            value={formData.emp.email}
                            onChange={handleFormChange}
                            isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="phone">
                <Form.Label column sm={4}>Mobile Number <span className='chukkas'>*</span></Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="tel"
                            name='phone'
                            value={formData.emp.phone}
                            onChange={handleFormChange}
                            isInvalid={!!errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="bloodGroup">
                <Form.Label column sm={4}>Blood Group</Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='bloodGroup'
                            value={formData.emp.bloodGroup}
                            onChange={handleFormChange}
                            isInvalid={!!errors.bloodGroup}
                        />
                        <Form.Control.Feedback type="invalid">{errors.bloodGroup}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="licenceNo">
                <Form.Label column sm={4}>License Number</Form.Label>
                <Col sm={7}>
                    <div className='inputMoving'>
                        <Form.Control
                            type="text"
                            name='licenceNo'
                            value={formData.emp.licenceNo}
                            onChange={handleFormChange}
                            isInvalid={!!errors.licenceNo}
                        />
                        <Form.Control.Feedback type="invalid">{errors.licenceNo}</Form.Control.Feedback>
                    </div>
                </Col>
            </Form.Group>
        </Col> 

        <Col sm={4} className="d-flex align-items-center">
        <div className="photo-upload-container">
                    <div className="photo-circle">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Uploaded Preview" className="photo-preview" />
                        ) : (
                            <p>Preview</p>  // Placeholder before the image is uploaded
                        )}
                    </div>
                    <Form.Group controlId="photoUpload" className="mt-3">
                        <Form.Label>Upload Photo</Form.Label>
                        <Form.Control type="file" onChange={handlePhotoUpload} />
                    </Form.Group>
                </div>
        </Col>
                                <div className="form-section"> <br />
                            <center><h5 className='empl-create-headings'> Personal Address</h5></center>
                            <Form.Group as={Row} controlId="empAddress">
                                <Form.Label column sm={3}>Personal Address </Form.Label>
                                <Col sm={9}>
                                                <Form.Control
                                                    type="text"
                                                    name='empAddress'
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
                          <Button className="btn btn-primary" onClick={handleAddClick}>Add Emergency Contact <Plus/></Button>
                          {showForm1 && (
                            <Form className='contacts-form'>
                              <Row>
                                <Col md={6}>
                                  <Form.Group controlId="contactName">
                                    <Form.Label>Name <span className='chukkas'>*</span></Form.Label>
                                    <Form.Control
                                      type="text"
                                      name='name'
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
                                      name='phone'
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
                                      name='email'
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
                                      name='relation'
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
                            <Table striped bordered hover >
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
                                                    name='address'
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
                                        name='country'
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
                                        name='countryState'
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
                                        name='userPackage'
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
                                        name='zonal'
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
                                        name='district'
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
                                        name='mandal'
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
                                        name='gp'
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
                                                    name='doj'
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
                                                    name='workLocation'
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
                                        name='designation'
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
                                        name='role'
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
                                    <Form.Check type="checkbox" name='manager' label="Is Manager" checked={formData.manager} onChange={handleFormChange} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="isFRTMember">
                                <Col sm={{ span: 9, offset: 3 }}>
                                    <Form.Check type="checkbox" name='isFRTMember' label="Is FRT Member" checked={formData.isFRTMember} onChange={handleFormChange} />
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
                        <Button className="submit-btn" type="submit">Add Employee</Button> &nbsp;
                        <Button className="cancel-btn" type="button" onClick={handleCancel}>Cancel</Button>
                        </center>
                        
                        </div>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default EmployeePage;