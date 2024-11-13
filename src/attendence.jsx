import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Form, Button, Table, Container, Row, Col, Pagination, Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import TravelAttendence from './TravelAttendence';
import { FaFileExcel, FaSearch, FaArrowLeft } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './attendence.css';

const AttendancePage = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [showAttendence, setShowAttendence] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // Format date to yyyy-mm-dd
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Fetch attendance data based on search parameters
 // Fetch attendance data based on search parameters
// Fetch attendance data based on search parameters
const handleSearch = async () => {
  try {
    const params = {};
    if (name) params.username = name; // Adjust this if your backend requires a different key
    if (date) params.date = formatDate(date);

    console.log("Fetching attendance data with params:", params); // Debugging log

    const response = await axios.get("http://68.183.86.1:8080/trackagile/attendence/all-loc", { params });

    console.log("Response from API:", response.data); // Debugging log

    if (response.data && response.data.status === "OK" && Array.isArray(response.data.data)) {
      const allData = response.data.data.map(record => ({
        id: record.id,
        name: record.empName || "N/A",
        date: formatDate(record.date) || "N/A",
        loginTime: record.logInTime || "N/A",
        logoutTime: record.logoutTime || "N/A",
        mobileNumber: record.username || "N/A",
        status: record.status || "N/A",
      }));

      // Apply frontend filtering based on `name` field if needed
      const filteredByName = name
        ? allData.filter(record => record.name.toLowerCase().includes(name.toLowerCase()))
        : allData;

      setFilteredData(filteredByName);
      setPage(1); // Reset to page 1 on new search
    } else {
      console.error("Unexpected response format:", response.data);
      setFilteredData([]);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setFilteredData([]);
  }
};


  // Function to fetch all attendance data initially using useCallback
  const fetchAttendanceData = useCallback(async () => {
    try {
      const response = await axios.get("http://68.183.86.1:8080/trackagile/attendence/all-loc");
      if (response.data && response.data.status === "OK" && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map(record => ({
          id: record.id, // Ensure attendanceId is available
          name: record.empName || "N/A",
          date: formatDate(record.date) || "N/A",
          loginTime: record.logInTime || "N/A",
          logoutTime: record.logoutTime || "N/A",
          mobileNumber: record.username || "N/A",
          status: record.status || "N/A",
        }));
        setFilteredData(formattedData);
      } else {
        console.error("Unexpected response format:", response.data);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setFilteredData([]);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData(); // Fetch all data initially
  }, [fetchAttendanceData]);

  // Handle view click - fetch detailed data based on the selected record's id
  const handleViewClick = async (record) => {
    try {
      const response = await axios.get(`http://68.183.86.1:8080/trackagile/attendence/patroler/${record.id}`);
      if (response.data && response.data.status === "OK") {
        setSelectedRecord(response.data.data); // Set the fetched data as selected record
        setShowAttendence(true); // Show the detailed view
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching detailed data:", error);
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    setShowAttendence(false);
    setSelectedRecord(null);
  };

  const [page, setPage] = useState(1);
  const [recordsPerPage] = useState(8);
  
  const startIndex = (page - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredData.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const maxPagesToShow = 5;
  const [pageGroup, setPageGroup] = useState(0); // Tracks the group of 5 pages shown
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const handlePreviousGroup = () => {
    setPageGroup((prev) => Math.max(prev - 1, 0));
    setPage(pageGroup * maxPagesToShow); // Reset to the first page in the new group
  };
  
  const handleNextGroup = () => {
    setPageGroup((prev) => Math.min(prev + 1, Math.floor(totalPages / maxPagesToShow)));
    setPage(pageGroup * maxPagesToShow + 1); // Reset to the first page in the new group
  };
  
  const startPage = pageGroup * maxPagesToShow + 1;
  const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  // Export to Excel Functionality
  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Data");

    // Create a buffer and save it as an Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "AttendanceData.xlsx");
  };

  return (
    <Container className="travelAttendence AttendancePage" style={{ padding: "20px" }}>
      {showAttendence && selectedRecord ? (
        <>
          <div className="back-button-div">
          <Button variant="secondary" className="back-button" onClick={handleBackClick}>
            <FaArrowLeft /> Back
          </Button>
          </div>
          <TravelAttendence record={selectedRecord} />
        </>
      ) : (
        <>
          <Form>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="formName" className="d-flex align-items-center">
                  <Form.Label className="mr-1 mb-0 lablesNames">Name </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="formDate" className="d-flex align-items-center">
                  <Form.Label className="mr-1 mb-0 lablesNames">Date </Form.Label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="primary" onClick={handleSearch}>
                  Search <FaSearch />
                </Button>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button variant="secondary" className="ExportToExcel alignment" onClick={handleExportToExcel}>
                  Export to Excel <FaFileExcel />
                </Button>
              </Col>
            </Row>
          </Form>

          <Table striped bordered hover responsive className="tableFirstRow">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Date</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Status</th>
                <th>View Details</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.name}</td>
                    <td>{record.mobileNumber}</td>
                    <td>{record.date}</td>
                    <td>{record.loginTime}</td>
                    <td>{record.logoutTime}</td>
                    <td>{record.status}</td>
                    <td>
                      <Button variant="link" onClick={() => handleViewClick(record)}>
                        <FontAwesomeIcon icon={faEye} /> View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No records found.</td>
                </tr>
              )}
            </tbody>
          </Table>
          <div className="pagenation">
            {filteredData.length > recordsPerPage && (
              <Pagination className="justify-content-center">
                <Pagination.Prev
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                />

                {pageGroup > 0 && (
                  <Pagination.Item onClick={handlePreviousGroup}>{"<< Previous 5"}</Pagination.Item>
                )}

                {pages.map((pageNumber) => (
                  <Pagination.Item
                    key={pageNumber}
                    active={pageNumber === page}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Pagination.Item>
                ))}

                {pageGroup < Math.floor(totalPages / maxPagesToShow) && (
                  <Pagination.Item onClick={handleNextGroup}>{"Next 5 >>"}</Pagination.Item>
                )}

                <Pagination.Next
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                />
              </Pagination>
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default AttendancePage;