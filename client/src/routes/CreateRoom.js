import React from "react";
import { v1 as uuid } from "uuid";

const CreateRoom = (props) => {
  function create() {
    const id = uuid();
    props.history.push(`/room/${id}`);
  }

  return (
    <button className="create-room-btn" onClick={create}>
      Create Room
    </button>
  );
};

export default CreateRoom;
