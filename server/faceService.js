// faceService.js
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const path = require('path');

// binding canvas ke face-api
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels() {
  const MODEL_URL = path.join(__dirname, 'models'); // folder untuk simpan pretrained model
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
}

// ubah base64 ke Image
function bufferToImage(base64) {
  const buffer = Buffer.from(base64.split(',')[1], 'base64');
  const img = new canvas.Image();
  img.src = buffer;
  return img;
}

// generate face encoding
async function encodeFace(base64Image) {
  const img = bufferToImage(base64Image);
  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor); // convert Float32Array ke array biasa
}

// bandingkan dua encoding
function compareFaces(encoding1, encoding2, threshold = 0.6) {
  const dist = faceapi.euclideanDistance(encoding1, encoding2);
  return { match: dist < threshold, distance: dist };
}

module.exports = { loadModels, encodeFace, compareFaces };
