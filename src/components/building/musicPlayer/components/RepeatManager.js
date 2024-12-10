class RepeatManager {
    constructor() {
      // 초기 상태 로드
      this.loadState();
    }
  
    loadState() {
      try {
        this.isRepeatOn = JSON.parse(localStorage.getItem('metaverse_is_repeat') || 'false');
      } catch (error) {
        console.error('Failed to load repeat state:', error);
        this.isRepeatOn = false;
      }
    }
  
    getRepeatState() {
      return this.isRepeatOn;
    }
  
    toggleRepeat() {
      this.isRepeatOn = !this.isRepeatOn;
      localStorage.setItem('metaverse_is_repeat', JSON.stringify(this.isRepeatOn));
      return this.isRepeatOn;
    }
  }
  
  // 싱글톤 인스턴스 생성 및 내보내기
  export const repeatManager = new RepeatManager();