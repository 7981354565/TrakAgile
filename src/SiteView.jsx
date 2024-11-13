import React from 'react';
import './SiteView.css';
import { useLocation, useNavigate } from 'react-router-dom';

const SiteView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { site } = location.state || {};

  return (
    <div className='site-page'>
      <div className='empl-create-headings'>
        <center><h5>Site Information</h5></center>
      </div>
      <div className='d-flex justify-content-between'>
        <div>
          <div className='p-1'><strong>Site Name :</strong> {site?.siteName || 'N/A'}</div>
          <div className='p-1'><strong>Type :</strong> {site?.subType || 'N/A'}</div> {/* Adjusted based on the response */}
          <div className='p-1'><strong>LGD Code :</strong> {site?.lgdCode || 'N/A'}</div>
          <div className='p-1'><strong>Mandal :</strong> {site?.mandal || 'N/A'}</div>
          <div className='p-1'><strong>District :</strong> {site?.district || 'N/A'}</div>
        </div>
      </div>

      <div className='empl-create-headings'>
        <center><h5>Contact Information</h5></center>
      </div>
      {site?.siteCOntactInfoDto && site.siteCOntactInfoDto.length > 0 ? (
        site.siteCOntactInfoDto.map((contact, contactIndex) => (
          <div key={contactIndex} className='contact-details border p-2 mb-4'>
            <strong>Name:</strong> {contact.name || 'N/A'}<br />
            <strong>Designation:</strong> {contact.designation || 'N/A'}<br />
            <strong>Phone:</strong> {contact.phone || 'N/A'}
          </div>
        ))
      ) : (
        <div>No contacts available</div>
      )}

      <div className='button-div'>
        <button className='button' onClick={() => navigate('/sites')}>
          Back
        </button>
      </div>
    </div>
  );
}

export default SiteView;
