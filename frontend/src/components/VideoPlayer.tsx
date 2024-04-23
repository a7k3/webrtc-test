import React from "react"
import { Grid, Box, Heading } from "@chakra-ui/react"
import { SocketContext } from "../Context"
import { useContext } from "react"

const VideoPlayer = () => {
    const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext)
    const getBackgroundColor = () => {
        const nameToCheck = call.name || name;
        switch (nameToCheck) {
            case "Control_Phone_1":
                return "#ffcccc";
            case "Hotline_1":
                return "#ccffcc";
            case "Hotline_2":
                return "#ccccff";
            case "Walkie_Talkie":
                return "#ffffcc";
            default:
                return "#ffffff";
        }
    };
    return (
        <Grid justifyContent="center" templateColumns='repeat(2, 1fr)' mt="12" bg={getBackgroundColor()}>
            {/* my video */}
            {
                stream && (
                    <Box>
                        <Grid templateColumns="1fr" gap={2}>
                            <video playsInline muted ref={myVideo} autoPlay width="200" />
                        </Grid>
                    </Box>
                )
            }
            {/* user's video */}
            {
                callAccepted && !callEnded && (
                    <Box>
                        <Grid templateColumns="1fr" gap={2}>
                            <video playsInline ref={userVideo} autoPlay width="200" />
                        </Grid>
                    </Box>
                )
            }
        </Grid>
    )
}
export default VideoPlayer

