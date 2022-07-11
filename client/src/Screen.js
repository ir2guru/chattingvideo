import React, { useRef, useEffect, useState, PureComponent } from "react";
import { Redirect } from 'react-router-dom';
import { v1 as uuid } from "uuid";

let myName  = '';
let jsonObj ='{}';
const Screen = (props) => {
    const [searchResponse, setSearchResponse] = useState([]);
    const[invalue, setinvalue] = useState(0);
    const[roomString, setRoomString] = useState("");
    
    useEffect(() => {

      // fetch('https://oaoimmigration.com/vauth/getroom.php?passcode=wn7k1iDyfZo')
      //   .then(response => response.json())
      //   .then(data => setSearchResponse(data));
      //   console.log("rOOM :", searchResponse);
        
        fetch(`https://netsend.pw/getroom.php?passcode=${props.match.params.Request}`)
        .then((r) => r.text())
        .then(text  => {
            myName = text;
          console.log(text);

          const jsonStr = myName;
          jsonObj = JSON.parse(jsonStr);
          console.log(jsonObj); // {name: 'Infinitbility', gender: 'male'}
          setRoomString(jsonObj.roomid);
          console.log("My Key :",jsonObj.roomid);
          console.log("My passcode :",jsonObj.message);
          setinvalue(jsonObj.status);
          console.log("Status :",jsonObj.status);
        });
 console.log("Name :",myName);
    }, []);

if(jsonObj.status === 1){
  return <Redirect to={`../room/${roomString}`} />
}  
else{
  return (
    <div >{JSON.stringify(jsonObj)}</div>
 );
}


}

export default Screen;