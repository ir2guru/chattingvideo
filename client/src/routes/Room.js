import React, { useRef, useEffect, useState, PureComponent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faL, faMicrophone, faPhone } from "@fortawesome/free-solid-svg-icons";
import { faVideoCamera } from "@fortawesome/free-solid-svg-icons";
import { faDesktop } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";

var RoomStatus = "Guest Yet To Join";
var inichiator = false;
const Room = (props) => {
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const userStream = useRef();
  const screenTrack = useRef();
  const senders = useRef([]);
  const [state, setState] = useState(false);
  const [camstate, csetState] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
      //setminute();
      // console.log("GGG :", "jjj");
    }, 1000);

    if (seconds > 10) {
      console.log("GGG :", "jjj");
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;
        MuteAudioStart();

        socketRef.current = io.connect("/");
        socketRef.current.emit("join room", props.match.params.roomID);

        socketRef.current.on("other user", (userID) => {
          callUser(userID);
          inichiator = true;
          RoomStatus = "Guest Yet To Join";
          otherUser.current = userID;
        });

        socketRef.current.on("user joined", (userID) => {
          RoomStatus = "Guest Joined";
          otherUser.current = userID;
        });

        socketRef.current.on("offer", handleRecieveCall);

        socketRef.current.on("answer", handleAnswer);

        socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
      });

    return () => clearInterval(interval);
  }, []);

  if (minutes < 30) {
    if (seconds === 59) {
      setMCounter((minutes) => minutes + 1);
      setSeconds((seconds) => 0);
      console.log("Done :", "True");
    }
  } else {
    EndMyCall();
  }

  function callUser(userID) {
    peerRef.current = createPeer(userID);

    userStream.current
      .getTracks()
      .forEach((track) =>
        senders.current.push(
          peerRef.current.addTrack(track, userStream.current)
        )
      );
  }

  function createPeer(userID) {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.netsend.pw:19302",
        },
        {
          urls: "turn:turn.netsend.pw",
          credential: "Ejikerichard234@",
          username: "ejikerichard",
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    peer.ontrack = handleTrackEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  }

  function handleNegotiationNeededEvent(userID) {
    peerRef.current
      .createOffer()
      .then((offer) => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("offer", payload);
      })
      .catch((e) => console.log(e));
  }

  function handleRecieveCall(incoming) {
    peerRef.current = createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current
          .getTracks()
          .forEach((track) =>
            senders.current.push(
              peerRef.current.addTrack(track, userStream.current)
            )
          );
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("answer", payload);
      });
  }

  function handleAnswer(message) {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
    RoomStatus = "";
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit("ice-candidate", payload);
    }
  }

  function handleNewICECandidateMsg(incoming) {
    const candidate = new RTCIceCandidate(incoming);

    peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  }

  function handleTrackEvent(e) {
    partnerVideo.current.srcObject = e.streams[0];
  }

  function handleScreenShareStopped(e) {
    senders.current
      .find((sender) => sender.track.kind === "video")
      .replaceTrack(userStream.current.getTracks()[1]);
  }

  function shareScreen() {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((stream) => {
      const screenTrack = stream.getTracks()[0];
      senders.current
        .find((sender) => sender.track.kind === "video")
        .replaceTrack(screenTrack);
      screenTrack.onended = handleScreenShareStopped;
    });
  }

  function MuteAudioStart() {
    setState(!state);
    const audiotrackss = userStream.current
      .getTracks()
      .find((track) => track.kind === "audio");
    //console.log("Called", videotrackss.enabled);
    audiotrackss.enabled = state;
    console.log("Sound State", audiotrackss.enabled);
    console.log("bgColor :", state);
  }

  const MuteAudio = () => {
    setState(!state);
    const audiotrackss = userStream.current
      .getTracks()
      .find((track) => track.kind === "audio");
    //console.log("Called", videotrackss.enabled);
    audiotrackss.enabled = state;
    console.log("Sound State", audiotrackss.enabled);
    console.log("bgColor :", state);
  };

  function EndMyCall() {
    csetState(!camstate);
    const videotrackss = userStream.current
      .getTracks()
      .find((track) => track.kind === "video");
    videotrackss.enabled = camstate;
    userStream.current.getTracks().forEach((t) => t.stop());
    peerRef.current.close();
    window.location.href = "https://google.com/contact";
  }
  const EnableVideo = () => {
    csetState(!camstate);
    const videotrackss = userStream.current
      .getTracks()
      .find((track) => track.kind === "video");
    videotrackss.enabled = camstate;
    console.log("video bgColor :", camstate);
  };

  return (
    <div className="bg">
      <p className="msg">{RoomStatus}</p>
      <div className="video-wrapper">
        <video style={{ height: 500, width: 500 }} autoPlay ref={userVideo} />
        <video
          style={{ height: 500, width: 500 }}
          autoPlay
          ref={partnerVideo}
        />
      </div>
      <div className="buttons">
        <button
          className="btn end-call"
          style={{ backgroundColor: "tomato" }}
          onClick={EndMyCall}
        >
          <FontAwesomeIcon icon={faPhone}></FontAwesomeIcon>
        </button>
        <button
          className="btn mute-call"
          style={{ backgroundColor: state ? "tomato" : "cadetblue" }}
          onClick={MuteAudio}
        >
          <FontAwesomeIcon icon={faMicrophone}></FontAwesomeIcon>
        </button>
        <button
          className="btn end-call"
          style={{ backgroundColor: camstate ? "tomato" : "cadetblue" }}
          onClick={EnableVideo}
        >
          <FontAwesomeIcon icon={faVideoCamera}></FontAwesomeIcon>
        </button>
        <button className="btn share-screen" onClick={shareScreen}>
          <FontAwesomeIcon icon={faDesktop}></FontAwesomeIcon>
        </button>
      </div>
      <div className="timer-wrapper">
        <p className="time">
          Call Duration: {minutes} : {seconds < 10 ? `0${seconds}` : seconds}
        </p>
        <p className="note">Please Note Call Ends in 30mins</p>
      </div>
    </div>
  );
};

export default Room;
