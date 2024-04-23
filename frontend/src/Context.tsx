import React, { createContext, useState, useRef, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import Peer, { Instance, SignalData } from 'simple-peer';

interface ContextProps {
    call: {
        isReceivingCall: boolean;
        from: string;
        name: string;
        signal: SignalData | null;
    };
    callAccepted: boolean;
    myVideo: React.RefObject<HTMLVideoElement>;
    userVideo: React.RefObject<HTMLVideoElement>;
    stream: MediaStream | undefined;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    callEnded: boolean;
    me: string;
    callUser: (id: string) => void;
    leaveCall: () => void;
    answerCall: () => void;
    devices: string[]
}

const SocketContext = createContext<ContextProps>({} as ContextProps);
const socket: Socket = io('http://192.168.90.92:8080');

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [callAccepted, setCallAccepted] = useState<boolean>(false);
    const [callEnded, setCallEnded] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream>();
    const [name, setName] = useState<string>('');
    const [devices, setDevices] = useState<string[]>([]);

    const [call, setCall] = useState<{
        isReceivingCall: boolean;
        from: string;
        name: string;
        signal: SignalData | null;
    }>({ isReceivingCall: false, from: '', name: '', signal: null });
    const [me, setMe] = useState<string>('');
    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Instance | null>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            });

        socket.on('me', (id: string) => setMe(id));
        socket.on('callUser', ({ from, name: callerName, signal }: any) => {
            setCall({ isReceivingCall: true, from, name: callerName, signal });
        });
        socket.on('devices', (availableDevices: string[]) => {
            setDevices(availableDevices);
        });

        return () => {
            socket.off('me');
            socket.off('callUser');
        };
    }, []);

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream });
        peer.on('signal', (data) => {
            socket.emit('answerCall', { signal: data, to: call.from });
        });
        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });
        if (call.signal) {
            peer.signal(call.signal);
        } else {
            console.error('No signal to answer the call.');
        }
        connectionRef.current = peer;
    };

    const callUser = (id: string) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });
        peer.on('signal', (data) => {
            socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
        });
        peer.on('stream', (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });
        socket.on('callAccepted', (signal: SignalData) => {
            setCallAccepted(true);
            peer.signal(signal);
        });
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }

        setCallAccepted(false);
        setStream(undefined);
        setName('');

        if (myVideo.current) {
            myVideo.current.srcObject = null;
        }
        if (userVideo.current) {
            userVideo.current.srcObject = null;
        }
        window.location.reload()
    };

    const contextValues: ContextProps = {
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        devices,
    };

    return (
        <SocketContext.Provider value={contextValues}>
            {children}
        </SocketContext.Provider>
    );
};

export { ContextProvider, SocketContext };

