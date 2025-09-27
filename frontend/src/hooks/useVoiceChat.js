import { useState, useEffect, useRef } from 'react';

export const useVoiceChat = (socket, roomId) => {
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState(new Set());
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);

  const peerConnections = useRef({});
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize voice chat
  const initializeVoiceChat = async () => {
    try {
      setError(null);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsVoiceConnected(true);

      // Create audio context for better audio processing
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

      // Join voice room
      socket.emit('join-voice-room', roomId);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Could not access microphone. Please check permissions.');
      setIsVoiceConnected(false);
    }
  };

  // Cleanup voice chat
  const cleanupVoiceChat = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => {
      if (pc) {
        pc.close();
      }
    });
    peerConnections.current = {};

    // Leave voice room
    if (socket) {
      socket.emit('leave-voice-room', roomId);
    }

    setIsVoiceConnected(false);
    setIsMuted(false);
    setParticipants(new Set());
    setError(null);
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Create peer connection
  const createPeerConnection = (userId) => {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });

      // Add local stream to connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      // Handle incoming stream
      peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        // Create audio element to play the remote stream
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.play().catch(err => console.error('Error playing remote audio:', err));

        console.log('Received remote stream from:', userId);
      };

      // Handle ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for ${userId}:`, peerConnection.iceConnectionState);

        if (peerConnection.iceConnectionState === 'disconnected' ||
            peerConnection.iceConnectionState === 'failed') {
          // Remove participant if connection fails
          setParticipants(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('voice-ice-candidate', {
            target: userId,
            candidate: event.candidate,
            roomId
          });
        }
      };

      peerConnections.current[userId] = peerConnection;
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const socketHandlers = {
      'existing-voice-users': (userIds) => {
        console.log('Existing voice users:', userIds);
        setParticipants(new Set(userIds));

        // Create offers for existing users
        userIds.forEach(userId => {
          if (userId !== socket.id && isVoiceConnected) {
            setTimeout(() => createOffer(userId), 1000); // Delay to ensure readiness
          }
        });
      },

      'user-joined-voice': (userId) => {
        console.log('User joined voice:', userId);
        setParticipants(prev => new Set([...prev, userId]));

        if (userId !== socket.id && isVoiceConnected) {
          setTimeout(() => createOffer(userId), 500);
        }
      },

      'user-left-voice': (userId) => {
        console.log('User left voice:', userId);
        setParticipants(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });

        // Close peer connection
        if (peerConnections.current[userId]) {
          peerConnections.current[userId].close();
          delete peerConnections.current[userId];
        }
      },

      'voice-offer': async ({ offer, caller }) => {
        console.log('Received voice offer from:', caller);
        const peerConnection = createPeerConnection(caller);

        if (!peerConnection) return;

        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          socket.emit('voice-answer', {
            target: caller,
            answer: answer,
            roomId
          });
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      },

      'voice-answer': async ({ answer, answerer }) => {
        console.log('Received voice answer from:', answerer);
        const peerConnection = peerConnections.current[answerer];
        if (peerConnection) {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        }
      },

      'voice-ice-candidate': async ({ candidate, from }) => {
        const peerConnection = peerConnections.current[from];
        if (peerConnection) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      }
    };

    // Register all socket handlers
    Object.entries(socketHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      // Cleanup socket listeners
      Object.keys(socketHandlers).forEach(event => {
        socket.off(event);
      });
    };
  }, [socket, roomId, isVoiceConnected]);

  // Create offer for a user
  const createOffer = async (userId) => {
    const peerConnection = createPeerConnection(userId);

    if (!peerConnection) return;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('voice-offer', {
        target: userId,
        offer: offer,
        roomId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupVoiceChat();
    };
  }, []);

  return {
    isVoiceConnected,
    isMuted,
    participants,
    localStream,
    error,
    initializeVoiceChat,
    cleanupVoiceChat,
    toggleMute,
  };
};