import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Pagination from 'react-bootstrap/Pagination';
import { Button, Form } from 'react-bootstrap'; // Import Form for search input
import * as XLSX from 'xlsx'; // Import XLSX for exporting to Excel
import './DashboardCardEmployees.css';
import { FaFileExcel, FaSearch } from 'react-icons/fa'; // Import search icon

const DashboardCardEmployees = () => {
  const location = useLocation();
  const employeeData = location.state?.data || []; // Default to an empty array if data is null or undefined
  const statName = location.state?.statName || 'Employee'; // Default to 'Employee' if statName is not provided

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [filteredEmployees, setFilteredEmployees] = useState(employeeData); // State for filtered employees
  const perPage = 10;

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredEmployees.length / perPage);

  const handleExportToExcel = () => {
    if (!Array.isArray(employeeData) || employeeData.length === 0) {
      console.error("No employee data to export.");
      alert("No employee data available to export.");
      return; 
    }
  
    // Flatten the data if necessary
    const flatData = employeeData.map(employeeObj => {
      const employee = employeeObj.emp || employeeObj; // Access emp if available
      return {
        empId: employee.empId || 'N/A',
        empName: employee.empName || 'N/A',
        phone: employee.phone || 'N/A',
        designation: employee.designation || 'N/A',
        userPackage: employee.userPackage || 'N/A',
        zonal: employee.zonal || 'N/A',
        workLocation: employee.workLocation || 'N/A'
      };
    });
  
    console.log("Flattened Employee Data being exported: ", flatData);
  
    try {
      const ws = XLSX.utils.json_to_sheet(flatData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Employees");
      XLSX.writeFile(wb, "employee_data.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  // Function to handle the search action
  const handleSearch = () => {
    const result = employeeData.filter(employeeObj => {
      const employee = employeeObj.emp || employeeObj;
      return employee.empName.toLowerCase().includes(searchTerm.toLowerCase()); // Search by employee name
    });
    setFilteredEmployees(result);
    setPage(1); // Reset to the first page on search
  };

  return (
    <div className="dashboard-card-employee-container">
      <div className="empl-create-headings">
        <center><h5>{statName} Employee Details</h5></center>
      </div><br />

      {/* Export to Excel Button and Search Input */}
      <div className="export-button-container" style={{ display: 'flex', alignItems: 'center' }}>

        {/* Search Input Box */}
        <div className="search-container" style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
          <Form.Control 
            className='cardEmployeeNameSearch'
            type="text" 
            placeholder="Enter Employee Name" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ width: '200px', display: 'inline-block' }}
          />
          <Button className='cardEmployeeNameSearchIcon' variant="outline-secondary" onClick={handleSearch} style={{ marginLeft: '5px' }}>
            <FaSearch />
          </Button>
        </div>

        <Button className="export-btn" onClick={handleExportToExcel}>
          <FaFileExcel/> Export to Excel
        </Button>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Designation</th>
            <th>Package</th>
            <th>Zone</th>
            <th>Work Location</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.slice(startIndex, endIndex).map((employeeObj, index) => {
              const employee = employeeObj.emp || employeeObj; // Attempt to access emp first, else use employeeObj directly
            
              if (!employee) {
                return (
                  <tr key={index}>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      Employee data missing.
                    </td>
                  </tr>
                );
              }
            
              return (
                <tr key={employee.id}>
                  <td>{employee.empId || 'N/A'}</td>
                  <td>{employee.empName || 'N/A'}</td>
                  <td>{employee.phone || 'N/A'}</td>
                  <td>{employee.designation || 'N/A'}</td>
                  <td>{employee.userPackage || 'N/A'}</td>
                  <td>{employee.zonal || 'N/A'}</td>
                  <td>{employee.workLocation || 'N/A'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                No employee data available.
              </td>
            </tr>
          )}
        </tbody>
      </table> 
      <br />
      <div className='pagenation'>
        {/* Pagination Controls */}
        {filteredEmployees.length > 0 && (
          <Pagination className="justify-content-start">
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            />
            {Array.from({ length: totalPages }).map((_, index) => (
              <Pagination.Item
                key={index}
                active={page === index + 1}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={endIndex >= filteredEmployees.length}
              onClick={() => handlePageChange(page + 1)}
            />
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default DashboardCardEmployees;
