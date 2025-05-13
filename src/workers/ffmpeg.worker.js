/* eslint-disable no-restricted-globals */
import { createFFmpeg } from '@ffmpeg/ffmpeg';

let ffmpeg = null;

// Initialize FFmpeg
const initFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = createFFmpeg({
      log: true,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
    });
    await ffmpeg.load();
  }
  return ffmpeg;
};

// Process messages from main thread
self.onmessage = async (e) => {
  const { type, payload } = e.data;
  
  try {
    switch (type) {
      case 'INIT': {
        await initFFmpeg();
        self.postMessage({ type: 'INIT_DONE' });
        break;
      }
      
      case 'CONVERT_MOV_TO_MP4': {
        const { videoFile, bitrate } = payload;
        await initFFmpeg();
        
        // Write the file to memory
        ffmpeg.FS('writeFile', 'input.mov', await videoFile.arrayBuffer());
        
        // Convert to MP4 with specified bitrate
        await ffmpeg.run(
          '-i', 'input.mov',
          '-b:v', `${bitrate}k`,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-c:a', 'aac',
          '-f', 'mp4',
          'output.mp4'
        );
        
        // Read the result
        const data = ffmpeg.FS('readFile', 'output.mp4');
        
        // Clean up memory
        ffmpeg.FS('unlink', 'input.mov');
        ffmpeg.FS('unlink', 'output.mp4');
        
        self.postMessage({
          type: 'CONVERT_DONE',
          payload: {
            data: new Uint8Array(data.buffer),
            fileName: videoFile.name.replace('.mov', '.mp4')
          }
        });
        break;
      }
      
      case 'CREATE_GIF': {
        const { videoFile, startTime, duration, fps, resolution, loop } = payload;
        await initFFmpeg();
        
        // Write the file to memory
        ffmpeg.FS('writeFile', 'input.mp4', await videoFile.arrayBuffer());
        
        // Calculate scale based on resolution
        let scale = '';
        if (resolution === 'low') scale = 'scale=320:-1';
        else if (resolution === 'medium') scale = 'scale=640:-1';
        else scale = 'scale=1280:-1';
        
        // Create GIF
        await ffmpeg.run(
          '-i', 'input.mp4',
          '-ss', `${startTime}`,
          '-t', `${duration}`,
          '-vf', `${scale},fps=${fps}`,
          '-loop', loop ? '0' : '-1',
          'output.gif'
        );
        
        // Read the result
        const data = ffmpeg.FS('readFile', 'output.gif');
        
        // Clean up memory
        ffmpeg.FS('unlink', 'input.mp4');
        ffmpeg.FS('unlink', 'output.gif');
        
        self.postMessage({
          type: 'GIF_DONE',
          payload: {
            data: new Uint8Array(data.buffer),
            fileName: `${videoFile.name.split('.')[0]}_${startTime}_${duration}.gif`
          }
        });
        break;
      }
      
      case 'TRIM_VIDEO': {
        const { videoFile, startTime, endTime, outputFormat } = payload;
        await initFFmpeg();
        
        const extension = videoFile.name.split('.').pop();
        
        // Write the file to memory
        ffmpeg.FS('writeFile', `input.${extension}`, await videoFile.arrayBuffer());
        
        const outputExt = outputFormat === 'original' ? extension : 'mp4';
        const outputCodec = outputFormat === 'original' ? 'copy' : 'libx264';
        const audioCodec = outputFormat === 'original' ? 'copy' : 'aac';
        
        // Trim video
        await ffmpeg.run(
          '-i', `input.${extension}`,
          '-ss', `${startTime}`,
          '-to', `${endTime}`,
          '-c:v', outputCodec,
          '-c:a', audioCodec,
          '-avoid_negative_ts', 'make_zero',
          `output.${outputExt}`
        );
        
        // Read the result
        const data = ffmpeg.FS('readFile', `output.${outputExt}`);
        
        // Clean up memory
        ffmpeg.FS('unlink', `input.${extension}`);
        ffmpeg.FS('unlink', `output.${outputExt}`);
        
        self.postMessage({
          type: 'TRIM_DONE',
          payload: {
            data: new Uint8Array(data.buffer),
            fileName: `${videoFile.name.split('.')[0]}_trimmed.${outputExt}`
          }
        });
        break;
      }
      
      case 'ADD_WATERMARK': {
        const { videoFile, watermarkType, watermarkData, position, opacity, scale } = payload;
        await initFFmpeg();
        
        const extension = videoFile.name.split('.').pop();
        
        // Write the video file to memory
        ffmpeg.FS('writeFile', `input.${extension}`, await videoFile.arrayBuffer());
        
        let filterComplex = '';
        
        if (watermarkType === 'text') {
          const { text, font, color, size } = watermarkData;
          
          // Create text watermark
          filterComplex = `drawtext=text='${text}':fontfile=${font}:fontcolor=${color}:fontsize=${size}:`;
          
          // Position
          switch (position) {
            case 'top-left':
              filterComplex += 'x=10:y=10';
              break;
            case 'top-right':
              filterComplex += 'x=w-text_w-10:y=10';
              break;
            case 'bottom-left':
              filterComplex += 'x=10:y=h-text_h-10';
              break;
            case 'bottom-right':
              filterComplex += 'x=w-text_w-10:y=h-text_h-10';
              break;
            case 'center':
              filterComplex += 'x=(w-text_w)/2:y=(h-text_h)/2';
              break;
            default:
              filterComplex += 'x=10:y=10';
          }
          
          // Add opacity
          filterComplex += `:alpha=${opacity/100}`;
          
        } else {
          // Image watermark
          const { imageFile, x, y } = watermarkData;
          
          // Write the watermark image to memory
          ffmpeg.FS('writeFile', 'watermark.png', await imageFile.arrayBuffer());
          
          // Create overlay filter
          filterComplex = `[0:v][1:v] overlay=`;
          
          // Position
          if (x !== undefined && y !== undefined) {
            // Custom position
            filterComplex += `x=${x}:y=${y}`;
          } else {
            // Predefined position
            switch (position) {
              case 'top-left':
                filterComplex += 'x=10:y=10';
                break;
              case 'top-right':
                filterComplex += 'x=W-w-10:y=10';
                break;
              case 'bottom-left':
                filterComplex += 'x=10:y=H-h-10';
                break;
              case 'bottom-right':
                filterComplex += 'x=W-w-10:y=H-h-10';
                break;
              case 'center':
                filterComplex += 'x=(W-w)/2:y=(H-h)/2';
                break;
              default:
                filterComplex += 'x=10:y=10';
            }
          }
          
          // Add scale and opacity
          filterComplex += `:format=auto:scale=${scale}:alpha=${opacity/100}`;
        }
        
        // Apply watermark
        if (watermarkType === 'text') {
          await ffmpeg.run(
            '-i', `input.${extension}`,
            '-vf', filterComplex,
            '-c:a', 'copy',
            `output.${extension}`
          );
        } else {
          await ffmpeg.run(
            '-i', `input.${extension}`,
            '-i', 'watermark.png',
            '-filter_complex', filterComplex,
            '-c:a', 'copy',
            `output.${extension}`
          );
          
          // Clean up watermark file
          ffmpeg.FS('unlink', 'watermark.png');
        }
        
        // Read the result
        const data = ffmpeg.FS('readFile', `output.${extension}`);
        
        // Clean up memory
        ffmpeg.FS('unlink', `input.${extension}`);
        ffmpeg.FS('unlink', `output.${extension}`);
        
        self.postMessage({
          type: 'WATERMARK_DONE',
          payload: {
            data: new Uint8Array(data.buffer),
            fileName: `${videoFile.name.split('.')[0]}_watermarked.${extension}`
          }
        });
        break;
      }
      
      default:
        throw new Error(`Unknown command: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: {
        message: error.message,
        command: type
      }
    });
  }
};