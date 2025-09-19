import apiClient from '@/lib/api';
import { AttendanceRecord } from '@/types/user';

export interface CheckInResponse {
  success: boolean;
  message: string;
}

export interface CheckOutResponse {
  success: boolean;
  message: string;
  workHours?: number;
}

export const attendanceService = {
  // 🔹 Check-in dengan face recognition
  checkIn: async (imageData: string, userId: string) => {
    try {
      // 1. Verifikasi wajah (pakai apiClient)
      const verifyRes = await apiClient.post("/face/verify", {
        faceImage: imageData,
        userId: userId,
      });

      const verifyResult = verifyRes.data;
      if (!verifyResult.match) {
        throw new Error("Face verification failed");
      }

      // 2. Kalau match → simpan check-in
      const appRes = await apiClient.post("/attendance/checkin", {
        timestamp: new Date().toISOString(),
        face_match_confidence: verifyResult.distance,
        face_verified: true,
      });

      return appRes.data;
    } catch (err: any) {
      console.error("Check-in error:", err);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  },

  // 🔹 Check-out (optional)
  async checkOut(): Promise<CheckOutResponse> {
    const response = await apiClient.post('/attendance/checkout');
    return response.data;
  },

  // 🔹 Ambil data absensi hari ini
  async getTodayAttendance(): Promise<AttendanceRecord | null> {
    const response = await apiClient.get('/attendance/today');
    return response.data;
  },

  // 🔹 Ambil riwayat absensi
  async getAttendanceHistory(startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/attendance/history?${params.toString()}`);
    return response.data;
  },

  // 🔹 Ambil riwayat absensi per user
  async getUserAttendanceHistory(userId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/attendance/user/${userId}?${params.toString()}`);
    return response.data;
  }
};



// import apiClient from '@/lib/api';
// import { AttendanceRecord } from '@/types/user';

// export interface CheckInResponse {
//   success: boolean;
//   message: string;
// }

// export interface CheckOutResponse {
//   success: boolean;
//   message: string;
//   workHours?: number;
// }

// // export const attendanceService = {
// //   async checkIn(): Promise<CheckInResponse> {
// //     const response = await apiClient.post('/attendance/checkin');
// //     return response.data;
// //   },

// //   async checkOut(): Promise<CheckOutResponse> {
// //     const response = await apiClient.post('/attendance/checkout');
// //     return response.data;
// //   },

// //   async getTodayAttendance(): Promise<AttendanceRecord | null> {
// //     const response = await apiClient.get('/attendance/today');
// //     return response.data;
// //   },

// //   async getAttendanceHistory(startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
// //     const params = new URLSearchParams();
// //     if (startDate) params.append('startDate', startDate);
// //     if (endDate) params.append('endDate', endDate);
    
// //     const response = await apiClient.get(`/attendance/history?${params.toString()}`);
// //     return response.data;
// //   },

// //   async getUserAttendanceHistory(userId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> {
// //     const params = new URLSearchParams();
// //     if (startDate) params.append('startDate', startDate);
// //     if (endDate) params.append('endDate', endDate);
    
// //     const response = await apiClient.get(`/attendance/user/${userId}?${params.toString()}`);
// //     return response.data;
// //   }
// // };

// export const attendanceService = {
//   checkIn: async (imageData: string, userId: string) => {
//     try {
//       // 1. Kirim gambar ke API face recognition
//       const verifyRes = await fetch("http://localhost:5000/api/face/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           faceImage: imageData,
//           userId: userId,
//         }),
//       });

//       const verifyResult = await verifyRes.json();
//       if (!verifyResult.match) {
//         throw new Error("Face verification failed");
//       }

//       // 2. Kalau match, lanjut check-in ke server kamu (Node.js misalnya)
//       const appRes = await fetch("/api/attendance/checkin", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//         },
//         body: JSON.stringify({
//           timestamp: new Date().toISOString(),
//           face_match_confidence: verifyResult.distance,
//           face_verified: true,
//         }),
//       });

//       const result = await appRes.json();
//       return result;
//     } catch (err) {
//       console.error("Check-in error:", err);
//       return { success: false, error: err instanceof Error ? err.message : String(err) };
//     }
//   },
// };

