// This worker handles video processing tasks to prevent UI freezes

// Import FFmpeg
importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.10.1/dist/ffmpeg.min.js');
const { createFFmpeg, fetchFile } = FFmpeg;

let ffmpeg = null;

// Initialize FFmpeg
const initFFmpeg = async () => {
  if (ffmpeg) return;
  
  ffmpeg = createFFmpeg({
    log: true,
    progress: ({ ratio }) => {
      self.postMessage({ type: 'progress', data: Math.round(ratio * 100) });
    }
  });
  
  try {
    await ffmpeg.load();
    self.postMessage({ type: 'loaded' });
  } catch (error) {
    self.postMessage({ type: 'error', data: 'Failed to load FFmpeg' });
  }
};

// Process messages from the main thread
self.onmessage = async (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'init':
      await initFFmpeg();
      break;
      
    case 'convert':
      await handleConversion(data);
      break;
      
    case 'createGif':
      await handleGifCreation(data);
      break;
      
    case 'trimVideo':
      await handleVideoTrimming(data);
      break;
      
    case 'watermarkVideo':
      await handleWatermarking(data);
      break;
      
    default:
      self.postMessage({ 
        type: 'error', 
        data: `Unknown command: ${type}` 
      });
  }
};

// Handle video conversion (MOV to MP4)
const handleConversion = async ({ inputFile, outputName, options }) => {
  try {
    // Write the input file to memory
    ffmpeg.FS('writeFile', inputFile.name, await fetchFile(inputFile));
    
    // Build the FFmpeg command
    const args = [
      '-i', inputFile.name,
      '-c:v', 'libx264',
      '-preset', 'medium'
    ];
    
    // Add bitrate if specified
    if (options.bitrate) {
      args.push('-b:v', options.bitrate);
    }
    
    // Add output filename
    args.push(outputName);
    
    // Run the FFmpeg command
    await ffmpeg.run(...args);
    
    // Read the output file
    const data = ffmpeg.FS('readFile', outputName);
    
    // Clean up
    ffmpeg.FS('unlink', inputFile.name);
    ffmpeg.FS('unlink', outputName);
    
    // Send the processed file back to the main thread
    self.postMessage({
      type: 'complete',
      data: {
        file: new Uint8Array(data.buffer),
        name: outputName,
        mimeType: 'video/mp4'
      }
    });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      data: `Conversion failed: ${error.message}` 
    });
  }
};

// Handle GIF creation
const handleGifCreation = async ({ inputFile, outputName, options }) => {
  try {
    // Write the input file to memory
    ffmpeg.FS('writeFile', inputFile.name, await fetchFile(inputFile));
    
    // Build the FFmpeg command
    const args = [
      '-i', inputFile.name,
      '-ss', options.startTime.toString(),
      '-t', options.duration.toString(),
      '-vf', `fps=${options.fps},scale=${options.width}:${options.height}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`
    ];
    
    // Add output filename
    args.push(outputName);
    
    // Run the FFmpeg command
    await ffmpeg.run(...args);
    
    // Read the output file
    const data = ffmpeg.FS('readFile', outputName);
    
    // Clean up
    ffmpeg.FS('unlink', inputFile.name);
    ffmpeg.FS('unlink', outputName);
    
    // Send the processed file back to the main thread
    self.postMessage({
      type: 'complete',
      data: {
        file: new Uint8Array(data.buffer),
        name: outputName,
        mimeType: 'image/gif'
      }
    });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      data: `GIF creation failed: ${error.message}` 
    });
  }
};

// Handle video trimming
const handleVideoTrimming = async ({ inputFile, outputName, options }) => {
  try {
    // Write the input file to memory
    ffmpeg.FS('writeFile', inputFile.name, await fetchFile(inputFile));
    
    // Build the FFmpeg command
    const args = [
      '-i', inputFile.name,
      '-ss', options.startTime.toString(),
      '-to', options.endTime.toString(),
      '-c', 'copy'  // Use copy mode for faster processing
    ];
    
    // If converting to MP4, use appropriate codec
    if (options.convertToMp4) {
      args[args.length - 1] = 'libx264';  // Replace 'copy' with 'libx264'
      args.push('-preset', 'fast');
    }
    
    // Add output filename
    args.push(outputName);
    
    // Run the FFmpeg command
    await ffmpeg.run(...args);
    
    // Read the output file
    const data = ffmpeg.FS('readFile', outputName);
    
    // Clean up
    ffmpeg.FS('unlink', inputFile.name);
    ffmpeg.FS('unlink', outputName);
    
    // Determine MIME type based on output filename
    const mimeType = outputName.endsWith('.mp4') ? 'video/mp4' : 
                    (outputName.endsWith('.mov') ? 'video/quicktime' : 'video/mp4');
    
    // Send the processed file back to the main thread
    self.postMessage({
      type: 'complete',
      data: {
        file: new Uint8Array(data.buffer),
        name: outputName,
        mimeType
      }
    });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      data: `Video trimming failed: ${error.message}` 
    });
  }
};

// Handle video watermarking
const handleWatermarking = async ({ inputFile, watermarkFile, outputName, options }) => {
  try {
    // Write the input file to memory
    ffmpeg.FS('writeFile', inputFile.name, await fetchFile(inputFile));
    
    let filterComplex = '';
    
    if (options.type === 'text') {
      // Text watermark
      const escapedText = options.text.replace(/'/g, "'\\''");
      const fontColor = options.color.replace('#', '0x');
      
      filterComplex = `drawtext=text='${escapedText}':fontsize=${options.fontSize}:fontcolor=${fontColor}:alpha=${options.opacity}:x=${options.position.x}:y=${options.position.y}`;
    } else {
      // Image watermark
      ffmpeg.FS('writeFile', 'watermark.png', await fetchFile(watermarkFile));
      
      filterComplex = `overlay=${options.position.x}:${options.position.y}:alpha=${options.opacity}`;
    }
    
    // Build the FFmpeg command
    const args = [
      '-i', inputFile.name
    ];
    
    if (options.type === 'image') {
      args.push('-i', 'watermark.png');
    }
    
    args.push(
      '-vf', filterComplex,
      '-c:a', 'copy',
      outputName
    );
    
    // Run the FFmpeg command
    await ffmpeg.run(...args);
    
    // Read the output file
    const data = ffmpeg.FS('readFile', outputName);
    
    // Clean up
    ffmpeg.FS('unlink', inputFile.name);
    if (options.type === 'image') {
      ffmpeg.FS('unlink', 'watermark.png');
    }
    ffmpeg.FS('unlink', outputName);
    
    // Send the processed file back to the main thread
    self.postMessage({
      type: 'complete',
      data: {
        file: new Uint8Array(data.buffer),
        name: outputName,
        mimeType: 'video/mp4'
      }
    });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      data: `Watermarking failed: ${error.message}` 
    });
  }
};