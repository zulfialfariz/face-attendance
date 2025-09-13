
// import React, { useState, useRef } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { useToast } from '@/hooks/use-toast';
// import { CalendarDays, UserCheck, Users, User, FileText } from 'lucide-react';

// const Dashboard: React.FC = () => {
//   const { user } = useAuth();
//   const { toast } = useToast();
//   const [isCheckedIn, setIsCheckedIn] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const videoRef = useRef<HTMLVideoElement>(null);

//   const startCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setShowCamera(true);
//       }
//     } catch (error) {
//       toast({
//         title: "Camera Error",
//         description: "Unable to access camera",
//         variant: "destructive"
//       });
//     }
//   };

//   const handleAttendance = async () => {
//     if (!user?.faceData && user?.role === 'Karyawan') {
//       toast({
//         title: "Face Verification Required",
//         description: "Please complete face verification in your profile first",
//         variant: "destructive"
//       });
//       return;
//     }

//     await startCamera();
    
//     // Simulate face recognition
//     setTimeout(() => {
//       setIsCheckedIn(!isCheckedIn);
//       setShowCamera(false);
      
//       if (videoRef.current?.srcObject) {
//         const stream = videoRef.current.srcObject as MediaStream;
//         stream.getTracks().forEach(track => track.stop());
//       }
      
//       toast({
//         title: isCheckedIn ? "Check Out Successful" : "Check In Successful",
//         description: `You have successfully ${isCheckedIn ? 'checked out' : 'checked in'} at ${new Date().toLocaleTimeString()}`
//       });
//     }, 3000);
//   };

//   const getStats = () => {
//     switch (user?.role) {
//       case 'HR':
//         return [
//           { title: 'Pending Approvals', value: '3', icon: UserCheck },
//           { title: 'Total Employees', value: '45', icon: Users },
//           { title: 'Present Today', value: '42', icon: CalendarDays }
//         ];
//       case 'Admin':
//       case 'Super Admin':
//         return [
//           { title: 'Total Users', value: '48', icon: Users },
//           { title: 'Pending Approvals', value: '3', icon: UserCheck },
//           { title: 'System Health', value: '99%', icon: CalendarDays }
//         ];
//       default:
//         return [
//           { title: 'This Month Attendance', value: '22/23', icon: CalendarDays },
//           { title: 'On Time Rate', value: '95%', icon: UserCheck },
//           { title: 'Total Working Days', value: '23', icon: Users }
//         ];
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Welcome back, {user?.fullName}!
//           </h1>
//           <p className="text-gray-600 mt-1">
//             {new Date().toLocaleDateString('id-ID', { 
//               weekday: 'long', 
//               year: 'numeric', 
//               month: 'long', 
//               day: 'numeric' 
//             })}
//           </p>
//         </div>
        
//         {user?.role === 'Karyawan' && (
//           <Button
//             onClick={handleAttendance}
//             className={`h-12 px-6 ${
//               isCheckedIn 
//                 ? 'bg-red-500 hover:bg-red-600' 
//                 : 'bg-green-500 hover:bg-green-600'
//             }`}
//             disabled={showCamera}
//           >
//             {showCamera ? 'Scanning Face...' : isCheckedIn ? 'Check Out' : 'Check In'}
//           </Button>
//         )}
//       </div>

//       {/* Camera Modal */}
//       {showCamera && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <Card className="w-96">
//             <CardHeader>
//               <CardTitle className="text-center">Face Recognition</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="relative">
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   muted
//                   className="w-full rounded-lg camera-overlay"
//                 />
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <div className="w-full h-1 bg-blue-500 scanning-animation opacity-75"></div>
//                 </div>
//               </div>
//               <p className="text-center text-sm text-gray-600 mt-4">
//                 Please position your face in the camera frame
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {getStats().map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <Card key={index} className="card-hover">
//               <CardContent className="p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                     <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
//                   </div>
//                   <div className="h-12 w-12 bg-brand-100 rounded-lg flex items-center justify-center">
//                     <Icon className="h-6 w-6 text-brand-600" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Quick Actions */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Quick Actions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {user?.role === 'Karyawan' && (
//               <>
//                 <Button variant="outline" className="h-20 flex-col">
//                   <CalendarDays className="h-6 w-6 mb-2" />
//                   <span>View Schedule</span>
//                 </Button>
//                 <Button variant="outline" className="h-20 flex-col">
//                   <User className="h-6 w-6 mb-2" />
//                   <span>Update Profile</span>
//                 </Button>
//               </>
//             )}
            
//             {(user?.role === 'HR' || user?.role === 'Admin' || user?.role === 'Super Admin') && (
//               <>
//                 <Button variant="outline" className="h-20 flex-col">
//                   <UserCheck className="h-6 w-6 mb-2" />
//                   <span>Approve Users</span>
//                 </Button>
//                 <Button variant="outline" className="h-20 flex-col">
//                   <FileText className="h-6 w-6 mb-2" />
//                   <span>Export Report</span>
//                 </Button>
//               </>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, UserCheck, Users, User, FileText, CheckCircle, X, Camera } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  console.log(user);
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up camera stream on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting camera...');
      
      // First, show the modal
      setShowCamera(true);
      setCameraReady(false);
      
      // Request camera permission with more specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 }
        },
        audio: false
      });
      
      console.log('Camera stream obtained:', mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Set up event listeners for video
        const video = videoRef.current;
        
        const handleLoadedMetadata = () => {
          console.log('Video metadata loaded');
          setCameraReady(true);
        };
        
        const handleCanPlay = () => {
          console.log('Video can play');
          setCameraReady(true);
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        
        // Try to play the video
        try {
          await video.play();
          console.log('Video started playing');
        } catch (playError) {
          console.error('Error playing video:', playError);
        }
        
        // Cleanup event listeners
        return () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('canplay', handleCanPlay);
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      
      // Close modal if camera fails
      setShowCamera(false);
      setCameraReady(false);
      
      let errorMessage = "Unable to access camera. Please check permissions.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Camera access was denied. Please allow camera permissions and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No camera found on this device.";
        } else if (error.name === 'NotReadableError') {
          errorMessage = "Camera is being used by another application.";
        }
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraReady(false);
    setShowCamera(false);
    setIsProcessing(false);
  }, [stream]);

  const captureImage = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      console.log('Video or canvas not ready');
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [cameraReady]);

  // Simulate face recognition (replace with actual face-api.js implementation)
  const recognizeFace = useCallback(async (imageData: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate processing time
      setTimeout(() => {
        // For demo purposes, randomly succeed/fail
        // In real implementation, compare with user's face_data
        resolve(Math.random() > 0.3); // 70% success rate for demo
      }, 2000);
    });
  }, []);

  const handleCheckIn = async () => {
    console.log('handleCheckIn called');
    console.log('User:', user);
    
    // Check if user has face data (for employees only)
    if (user?.role === 'Karyawan' && !user?.faceData) {
      toast({
        title: "Face Verification Required",
        description: "Please complete face verification in your profile first",
        variant: "destructive"
      });
      return;
    }

    console.log('Starting check-in process...');
    await startCamera();
  };

  const processAttendance = async () => {
    if (!cameraReady || isProcessing) {
      console.log('Camera not ready or already processing');
      return;
    }

    setIsProcessing(true);
    console.log('Processing attendance...');

    try {
      // Capture image from video
      const imageData = captureImage();
      
      if (!imageData) {
        throw new Error('Failed to capture image');
      }

      console.log('Image captured, starting face recognition...');
      
      // Perform face recognition
      const isRecognized = await recognizeFace(imageData);
      
      if (isRecognized) {
        // Simulate API call
        console.log('Face recognized, checking in...');
        
        // For demo purposes, just simulate success
        setTimeout(() => {
          setIsCheckedIn(true);
          stopCamera();
          
          toast({
            title: "Check In Successful",
            description: `You have successfully checked in at ${new Date().toLocaleTimeString()}`,
          });
        }, 1000);
        
        /*
        // Uncomment for real API integration
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/attendance/checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            faceImageData: imageData,
            timestamp: new Date().toISOString()
          })
        });

        const result = await response.json();
        
        if (response.ok) {
          setIsCheckedIn(true);
          stopCamera();
          
          toast({
            title: "Check In Successful",
            description: `You have successfully checked in at ${new Date().toLocaleTimeString()}`,
          });
        } else {
          throw new Error(result.error || 'Check-in failed');
        }
        */
      } else {
        toast({
          title: "Face Recognition Failed",
          description: "Face not recognized. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Attendance processing error:', error);
      toast({
        title: "Check In Failed",
        description: error instanceof Error ? error.message : "An error occurred during check-in",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    console.log('handleCheckOut called');
    
    try {
      // Simulate API call
      setTimeout(() => {
        setIsCheckedIn(false);
        toast({
          title: "Check Out Successful",
          description: `You have successfully checked out at ${new Date().toLocaleTimeString()}`,
        });
      }, 500);
      
      /*
      // Uncomment for real API integration
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        setIsCheckedIn(false);
        toast({
          title: "Check Out Successful",
          description: `You have successfully checked out at ${new Date().toLocaleTimeString()}`,
        });
      } else {
        throw new Error(result.error || 'Check-out failed');
      }
      */
    } catch (error) {
      console.error('Check-out error:', error);
      toast({
        title: "Check Out Failed",
        description: error instanceof Error ? error.message : "An error occurred during check-out",
        variant: "destructive"
      });
    }
  };

  const getStats = () => {
    switch (user?.role) {
      case 'HR':
        return [
          { title: 'Pending Approvals', value: '3', icon: UserCheck },
          { title: 'Total Employees', value: '45', icon: Users },
          { title: 'Present Today', value: '42', icon: CalendarDays }
        ];
      case 'Admin':
      case 'Super Admin':
        return [
          { title: 'Total Users', value: '48', icon: Users },
          { title: 'Pending Approvals', value: '3', icon: UserCheck },
          { title: 'System Health', value: '99%', icon: CalendarDays }
        ];
      default:
        return [
          { title: 'This Month Attendance', value: '22/23', icon: CalendarDays },
          { title: 'On Time Rate', value: '95%', icon: UserCheck },
          { title: 'Total Working Days', value: '23', icon: Users }
        ];
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.fullName || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {user?.role === 'Karyawan' && (
          <div className="flex gap-3">
            {!isCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                className="h-12 px-6 bg-green-500 hover:bg-green-600"
                disabled={showCamera}
              >
                <Camera className="h-4 w-4 mr-2" />
                {showCamera ? 'Camera Active' : 'Check In'}
              </Button>
            ) : (
              <Button
                onClick={handleCheckOut}
                className="h-12 px-6 bg-red-500 hover:bg-red-600"
              >
                Check Out
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[500px] max-w-[90vw]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-center flex-1">Face Recognition Check-In</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopCamera}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-64 object-cover"
                />
                
                {/* Camera loading state */}
                {!cameraReady && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading camera...</p>
                    </div>
                  </div>
                )}
                
                {/* Face detection overlay */}
                {cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-60 border-2 border-blue-500 rounded-lg bg-transparent">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                    </div>
                  </div>
                )}

                {/* Processing overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>Recognizing face...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Position your face within the frame and click the button below
                </p>
                
                <Button
                  onClick={processAttendance}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={!cameraReady || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Check-In
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getStats().map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {user?.role === 'Karyawan' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <CalendarDays className="h-6 w-6 mb-2" />
                  <span>View Schedule</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <User className="h-6 w-6 mb-2" />
                  <span>Update Profile</span>
                </Button>
              </>
            )}

            {(user?.role === 'HR' || user?.role === 'Admin' || user?.role === 'Super Admin') && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <UserCheck className="h-6 w-6 mb-2" />
                  <span>Approve Users</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Export Report</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;