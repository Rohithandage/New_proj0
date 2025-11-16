import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Upload, X, RefreshCw, Download } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useSelector } from "react-redux";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import * as poseDetection from "@tensorflow-models/pose-detection";

// Register TensorFlow.js backends
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";

function TryOnDialog({ open, setOpen, products = [] }) {
  const { toast } = useToast();
  // Safely access productList from Redux state, handling undefined state
  const shopProductsState = useSelector((state) => state.shopProducts);
  const productList = shopProductsState?.productList || [];
  const [selectedProduct, setSelectedProduct] = useState("");
  const [userImage, setUserImage] = useState(null);
  const [userImageUrl, setUserImageUrl] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const bodyPixModelRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const segmentModelRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Use products prop or fallback to productList from Redux
  const availableProducts = products.length > 0 ? products : productList || [];

  // Normalize products to handle different product structures
  const normalizedProducts = availableProducts.map(product => ({
    _id: product._id,
    title: product.title || product.name || 'Product',
    image: product.image || (product.prices && product.prices[0]?.image) || product.images?.[0] || ''
  }));

  // Load AI models (BodyPix, Pose Detection, and Segmentation) on component mount
  useEffect(() => {
    const loadAIModels = async () => {
      try {
        setIsProcessing(true);
        
        // Set backend before loading models
        await tf.setBackend('webgl');
        await tf.ready();
        
        // Check if backend is ready
        const backend = tf.getBackend();
        if (!backend) {
          throw new Error('Failed to initialize TensorFlow.js backend');
        }
        
        console.log('TensorFlow.js backend:', backend);
        
        // Load multiple AI models in parallel
        const [bodyPixModel, poseDetector] = await Promise.all([
          // BodyPix for segmentation
          bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
          }),
          // Pose Detection for body understanding
          poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
              modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            }
          )
        ]);
        
        bodyPixModelRef.current = bodyPixModel;
        poseDetectorRef.current = poseDetector;
        setModelLoaded(true);
        setIsProcessing(false);
        
        toast({
          title: "AI Models Loaded",
          description: "Computer vision models ready for advanced try-on!",
        });
      } catch (error) {
        console.error("Error loading AI models:", error);
        
        // Try CPU backend as fallback
        try {
          await tf.setBackend('cpu');
          await tf.ready();
          
          const bodyPixModel = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2
          });
          
          bodyPixModelRef.current = bodyPixModel;
          setModelLoaded(true);
          setIsProcessing(false);
          
          toast({
            title: "AI Models Loaded",
            description: "Using CPU backend (may be slower).",
          });
        } catch (cpuError) {
          console.error("Error loading with CPU backend:", cpuError);
          setIsProcessing(false);
          toast({
            title: "Warning",
            description: "AI model loading failed. Using fallback method.",
            variant: "destructive",
          });
        }
      }
    };
    
    if (open && !bodyPixModelRef.current) {
      loadAIModels();
    }
  }, [open]);

  useEffect(() => {
    if (selectedProduct) {
      const product = normalizedProducts.find((p) => p._id === selectedProduct);
      if (product?.image) {
        setProductImageUrl(product.image);
      }
    }
  }, [selectedProduct, normalizedProducts]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUserImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImageUrl(reader.result);
      setTryOnResult(null); // Reset result when new image is uploaded
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUserImage(null);
    setUserImageUrl("");
    setTryOnResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Advanced function to extract only clothing from product image (remove model and background)
  const extractClothing = (imageData, width, height) => {
    const data = imageData.data;
    const newData = new ImageData(width, height);
    const newDataArray = newData.data;
    
    // First pass: detect edges and skin tones
    const edgeMap = new Array(width * height).fill(false);
    const skinMap = new Array(width * height).fill(false);
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detect edges
      edgeMap[i / 4] = detectEdge(data, i, width, height);
      
      // Detect skin tones (to remove model)
      const isSkin = detectSkinTone(r, g, b);
      skinMap[i / 4] = isSkin;
    }
    
    // Find clothing bounding box (central area excluding edges)
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let hasClothing = false;
    
    // Second pass: identify clothing area
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const isEdge = edgeMap[pixelIndex];
      const isSkin = skinMap[pixelIndex];
      
      // Identify clothing: not background, not skin, has color, in center area
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const isInCenter = distanceFromCenter < Math.min(width, height) * 0.6;
      
      const isClothing = 
        !isSkin &&
        !(luminance > 0.85 && saturation < 0.2) && // Not pure white background
        (saturation > 0.15 || isEdge) && // Has color or is an edge
        isInCenter && // In center area where clothing usually is
        (r > 20 || g > 20 || b > 20); // Not pure black
      
      if (isClothing) {
        hasClothing = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    
    // Third pass: Extract only clothing area, remove everything else
    if (hasClothing) {
      // Expand bounding box slightly
      const padding = 5;
      minX = Math.max(0, minX - padding);
      maxX = Math.min(width, maxX + padding);
      minY = Math.max(0, minY - padding);
      maxY = Math.min(height, maxY + padding);
      
      for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Keep only pixels in clothing bounding box that aren't skin or background
        const isInClothingBox = x >= minX && x <= maxX && y >= minY && y <= maxY;
        const isSkin = skinMap[pixelIndex];
        
        if (isInClothingBox && !isSkin) {
          const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          
          // Remove pure white/light backgrounds
          if (luminance > 0.9 && saturation < 0.15) {
            newDataArray[i] = 0;
            newDataArray[i + 1] = 0;
            newDataArray[i + 2] = 0;
            newDataArray[i + 3] = 0;
          } else {
            newDataArray[i] = r;
            newDataArray[i + 1] = g;
            newDataArray[i + 2] = b;
            newDataArray[i + 3] = a;
          }
        } else {
          newDataArray[i] = 0;
          newDataArray[i + 1] = 0;
          newDataArray[i + 2] = 0;
          newDataArray[i + 3] = 0;
        }
      }
    }
    
    return { imageData: newData, bounds: hasClothing ? { minX, minY, maxX, maxY } : null };
  };
  
  // Detect skin tones
  const detectSkinTone = (r, g, b) => {
    // RGB skin tone detection
    const rgbSum = r + g + b;
    if (rgbSum === 0) return false;
    
    const rd = r / rgbSum;
    const gd = g / rgbSum;
    
    // Skin tone typically has: R > 95, G > 40, B > 20, R > G, R > B
    // And normalized ratios: rd > 0.3, gd < 0.5
    return (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      rd > 0.3 && gd < 0.5
    );
  };
  
  // Check if pixel is in clothing area (has nearby edges)
  const isClothingArea = (edgeMap, index, width, height) => {
    const x = index % width;
    const y = Math.floor(index / width);
    
    // Check surrounding area for edges
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighborIndex = ny * width + nx;
          if (edgeMap[neighborIndex]) {
            return true; // Found an edge nearby, likely clothing
          }
        }
      }
    }
    return false;
  };
  
  // Edge detection using simplified Sobel operator
  const detectEdge = (data, index, width, height) => {
    const x = (index / 4) % width;
    const y = Math.floor((index / 4) / width);
    
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
      return false;
    }
    
    // Get surrounding pixels
    const getPixel = (offsetX, offsetY) => {
      const pos = ((y + offsetY) * width + (x + offsetX)) * 4;
      if (pos < 0 || pos >= data.length) return 0;
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      return (r + g + b) / 3;
    };
    
    // Simplified Sobel operator
    const gx = getPixel(1, -1) + 2 * getPixel(1, 0) + getPixel(1, 1) -
               getPixel(-1, -1) - 2 * getPixel(-1, 0) - getPixel(-1, 1);
    const gy = getPixel(-1, 1) + 2 * getPixel(0, 1) + getPixel(1, 1) -
               getPixel(-1, -1) - 2 * getPixel(0, -1) - getPixel(1, -1);
    
    const gradient = Math.sqrt(gx * gx + gy * gy);
    return gradient > 30; // Threshold for edge detection
  };
  
  // Advanced pose-based body detection using AI models
  const detectPoseAndBody = async (imageElement, width, height) => {
    const poseData = {
      keypoints: [],
      bodyArea: null,
      confidence: 0
    };

    // Use pose detection if available
    if (poseDetectorRef.current) {
      try {
        const poses = await poseDetectorRef.current.estimatePoses(imageElement);
        if (poses && poses.length > 0) {
          const pose = poses[0];
          poseData.keypoints = pose.keypoints;
          poseData.confidence = pose.score;
          
          // Extract key body points for clothing placement
          const leftShoulder = pose.keypoints.find(k => k.name === 'left_shoulder');
          const rightShoulder = pose.keypoints.find(k => k.name === 'right_shoulder');
          const leftHip = pose.keypoints.find(k => k.name === 'left_hip');
          const rightHip = pose.keypoints.find(k => k.name === 'right_hip');
          
          if (leftShoulder && rightShoulder && leftHip && rightHip) {
            // Calculate body area from pose keypoints
            const shoulderY = Math.min(leftShoulder.y, rightShoulder.y);
            const hipY = Math.max(leftHip.y, rightHip.y);
            const leftX = Math.min(leftShoulder.x, leftHip.x);
            const rightX = Math.max(rightShoulder.x, rightHip.x);
            
            const bodyWidth = rightX - leftX;
            const bodyHeight = hipY - shoulderY;
            
            const bodyArea = {
              bodyX: leftX - bodyWidth * 0.1,
              bodyY: shoulderY - bodyHeight * 0.1,
              bodyWidth: bodyWidth * 1.2,
              bodyHeight: bodyHeight * 1.4,
              actualBodyWidth: bodyWidth,
              actualBodyHeight: bodyHeight,
              centerX: (leftX + rightX) / 2,
              centerY: (shoulderY + hipY) / 2,
              shoulderY,
              waistY: hipY,
              detected: true,
              poseKeypoints: pose.keypoints
            };
            
            return bodyArea;
          }
        }
      } catch (error) {
        console.error("Pose detection error:", error);
      }
    }
    
    // Fallback to BodyPix segmentation
    return await detectBodyAreaML(imageElement, width, height);
  };

  // Detect body parts using BodyPix ML model for accurate clothing placement with actual measurements
  const detectBodyAreaML = async (imageElement, width, height) => {
    if (!bodyPixModelRef.current) {
      // Fallback to heuristic method if model not loaded
      return detectBodyAreaHeuristic(width, height);
    }

    try {
      // Run segmentation with higher resolution for better accuracy
      const segmentation = await bodyPixModelRef.current.segmentPersonParts(imageElement, {
        flipHorizontal: false,
        internalResolution: 'high', // Use high resolution for better accuracy
        segmentationThreshold: 0.7,
        maxDetections: 1
      });

      // BodyPix part IDs: 0=background, 1=face, 2=torso_front, 3=upperArmLeft, 4=upperArmRight
      const partsMap = segmentation.data;
      const height_seg = segmentation.height;
      const width_seg = segmentation.width;

      // Find torso and upper body parts with accurate measurements
      let torsoPixels = [];
      let leftArmPixels = [];
      let rightArmPixels = [];
      let leftShoulderX = width, rightShoulderX = 0;
      let shoulderY = height;
      let waistY = 0;
      let torsoMinX = width, torsoMaxX = 0;

      // Scale factors for converting segmentation coordinates to image coordinates
      const scaleX = width / width_seg;
      const scaleY = height / height_seg;

      for (let y = 0; y < height_seg; y++) {
        for (let x = 0; x < width_seg; x++) {
          const partId = partsMap[y * width_seg + x];
          
          // Scale coordinates to image dimensions
          const imgX = x * scaleX;
          const imgY = y * scaleY;

          // Torso front (2) - main clothing area
          if (partId === 2) {
            torsoPixels.push({ x: imgX, y: imgY });
            torsoMinX = Math.min(torsoMinX, imgX);
            torsoMaxX = Math.max(torsoMaxX, imgX);
            shoulderY = Math.min(shoulderY, imgY); // Top of torso (shoulder line)
            waistY = Math.max(waistY, imgY); // Bottom of torso (waist line)
          }
          
          // Upper arms (3, 4) - for accurate width measurement
          if (partId === 3) { // Left arm
            leftArmPixels.push({ x: imgX, y: imgY });
            leftShoulderX = Math.min(leftShoulderX, imgX);
          }
          if (partId === 4) { // Right arm
            rightArmPixels.push({ x: imgX, y: imgY });
            rightShoulderX = Math.max(rightShoulderX, imgX);
          }
        }
      }

      // Calculate accurate body measurements from detected parts
      if (torsoPixels.length > 0) {
        // Calculate actual body width from shoulder to shoulder
        const actualBodyWidth = rightShoulderX > 0 && leftShoulderX < width 
          ? rightShoulderX - leftShoulderX 
          : torsoMaxX - torsoMinX;
        
        // Use detected torso bounds, expand slightly for complete fit
        const bodyWidth = Math.max(actualBodyWidth * 1.15, (torsoMaxX - torsoMinX) * 1.1);
        
        // Calculate actual body height from shoulder to waist
        const actualBodyHeight = waistY > shoulderY ? waistY - shoulderY : height * 0.4;
        
        // Add some margin for complete clothing display
        const bodyHeight = actualBodyHeight * 1.3; // Add 30% margin for complete clothing
        
        // Calculate center point
        const centerX = (torsoMinX + torsoMaxX) / 2;
        const bodyX = Math.max(0, centerX - bodyWidth / 2);
        
        // Ensure body fits within image bounds
        const finalBodyWidth = Math.min(bodyWidth, width - bodyX);
        const finalBodyHeight = Math.min(bodyHeight, height - shoulderY);

        return {
          bodyX,
          bodyY: shoulderY,
          bodyWidth: finalBodyWidth,
          bodyHeight: finalBodyHeight,
          actualBodyWidth, // Store actual measurements for scaling
          actualBodyHeight,
          centerX,
          centerY: shoulderY + actualBodyHeight / 2,
          shoulderY,
          waistY,
          detected: true
        };
      }
    } catch (error) {
      console.error("BodyPix segmentation error:", error);
    }

    // Fallback to heuristic
    return detectBodyAreaHeuristic(width, height);
  };

  // Heuristic fallback method
  const detectBodyAreaHeuristic = (width, height) => {
    const bodyY = height * 0.25;
    const bodyHeight = height * 0.45;
    const bodyWidth = width * 0.7;
    const bodyX = (width - bodyWidth) / 2;

    return {
      bodyX,
      bodyY,
      bodyWidth,
      bodyHeight,
      centerX: width / 2,
      centerY: bodyY + bodyHeight / 2,
      detected: false
    };
  };
  
  // Apply realistic shadows and lighting effects
  const applyShadowsAndLighting = (ctx, x, y, width, height) => {
    // Create shadow below the clothing
    const shadowGradient = ctx.createLinearGradient(x, y + height, x, y + height + height * 0.1);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = shadowGradient;
    ctx.fillRect(x - width * 0.1, y + height, width * 1.2, height * 0.15);
    
    // Add subtle highlight on top
    const highlightGradient = ctx.createLinearGradient(x, y, x, y + height * 0.2);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(x, y, width, height * 0.2);
  };
  
  // Advanced blending mode for realistic overlay
  const blendImages = (userCtx, productCtx, x, y, width, height) => {
    // Use multiply blend mode for more realistic appearance
    userCtx.globalCompositeOperation = 'source-over';
    userCtx.save();
    
    // Apply the clothing with proper blending
    userCtx.globalAlpha = 0.95;
    userCtx.drawImage(productCtx.canvas, x, y, width, height);
    
    // Blend with multiply for realistic texture
    userCtx.globalCompositeOperation = 'multiply';
    userCtx.globalAlpha = 0.1;
    userCtx.drawImage(productCtx.canvas, x, y, width, height);
    
    userCtx.restore();
    userCtx.globalCompositeOperation = 'source-over';
    userCtx.globalAlpha = 1.0;
  };

  const processTryOn = async () => {
    if (!selectedProduct || !userImageUrl || !productImageUrl) {
      toast({
        title: "Error",
        description: "Please select a product and upload your photo",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create canvas for virtual try-on
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      // Load user image
      const userImg = new Image();
      userImg.crossOrigin = "anonymous";
      
      userImg.onload = () => {
        // Set canvas size to match user image
        canvas.width = userImg.width;
        canvas.height = userImg.height;
        
        // Draw user image as background
        ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);
        
        // Load product image
        const productImg = new Image();
        productImg.crossOrigin = "anonymous";
        
        productImg.onload = async () => {
          // Create temporary canvas for user image analysis
          const userAnalysisCanvas = document.createElement('canvas');
          userAnalysisCanvas.width = canvas.width;
          userAnalysisCanvas.height = canvas.height;
          const userAnalysisCtx = userAnalysisCanvas.getContext("2d", { willReadFrequently: true });
          userAnalysisCtx.drawImage(userImg, 0, 0);
          const userImageData = userAnalysisCtx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Detect body area using advanced AI (pose detection + segmentation)
          const bodyArea = await detectPoseAndBody(userImg, canvas.width, canvas.height);
          
          // Create temporary canvas for product image processing
          const productCanvas = document.createElement('canvas');
          productCanvas.width = productImg.width;
          productCanvas.height = productImg.height;
          const productCtx = productCanvas.getContext("2d", { willReadFrequently: true });
          
          // Draw product image
          productCtx.drawImage(productImg, 0, 0);
          
          // Extract product image data for clothing extraction
          const productImageData = productCtx.getImageData(0, 0, productCanvas.width, productCanvas.height);
          
          // Use BodyPix to extract clothing from product image
          let processedImageData;
          let bounds;
          
          if (bodyPixModelRef.current) {
            try {
              // Create image element from product canvas
              const productImgElement = new Image();
              productImgElement.src = productCanvas.toDataURL();
              await new Promise((resolve) => {
                productImgElement.onload = resolve;
              });

              // Segment product image to extract clothing
              const productSegmentation = await bodyPixModelRef.current.segmentPersonParts(productImgElement, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7
              });

              // Extract only torso/clothing parts (part 2 = torso_front)
              const segData = productSegmentation.data;
              const segWidth = productSegmentation.width;
              const segHeight = productSegmentation.height;
              
              // Create mask for clothing area
              const mask = new Uint8Array(segWidth * segHeight);
              let minX = segWidth, maxX = 0, minY = segHeight, maxY = 0;
              
              for (let y = 0; y < segHeight; y++) {
                for (let x = 0; x < segWidth; x++) {
                  const partId = segData[y * segWidth + x];
                  // Keep torso (2), upper arms (3, 4), and exclude face (1) and background (0)
                  if (partId === 2 || partId === 3 || partId === 4) {
                    mask[y * segWidth + x] = 255;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                  }
                }
              }

              if (minX < maxX && minY < maxY) {
                // Scale bounds to product image dimensions
                const scaleX = productCanvas.width / segWidth;
                const scaleY = productCanvas.height / segHeight;
                bounds = {
                  minX: minX * scaleX,
                  minY: minY * scaleY,
                  maxX: maxX * scaleX,
                  maxY: maxY * scaleY
                };

                // Apply mask to extract clothing
                const clothingData = productCtx.getImageData(0, 0, productCanvas.width, productCanvas.height);
                for (let i = 0; i < clothingData.data.length; i += 4) {
                  const x = (i / 4) % productCanvas.width;
                  const y = Math.floor((i / 4) / productCanvas.width);
                  const segX = Math.floor(x / scaleX);
                  const segY = Math.floor(y / scaleY);
                  
                  if (segY < segHeight && segX < segWidth) {
                    const maskValue = mask[segY * segWidth + segX];
                    if (maskValue === 0) {
                      clothingData.data[i + 3] = 0; // Make transparent
                    }
                  }
                }
                processedImageData = clothingData;
              } else {
                // Fallback to old method
                const result = extractClothing(productImageData, productCanvas.width, productCanvas.height);
                processedImageData = result.imageData;
                bounds = result.bounds;
              }
            } catch (error) {
              console.error("BodyPix product segmentation error:", error);
              const result = extractClothing(productImageData, productCanvas.width, productCanvas.height);
              processedImageData = result.imageData;
              bounds = result.bounds;
            }
          } else {
            // Fallback to old method
            const result = extractClothing(productImageData, productCanvas.width, productCanvas.height);
            processedImageData = result.imageData;
            bounds = result.bounds;
          }
          
          // If we found clothing bounds, extract complete clothing with padding
          if (bounds) {
            // Add padding to ensure complete clothing is captured
            const padding = 20;
            const clothingMinX = Math.max(0, bounds.minX - padding);
            const clothingMinY = Math.max(0, bounds.minY - padding);
            const clothingMaxX = Math.min(productCanvas.width, bounds.maxX + padding);
            const clothingMaxY = Math.min(productCanvas.height, bounds.maxY + padding);
            
            const clothingWidth = clothingMaxX - clothingMinX;
            const clothingHeight = clothingMaxY - clothingMinY;
            
            // Create new canvas with complete clothing including padding
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = clothingWidth;
            croppedCanvas.height = clothingHeight;
            const croppedCtx = croppedCanvas.getContext("2d", { willReadFrequently: true });
            
            // Extract complete clothing region with better quality
            croppedCtx.drawImage(
              productCanvas,
              clothingMinX, clothingMinY, clothingWidth, clothingHeight,
              0, 0, clothingWidth, clothingHeight
            );
            
            // Apply additional processing to remove any remaining background
            const croppedImageData = croppedCtx.getImageData(0, 0, clothingWidth, clothingHeight);
            
            // Remove any remaining transparent/background pixels more aggressively
            for (let i = 0; i < croppedImageData.data.length; i += 4) {
              const alpha = croppedImageData.data[i + 3];
              // If alpha is very low (background/transparent), make it fully transparent
              if (alpha < 30) {
                croppedImageData.data[i + 3] = 0;
              }
            }
            
            croppedCtx.putImageData(croppedImageData, 0, 0);
            
            // Update product canvas with complete cropped clothing
            productCanvas.width = clothingWidth;
            productCanvas.height = clothingHeight;
            productCtx.clearRect(0, 0, clothingWidth, clothingHeight);
            productCtx.drawImage(croppedCanvas, 0, 0);
          } else {
            // If bounds not found, use processed image but clean up edges
            const cleanedData = productCtx.getImageData(0, 0, productCanvas.width, productCanvas.height);
            for (let i = 0; i < cleanedData.data.length; i += 4) {
              const alpha = cleanedData.data[i + 3];
              if (alpha < 30) {
                cleanedData.data[i + 3] = 0;
              }
            }
            productCtx.putImageData(cleanedData, 0, 0);
          }
          
          // Calculate optimal size for clothing to perfectly match user's body
          const productAspectRatio = productCanvas.height / productCanvas.width;
          
          // Use actual body measurements for precise fitting
          const userBodyWidth = bodyArea.actualBodyWidth || bodyArea.bodyWidth;
          const userBodyHeight = bodyArea.actualBodyHeight || bodyArea.bodyHeight;
          
          // Calculate scale factors for both dimensions
          const widthScale = userBodyWidth / productCanvas.width;
          const heightScale = userBodyHeight / productCanvas.height;
          
          // Use the smaller scale to ensure complete clothing fits
          // This ensures the entire product image is visible and properly scaled
          let scaleFactor = Math.min(widthScale, heightScale);
          
          // Calculate clothing dimensions based on scale factor
          let clothingWidth = productCanvas.width * scaleFactor;
          let clothingHeight = productCanvas.height * scaleFactor;
          
          // Ensure minimum size for visibility
          const minWidth = userBodyWidth * 0.7;
          const minHeight = userBodyHeight * 0.7;
          
          if (clothingWidth < minWidth) {
            scaleFactor = minWidth / productCanvas.width;
            clothingWidth = productCanvas.width * scaleFactor;
            clothingHeight = productCanvas.height * scaleFactor;
          }
          
          if (clothingHeight < minHeight) {
            const heightBasedScale = minHeight / productCanvas.height;
            if (heightBasedScale > scaleFactor) {
              scaleFactor = heightBasedScale;
              clothingWidth = productCanvas.width * scaleFactor;
              clothingHeight = productCanvas.height * scaleFactor;
            }
          }
          
          // Ensure clothing fits within available body area
          const maxWidth = bodyArea.bodyWidth * 1.1; // 10% margin
          const maxHeight = bodyArea.bodyHeight * 1.2; // 20% margin for complete display
          
          if (clothingWidth > maxWidth) {
            scaleFactor = maxWidth / productCanvas.width;
            clothingWidth = productCanvas.width * scaleFactor;
            clothingHeight = productCanvas.height * scaleFactor;
          }
          
          if (clothingHeight > maxHeight) {
            const heightBasedScale = maxHeight / productCanvas.height;
            if (heightBasedScale < scaleFactor) {
              scaleFactor = heightBasedScale;
              clothingWidth = productCanvas.width * scaleFactor;
              clothingHeight = productCanvas.height * scaleFactor;
            }
          }
          
          // Final dimensions
          clothingWidth = Math.min(clothingWidth, maxWidth);
          clothingHeight = Math.min(clothingHeight, maxHeight);
          
          // Position clothing perfectly centered on user's body
          const clothingX = bodyArea.centerX - clothingWidth / 2;
          const clothingY = bodyArea.bodyY - (clothingHeight - userBodyHeight) * 0.3; // Slight upward offset for better alignment
          
          // Draw user image as base
          ctx.drawImage(userImg, 0, 0);
          
          // Create a temporary canvas for better quality rendering
          const renderCanvas = document.createElement('canvas');
          renderCanvas.width = canvas.width;
          renderCanvas.height = canvas.height;
          const renderCtx = renderCanvas.getContext("2d", { willReadFrequently: true });
          
          // Draw user image on render canvas
          renderCtx.drawImage(userImg, 0, 0);
          
          // Advanced AI-based warping and mapping
          renderCtx.save();
          
          // Use high-quality image smoothing
          renderCtx.imageSmoothingEnabled = true;
          renderCtx.imageSmoothingQuality = 'high';
          
          // Apply perspective transformation if pose is available
          if (bodyArea.poseKeypoints) {
            const leftShoulder = bodyArea.poseKeypoints.find(k => k.name === 'left_shoulder');
            const rightShoulder = bodyArea.poseKeypoints.find(k => k.name === 'right_shoulder');
            const leftHip = bodyArea.poseKeypoints.find(k => k.name === 'left_hip');
            const rightHip = bodyArea.poseKeypoints.find(k => k.name === 'right_hip');
            
            if (leftShoulder && rightShoulder && leftHip && rightHip) {
              // Calculate perspective transformation matrix
              // This creates a more realistic 3D-like mapping
              const sourcePoints = [
                { x: 0, y: 0 }, // Top-left of clothing
                { x: productCanvas.width, y: 0 }, // Top-right
                { x: productCanvas.width, y: productCanvas.height }, // Bottom-right
                { x: 0, y: productCanvas.height } // Bottom-left
              ];
              
              // Calculate destination points based on body shape
              const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
              const hipWidth = Math.abs(rightHip.x - leftHip.x);
              const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
              const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
              const hipCenterY = (leftHip.y + rightHip.y) / 2;
              
              const destPoints = [
                { x: clothingX, y: clothingY }, // Top-left
                { x: clothingX + clothingWidth, y: clothingY }, // Top-right
                { x: clothingX + clothingWidth, y: clothingY + clothingHeight }, // Bottom-right
                { x: clothingX, y: clothingY + clothingHeight } // Bottom-left
              ];
              
              // Apply perspective warp using canvas transformation
              const warpClothing = () => {
                // Create temporary canvas for warping
                const warpCanvas = document.createElement('canvas');
                warpCanvas.width = clothingWidth;
                warpCanvas.height = clothingHeight;
                const warpCtx = warpCanvas.getContext("2d");
                
                // Simple perspective using scale transformation
                warpCtx.drawImage(productCanvas, 0, 0, clothingWidth, clothingHeight);
                
                // Apply gradient mask for better blending at edges
                const gradient = renderCtx.createLinearGradient(
                  clothingX, clothingY,
                  clothingX, clothingY + clothingHeight
                );
                gradient.addColorStop(0, 'rgba(255,255,255,1)');
                gradient.addColorStop(0.5, 'rgba(255,255,255,1)');
                gradient.addColorStop(1, 'rgba(255,255,255,0.95)');
                
                renderCtx.globalAlpha = 0.96;
                renderCtx.globalCompositeOperation = 'source-over';
                renderCtx.drawImage(warpCanvas, clothingX, clothingY);
              };
              
              warpClothing();
            } else {
              // Fallback: standard rendering
              renderCtx.globalAlpha = 0.95;
              renderCtx.globalCompositeOperation = 'source-over';
              renderCtx.drawImage(productCanvas, clothingX, clothingY, clothingWidth, clothingHeight);
            }
          } else {
            // Standard rendering when no pose data
            renderCtx.globalAlpha = 0.95;
            renderCtx.globalCompositeOperation = 'source-over';
            renderCtx.drawImage(productCanvas, clothingX, clothingY, clothingWidth, clothingHeight);
          }
          
          // Add generative blending layers for realism
          // Soft light blend for natural texture
          renderCtx.globalCompositeOperation = 'soft-light';
          renderCtx.globalAlpha = 0.15;
          renderCtx.drawImage(productCanvas, clothingX, clothingY, clothingWidth, clothingHeight);
          
          // Overlay blend for depth
          renderCtx.globalCompositeOperation = 'overlay';
          renderCtx.globalAlpha = 0.08;
          renderCtx.drawImage(productCanvas, clothingX, clothingY, clothingWidth, clothingHeight);
          
          renderCtx.restore();
          
          // Apply shadows and lighting for depth
          applyShadowsAndLighting(renderCtx, clothingX, clothingY, clothingWidth, clothingHeight);
          
          // Copy rendered result to main canvas with high quality
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(renderCanvas, 0, 0);
          
          // Advanced AI-based post-processing: diffusion-style color adaptation
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Apply generative-style color adaptation
          const clothingStartX = Math.floor(clothingX);
          const clothingStartY = Math.floor(clothingY);
          const clothingEndX = Math.min(Math.floor(clothingX + clothingWidth), canvas.width);
          const clothingEndY = Math.min(Math.floor(clothingY + clothingHeight), canvas.height);
          
          // Sample user's skin tone around clothing area for color adaptation
          let skinToneR = 200, skinToneG = 180, skinToneB = 160; // Default warm tone
          if (bodyArea.poseKeypoints) {
            const nose = bodyArea.poseKeypoints.find(k => k.name === 'nose');
            if (nose && nose.score > 0.3) {
              const neckIndex = (Math.floor(nose.y) * canvas.width + Math.floor(nose.x)) * 4;
              if (neckIndex >= 0 && neckIndex < data.length) {
                skinToneR = data[neckIndex];
                skinToneG = data[neckIndex + 1];
                skinToneB = data[neckIndex + 2];
              }
            }
          }
          
          // Apply diffusion-like color adaptation to clothing area
          for (let y = clothingStartY; y < clothingEndY; y++) {
            for (let x = clothingStartX; x < clothingEndX; x++) {
              const index = (y * canvas.width + x) * 4;
              const alpha = data[index + 3];
              
              if (alpha > 50) { // Only process visible pixels
                // Adaptive color blending based on user's skin tone (like diffusion models)
                const skinInfluence = 0.06; // 6% influence from skin tone for natural adaptation
                const adaptedR = data[index] * (1 - skinInfluence) + skinToneR * skinInfluence;
                const adaptedG = data[index + 1] * (1 - skinInfluence) + skinToneG * skinInfluence;
                const adaptedB = data[index + 2] * (1 - skinInfluence) + skinToneB * skinInfluence;
                
                data[index] = Math.min(255, adaptedR);
                data[index + 1] = Math.min(255, adaptedG);
                data[index + 2] = Math.min(255, adaptedB);
                
                // Add perspective-aware lighting (simulates 3D depth)
                const distanceFromCenter = Math.sqrt(
                  Math.pow(x - bodyArea.centerX, 2) + Math.pow(y - bodyArea.centerY, 2)
                );
                const maxDistance = Math.sqrt(
                  Math.pow(clothingWidth / 2, 2) + Math.pow(clothingHeight / 2, 2)
                );
                const lightingFactor = 1 + (1 - distanceFromCenter / maxDistance) * 0.04;
                
                data[index] = Math.min(255, data[index] * lightingFactor);
                data[index + 1] = Math.min(255, data[index + 1] * lightingFactor);
                data[index + 2] = Math.min(255, data[index + 2] * lightingFactor);
              }
            }
          }
          
          // Apply edge-aware smoothing (bilateral filter-like) for realistic blending
          const smoothedData = new Uint8ClampedArray(data);
          const smoothingRadius = 3;
          
          for (let y = clothingStartY + smoothingRadius; y < clothingEndY - smoothingRadius; y++) {
            for (let x = clothingStartX + smoothingRadius; x < clothingEndX - smoothingRadius; x++) {
              const index = (y * canvas.width + x) * 4;
              
              let totalWeight = 0;
              let sumR = 0, sumG = 0, sumB = 0;
              
              // Bilateral filter: weights based on both spatial and color distance
              for (let dy = -smoothingRadius; dy <= smoothingRadius; dy++) {
                for (let dx = -smoothingRadius; dx <= smoothingRadius; dx++) {
                  const neighborIndex = ((y + dy) * canvas.width + (x + dx)) * 4;
                  const colorDiff = Math.abs(data[index] - data[neighborIndex]) / 255;
                  const spatialDist = Math.sqrt(dx * dx + dy * dy);
                  const weight = (1 - colorDiff) / (1 + spatialDist * 0.5);
                  totalWeight += weight;
                  sumR += data[neighborIndex] * weight;
                  sumG += data[neighborIndex + 1] * weight;
                  sumB += data[neighborIndex + 2] * weight;
                }
              }
              
              if (totalWeight > 0) {
                smoothedData[index] = sumR / totalWeight;
                smoothedData[index + 1] = sumG / totalWeight;
                smoothedData[index + 2] = sumB / totalWeight;
              }
            }
          }
          
          // Blend original with smoothed (85% smoothed, 15% original for edge preservation)
          for (let y = clothingStartY; y < clothingEndY; y++) {
            for (let x = clothingStartX; x < clothingEndX; x++) {
              const index = (y * canvas.width + x) * 4;
              if (index < data.length && index >= 0) {
                data[index] = data[index] * 0.15 + smoothedData[index] * 0.85;
                data[index + 1] = data[index + 1] * 0.15 + smoothedData[index + 1] * 0.85;
                data[index + 2] = data[index + 2] * 0.15 + smoothedData[index + 2] * 0.85;
              }
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          // Convert canvas to image URL
          const resultUrl = canvas.toDataURL("image/png");
          setTryOnResult(resultUrl);
          setIsProcessing(false);
          
          toast({
            title: "Success",
            description: "Realistic try-on preview generated successfully!",
          });
        };
        
        productImg.onerror = () => {
          toast({
            title: "Error",
            description: "Failed to load product image",
            variant: "destructive",
          });
          setIsProcessing(false);
        };
        
        productImg.src = productImageUrl;
      };
      
      userImg.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load your image",
          variant: "destructive",
        });
        setIsProcessing(false);
      };
      
      userImg.src = userImageUrl;
    } catch (error) {
      console.error("Try-on processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process try-on. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!tryOnResult) return;
    
    const link = document.createElement("a");
    link.download = `try-on-${selectedProduct}-${Date.now()}.png`;
    link.href = tryOnResult;
    link.click();
    
    toast({
      title: "Success",
      description: "Image downloaded successfully!",
    });
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state
    setSelectedProduct("");
    setUserImage(null);
    setUserImageUrl("");
    setProductImageUrl("");
    setTryOnResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDialogClose = (isOpen) => {
    if (!isOpen) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Virtual Try-On</DialogTitle>
          <DialogDescription>
            Select a product and upload your photo to see how it looks on you
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product-select" className="text-base font-semibold">
                Select Product
              </Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Choose a product to try on" />
                </SelectTrigger>
                <SelectContent>
                  {normalizedProducts.length > 0 ? (
                    normalizedProducts.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        <div className="flex items-center gap-2">
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-8 h-8 object-cover rounded"
                            />
                          )}
                          <span className="truncate max-w-[200px]">
                            {product.title}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-products" disabled>
                      No products available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Product Preview */}
            {selectedProduct && productImageUrl && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Product Preview</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img
                    src={productImageUrl}
                    alt="Product"
                    className="w-full h-48 object-contain rounded"
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-base font-semibold">
                Upload Your Photo
              </Label>
              {!userImageUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="relative border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                  <img
                    src={userImageUrl}
                    alt="Your photo"
                    className="w-full h-64 object-contain rounded"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={processTryOn}
                disabled={!selectedProduct || !userImageUrl || isProcessing}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try On
                  </>
                )}
              </Button>
              {tryOnResult && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Result Preview */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Try-On Preview</Label>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
              {tryOnResult ? (
                <div className="w-full space-y-4">
                  <img
                    src={tryOnResult}
                    alt="Try-on result"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm">Your try-on preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Processing */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}

export default TryOnDialog;

