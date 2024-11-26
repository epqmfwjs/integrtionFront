// websocketUtils.js

// 설정
export const PREDICTION_CONFIG = {
    // 위치 관련 설정
    maxPredictionError: 3,
    rubberbandThreshold: 5,
    minUpdateInterval: 32,
    maxUpdateInterval: 64,
    
    // 네트워크 관련 설정
    maxQueueSize: 10,
    reconnectInterval: 5000,
    
    // 보간 관련 설정
    positionSmoothing: 0.3,
    rotationSmoothing: 0.3,
    interpolationSpeed: 0.3,
    
    // 성능 관련 설정  
    batchSize: 3,
    cleanupInterval: 30000
  };
  
  // 회전 보간 처리
  export const predictAndInterpolateRotation = (currentRotation, targetRotation, confidence) => {
    let rotationDiff = targetRotation - currentRotation;
    
    if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
    if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
    
    const interpolatedRotation = currentRotation + (rotationDiff * PREDICTION_CONFIG.rotationSmoothing * confidence);
  
    return {
      rotation: interpolatedRotation
    };
  };
  
  // 네트워크 파라미터 업데이트
  export const updateNetworkParams = (rtt) => {
    return Math.min(
      PREDICTION_CONFIG.maxUpdateInterval,
      Math.max(PREDICTION_CONFIG.minUpdateInterval, rtt)
    );
  };
  
  // RAF 기반 업데이트 스케줄러
  let rafScheduled = false;
  export const scheduleUpdate = (callback) => {
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(() => {
        callback();
        rafScheduled = false;
      });
    }
  };
  
  // 성능 모니터 클래스
  export class PerformanceMonitor {
    constructor() {
      this.metrics = {
        fps: [],
        rtt: [],
        updateTimes: []
      };
    }
  
    addMetric(type, value) {
      if (!this.metrics[type]) {
        this.metrics[type] = [];
      }
  
      this.metrics[type].push({
        value,
        timestamp: Date.now()
      });
      
      // 오래된 메트릭 정리
      if (this.metrics[type].length > 100) {
        this.metrics[type] = this.metrics[type].slice(-100);
      }
    }
  
    getAverageMetric(type) {
      const values = this.metrics[type].map(m => m.value);
      return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }
  
    getErrorRate() {
      const errors = this.metrics.error || [];
      const total = Object.values(this.metrics).reduce((sum, arr) => sum + arr.length, 0);
      return total ? errors.length / total : 0;
    }
  
    cleanup() {
      const now = Date.now();
      Object.keys(this.metrics).forEach(key => {
        this.metrics[key] = this.metrics[key].filter(m => 
          now - m.timestamp < PREDICTION_CONFIG.cleanupInterval
        );
      });
    }
  }
  
  // 연결 관리자 클래스
  export class ConnectionManager {
    constructor(config) {
      this.config = config;
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    }
  
    async connect(connectFn) {
      if (this.isConnecting) return;
      
      try {
        this.isConnecting = true;
        await connectFn();
        this.reconnectAttempts = 0;
      } catch (error) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
        await this.connect(connectFn);
      } finally {
        this.isConnecting = false;
      }
    }
  }
  
  // 데이터 최적화 유틸리티
  export const optimizeDataForTransport = (data) => {
    return {
      nickname: data.nickname,
      position: compressPosition(data.position),
      currentAnimation: data.currentAnimation || 'Stop',
      rotation: data.rotation || 0,
      characterId: data.characterId || 1,
      modelPath: data.modelPath,  // modelPath 전달 유지
      timestamp: Date.now()
    };
  };
  
  export const parseTransportData = (data) => {
    const parsedPlayers = {};
    
    Object.entries(data).forEach(([nickname, playerData]) => {
      // null 체크 추가
      if (!playerData) return;
  
      parsedPlayers[nickname] = {
        nickname: playerData.nickname || nickname,
        position: playerData.position || [0, 0, 0],
        currentAnimation: playerData.currentAnimation || 'Stop',
        rotation: playerData.rotation || 0,
        characterId: playerData.characterId || 1,
        modelPath: playerData.modelPath || '/models/character1.glb',
        timestamp: playerData.timestamp || Date.now()
      };
    });
    
    return parsedPlayers;
  };
  
  // 오래된 데이터 정리
  export const cleanupStaleData = (refs, maxAge) => {
    const now = Date.now();
    Object.entries(refs).forEach(([key, data]) => {
      if (now - data.timestamp > maxAge) {
        delete refs[key];
      }
    });
  };

  export const createThrottle = (delay) => {
    let lastRun = 0;
    let timeout = null;
    
    return (fn, immediate = false) => {
      const now = Date.now();
      
      if (immediate && now - lastRun >= delay) {
        lastRun = now;
        fn();
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (now - lastRun >= delay) {
            lastRun = now;
            fn();
          }
        }, delay);
      }
    };
  };
  
  // 위치 데이터 압축
  export const compressPosition = (pos) => {
    if (!Array.isArray(pos)) return pos;
    return pos.map(coord => Math.round(coord * 100) / 100);
  };
  
  // 에러 처리
  export const handleError = async (fn, maxRetries = 3) => {
    let retryCount = 0;
    while (retryCount < maxRetries) {
      try {
        await fn();
        break;
      } catch (e) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error('Max retries exceeded');
        }
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * retryCount)
        );
      }
    }
  };