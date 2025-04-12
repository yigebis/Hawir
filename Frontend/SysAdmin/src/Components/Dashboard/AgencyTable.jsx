import React from "react";

const AgencyTable = () => {
  const dummyAgencies = [
    { id: 1, name: "City Metro", location: "New York" },
    { id: 2, name: "GreenLine Transit", location: "San Francisco" },
    { id: 3, name: "FastMove Express", location: "Chicago" },
  ];

  return (
    <table className="agency-table">
      <thead>
        <tr>
          <th>Agency Name</th>
          <th>Location</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {dummyAgencies.map((agency) => (
          <tr key={agency.id}>
            <td>{agency.name}</td>
            <td>{agency.location}</td>
            <td>
              <button className="edit-btn">Edit</button>
              <button className="delete-btn">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AgencyTable;
