Dưới đây là một danh sách các bài tập thực hành để rèn luyện việc sử dụng **Redis CLI**. Các bài tập sẽ bao gồm nhiều thao tác cơ bản và nâng cao, từ việc làm quen với các lệnh đến việc áp dụng chúng trong các tình huống thực tế.

---

### **1. Bài tập cơ bản**

1. **Thiết lập giá trị cơ bản**

   - Tạo một key tên là `user:name` với giá trị là `Alice`.
   - Đọc giá trị của `user:name` từ Redis.
   - Cập nhật giá trị của `user:name` thành `Bob`.
   - Xóa key `user:name`.

2. **Thao tác với nhiều kiểu dữ liệu**

   - Tạo một danh sách (`list`) với tên `tasks` và thêm vào các giá trị: `task1`, `task2`, `task3`.
   - Lấy giá trị đầu tiên và cuối cùng trong danh sách `tasks`.
   - Xóa danh sách `tasks`.

3. **Sử dụng hash**

   - Tạo một hash tên `user:1001` với các trường:
     - `name: John`
     - `age: 30`
     - `email: john@example.com`
   - Đọc tất cả các trường trong hash.
   - Chỉ đọc trường `email` trong hash.
   - Cập nhật `age` thành `31`.

4. **Tập hợp (Set)**

   - Tạo một set tên là `online_users` với các giá trị: `user1`, `user2`, `user3`.
   - Kiểm tra xem `user1` có trong set không.
   - Xóa `user3` khỏi set.

5. **Thao tác với expiration (TTL)**
   - Tạo một key tên `temp_key` với giá trị `12345` và đặt thời gian sống là 60 giây.
   - Kiểm tra thời gian sống còn lại của `temp_key`.
   - Đợi 60 giây và xác nhận key đã hết hạn.

---

### **2. Bài tập nâng cao**

1. **Thao tác trên sorted set**

   - Tạo một sorted set tên `leaderboard` với các giá trị:
     - `player1` (điểm: 100)
     - `player2` (điểm: 200)
     - `player3` (điểm: 150)
   - Lấy danh sách các người chơi theo thứ tự điểm từ cao xuống thấp.
   - Cập nhật điểm của `player1` thành 250 và kiểm tra thứ tự mới.

2. **Xử lý khóa với Pub/Sub**

   - Tạo một kênh (`channel`) tên là `notifications`.
   - Sử dụng **Redis CLI** để lắng nghe (subscribe) kênh `notifications`.
   - Gửi (publish) một thông báo tới kênh `notifications`.

3. **Pipeline**

   - Sử dụng **pipeline** trong Redis CLI để thực hiện các thao tác sau cùng lúc:
     - Tạo key `key1` với giá trị `value1`.
     - Tạo key `key2` với giá trị `value2`.
     - Lấy giá trị của cả hai key.

4. **Backup và khôi phục dữ liệu**

   - Dùng lệnh `SAVE` để tạo snapshot dữ liệu Redis hiện tại.
   - Xóa tất cả dữ liệu trong Redis bằng lệnh `FLUSHALL`.
   - Khôi phục dữ liệu từ snapshot vừa tạo.

5. **Thao tác với Lua script**
   - Viết một script Lua đơn giản để tăng giá trị của một key `counter` thêm 1 mỗi lần chạy.
   - Thực hiện script thông qua Redis CLI.

---

### **3. Bài tập tình huống thực tế**

1. **Quản lý phiên người dùng (Sessions)**

   - Giả sử bạn muốn lưu trữ các phiên người dùng trong Redis:
     - Tạo một key với tên `session:<session_id>` lưu thông tin JSON của người dùng.
     - Đặt thời gian sống cho mỗi phiên là 30 phút.

2. **Lưu trữ danh sách công việc chờ xử lý (Job Queue)**

   - Sử dụng danh sách (`list`) để tạo một hàng đợi tên `job_queue`.
   - Thêm vào hàng đợi các công việc `job1`, `job2`, `job3`.
   - Lấy và xóa công việc đầu tiên khỏi hàng đợi (FIFO).

3. **Xây dựng hệ thống cache**

   - Tạo một key tên `api_response` với giá trị là dữ liệu giả lập của một API.
   - Đặt thời gian sống cho key là 5 phút.
   - Sau 5 phút, kiểm tra và xác nhận key đã hết hạn.

4. **Thống kê số lượng truy cập (Page Views)**
   - Tạo một key tên `page_views` và đặt giá trị ban đầu là `0`.
   - Mỗi lần truy cập, tăng giá trị của `page_views` thêm 1.
   - Đọc giá trị hiện tại của `page_views`.

---

### **Hướng dẫn kiểm tra**

- Sau mỗi bài tập, bạn có thể dùng các lệnh như `KEYS *`, `SCAN`, `INFO` để kiểm tra lại các thao tác của mình.
- Nếu cần xóa toàn bộ dữ liệu để làm lại bài tập, sử dụng lệnh `FLUSHALL`.
