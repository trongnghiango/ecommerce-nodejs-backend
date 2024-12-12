/* eslint-disable max-classes-per-file */
class CircuitBreaker {
  constructor(threshold, resetTimeout) {
    this.threshold = threshold; // Ngưỡng lỗi
    this.resetTimeout = resetTimeout; // Thời gian đặt lại
    this.failureCount = 0; // Đếm số lần thất bại
    this.lastFailureTime = null; // Thời gian thất bại cuối
  }

  isOpen() {
    if (this.failureCount >= this.threshold) {
      if (Date.now() - this.lastFailureTime < this.resetTimeout) {
        return true; // Circuit đang mở
      } else {
        this.reset(); // Đặt lại circuit
      }
    }
    return false; // Circuit đang đóng
  }

  recordFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
  }

  reset() {
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}

class UserService {
  constructor() {
    this.circuitBreaker = new CircuitBreaker(3, 30000);
  }

  async getUserData(userId) {
    try {
      const response = await this.retryCall(() => this.callExternalService(userId));
      return [null, response];
    } catch (error) {
      return [error];
    }
  }

  async retryCall(callFunction, retries = 4) {
    let attempt = 0;

    while (attempt < retries) {
      try {
        return await callFunction();
      } catch (error) {
        this.circuitBreaker.recordFailure();
        console.log({ attempt });

        if (attempt >= retries) {
          throw error; // Ném lỗi để xử lý bên ngoài
        }

        attempt += 1; // Tăng số lần thử
        await this.delay(1000); // Chờ 1 giây trước khi thử lại
      }
    }
  }

  async callExternalService(userId) {
    // Mô phỏng gọi đến dịch vụ bên ngoài
    const isSuccess = Math.random() > 0.8; // 50% xác suất thành công
    if (!isSuccess) {
      throw new Error('External service error');
    }
    return { userId, name: 'John Doe' }; // Dữ liệu giả
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Ví dụ sử dụng
(async () => {
  const userService = new UserService();
  console.time('test');
  const [error, data] = await userService.getUserData(1);
  console.timeEnd('test');
  console.log({ error, data });
})();
