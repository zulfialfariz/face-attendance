
import apiClient from '@/lib/api';
import { AttendanceRecord, faceRegisterData } from '@/types/user';

export interface CheckInResponse {
  success: boolean;
  message: string;
}

export interface CheckOutResponse {
  success: boolean;
  message: string;
  workHours?: number;
}

// export const faceRecogService = {
//   async faceRegister(data: faceRegisterData): Promise<{ success: boolean; message: string }> {
//     const response = await apiClient.post('/face/register', data);
//     return response.data;
//   },
// };

export const faceRecogService = {
  faceRegister: async (payload: {
    user_id: string;
    face_image_url: string;
    confidence_score?: number;
    is_active?: boolean;
  }) => {
    const { face_image_url, user_id } = payload;

    try {
      // 1. Kirim base64 image ke /api/face/encode (Python) untuk dapatkan 128-float
      const encodeRes = await fetch("http://localhost:5000/api/face/encode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: face_image_url }),
      });

      const encodeResult = await encodeRes.json();
      if (!encodeResult.encoding) {
        throw new Error("Face encoding failed: No face detected");
      }

      // 2. Kirim encoding ke /api/face/register (Python) untuk disimpan ke PostgreSQL
      const registerRes = await fetch("http://localhost:5000/api/face/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user_id,
          face_image_url: face_image_url,
          face_encoding: encodeResult.encoding,
          confidence_score: payload.confidence_score || 0.95,
          is_active: payload.is_active ?? true,
        }),
      });

      const registerResult = await registerRes.json();
      return registerResult;
    } catch (err) {
      console.error("Face registration error:", err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  },
};