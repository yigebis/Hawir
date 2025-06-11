import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../api/api";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`${API_BASE_URL}/event/${id}`);
      const data = await res.json();
      setEvent(data);
    };
    fetchEvent();
  }, [id]);

  if (!event) return <div>Loading...</div>;

  return (
    <div className="event-details-page">
      <h2>{event.title || event.name}</h2>
      <img
        src={event.imageUrl || event.image || "/placeholder.jpg"}
        alt={event.title || event.name}
        style={{ maxWidth: "300px" }}
      />
      <p>
        <strong>Description:</strong> {event.description || event.desc}
      </p>
      <p>
        <strong>Date:</strong>{" "}
        {event.date ? new Date(event.date).toLocaleDateString() : "N/A"}
      </p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default EventDetails;
