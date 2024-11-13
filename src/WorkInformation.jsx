import React, { useEffect, useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import './WorkInformation.css';

function WorkInformation() {
  const [reportedData, setReportedData] = useState({
    causeCode: '',
    rfo: '',
    remarks: '',
    materialRequired: ''
  });
  const [materialData, setMaterialData] = useState({
    consumed: [],
    removed: []
  });
  const [activeTab, setActiveTab] = useState('consumed');

  // Fetch data from the Spring Boot API when the component mounts
  useEffect(() => {
    fetchReportedData();
    fetchMaterialData();
  }, []);

  const fetchReportedData = async () => {
    // Simulate fetching reported data
    setReportedData({
      causeCode: 'Network Issue',
      rfo: 'Hardware Failure',
      remarks: 'Replacement needed',
      materialRequired: 'Router'
    });
  };

  const fetchMaterialData = async () => {
    // Simulate fetching material data
    setMaterialData({
      consumed: [
        { materialType: 'Cable', count: 10, details: [{ make: 'XYZ', model: 'ABC123', serialNumber: 'C001' }, { make: 'XYZ', model: 'ABC124', serialNumber: 'C002' }, { make: 'XYZ', model: 'ABC125', serialNumber: 'C003' }, { make: 'XYZ', model: 'ABC126', serialNumber: 'C004' }, { make: 'XYZ', model: 'ABC127', serialNumber: 'C005' }] },
        { materialType: 'Router', count: 2, details: [{ make: 'LinkSys', model: 'RT456', serialNumber: 'R002' }, { make: 'LinkSys', model: 'RT457', serialNumber: 'R003' }] },
        { materialType: 'Switch', count: 3, details: [{ make: 'Cisco', model: 'SW789', serialNumber: 'S001' }, { make: 'Cisco', model: 'SW790', serialNumber: 'S002' }, { make: 'Cisco', model: 'SW791', serialNumber: 'S003' }] },
        { materialType: 'Modem', count: 4, details: [{ make: 'Motorola', model: 'MD123', serialNumber: 'M001' }, { make: 'Motorola', model: 'MD124', serialNumber: 'M002' }, { make: 'Motorola', model: 'MD125', serialNumber: 'M003' }, { make: 'Motorola', model: 'MD126', serialNumber: 'M004' }] },
        { materialType: 'Battery', count: 2, details: [{ make: 'Duracell', model: 'BT100', serialNumber: 'B001' }, { make: 'Duracell', model: 'BT101', serialNumber: 'B002' }] }
      ],
      removed: [
        { materialType: 'Switch', count: 5, details: [{ make: 'NetGear', model: 'SW789', serialNumber: 'S003' }, { make: 'NetGear', model: 'SW790', serialNumber: 'S004' }, { make: 'NetGear', model: 'SW791', serialNumber: 'S005' }, { make: 'NetGear', model: 'SW792', serialNumber: 'S006' }, { make: 'NetGear', model: 'SW793', serialNumber: 'S007' }] },
        { materialType: 'Cable', count: 3, details: [{ make: 'Cisco', model: 'CBL900', serialNumber: 'C004' }, { make: 'Cisco', model: 'CBL901', serialNumber: 'C005' }, { make: 'Cisco', model: 'CBL902', serialNumber: 'C006' }] },
        { materialType: 'Battery', count: 2, details: [{ make: 'Eveready', model: 'BT200', serialNumber: 'B003' }, { make: 'Eveready', model: 'BT201', serialNumber: 'B004' }] },
        { materialType: 'Modem', count: 4, details: [{ make: 'Netgear', model: 'MD300', serialNumber: 'M005' }, { make: 'Netgear', model: 'MD301', serialNumber: 'M006' }, { make: 'Netgear', model: 'MD302', serialNumber: 'M007' }, { make: 'Netgear', model: 'MD303', serialNumber: 'M008' }] },
        { materialType: 'Router', count: 2, details: [{ make: 'TP-Link', model: 'RT600', serialNumber: 'R004' }, { make: 'TP-Link', model: 'RT601', serialNumber: 'R005' }] }
      ]
    });
  };  

  const renderMaterialDetails = (materials) => {
    return materials.map((material, index) => (
      <div key={index} className="material-detail-section">
        <div className="material-info">
          <label>Material Type:</label>
          <input type="text" value={material.materialType} readOnly />
          <label>Count:</label>
          <input type="text" value={material.count} readOnly />
        </div>
        <Table striped bordered hover className="material-table">
          <thead>
            <tr>
              <th>Make</th>
              <th>Model</th>
              <th>Serial Number</th>
            </tr>
          </thead>
          <tbody>
            {material.details.map((detail, i) => (
              <tr key={i}>
                <td>{detail.make}</td>
                <td>{detail.model}</td>
                <td>{detail.serialNumber}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ));
  };

  return (
    <div className="work-info-container">
      {/* Reported cause code, RFO, Remarks, Material Required */}
      <div className="reported-section">
        <label>Reported Cause Code :</label>
        <input type="text" value={reportedData.causeCode} readOnly />
        <label>RFO :</label>
        <input type="text" value={reportedData.rfo} readOnly />
        <label>Remarks :</label>
        <input type="text" value={reportedData.remarks} readOnly />
        <label>Material Required :</label>
        <input type="text" value={reportedData.materialRequired} readOnly />
      </div>

      {/* Material Heading */}
      <center><h6 className="materialsHeading">Materials</h6></center> <br />

      {/* Tabs for Consumed and Recovered */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="material-tabs">
        <Tab eventKey="consumed" title="Consumed">
          <div className="material-content">
            {renderMaterialDetails(materialData.consumed)}
          </div>
        </Tab>
        <Tab eventKey="removed" title="Recovered">
          <div className="material-content">
            {renderMaterialDetails(materialData.removed)}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

export default WorkInformation;
