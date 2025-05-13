class FFmpegService {
  constructor() {
    this.worker = null;
    this.callbacks = {};
    this.isInitialized = false;
  }

  init() {
    if (this.worker) return Promise.resolve();

    return new Promise((resolve, reject) => {
      this.worker = new Worker(new URL('../workers/ffmpeg.worker.js', import.meta.url), { type: 'module' });
      
      this.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        
        if (type === 'INIT_DONE') {
          this.isInitialized = true;
          resolve();
        } else if (type === 'ERROR') {
          if (this.callbacks[payload.command]?.reject) {
            this.callbacks[payload.command].reject(new Error(payload.message));
            delete this.callbacks[payload.command];
          } else {
            reject(new Error(payload.message));
          }
        } else if (this.callbacks[type]) {
          this.callbacks[type].resolve(payload);
          delete this.callbacks[type];
        }
      };
      
      this.worker.onerror = (error) => {
        reject(error);
      };
      
      this.worker.postMessage({ type: 'INIT' });
    });
  }

  convertMovToMp4(videoFile, bitrate) {
    return this._postMessage('CONVERT_MOV_TO_MP4', { videoFile, bitrate }, 'CONVERT_DONE');
  }

  createGif(videoFile, startTime, duration, fps, resolution, loop) {
    return this._postMessage('CREATE_GIF', { videoFile, startTime, duration, fps, resolution, loop }, 'GIF_DONE');
  }

  trimVideo(videoFile, startTime, endTime, outputFormat) {
    return this._postMessage('TRIM_VIDEO', { videoFile, startTime, endTime, outputFormat }, 'TRIM_DONE');
  }

  addWatermark(videoFile, watermarkType, watermarkData, position, opacity, scale) {
    return this._postMessage('ADD_WATERMARK', { videoFile, watermarkType, watermarkData, position, opacity, scale }, 'WATERMARK_DONE');
  }

  _postMessage(type, payload, responseType) {
    if (!this.isInitialized) {
      return Promise.reject(new Error('FFmpeg is not initialized'));
    }
    
    return new Promise((resolve, reject) => {
      this.callbacks[responseType] = { resolve, reject };
      this.worker.postMessage({ type, payload });
    });
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export default new FFmpegService();