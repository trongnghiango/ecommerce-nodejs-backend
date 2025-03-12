# Quản lý `Account` model
Dưới đây là nội dung câu trả lời được đặt tiêu đề rõ ràng để dễ theo dõi:

---

### **1. Phân Tích Hai Cách Tiếp Cận**

#### **Cách 1: Dùng Nhiều Trường Tham Chiếu (adminId, shopId, customerId)**

```javascript
const accountSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["Admin", "Shop", "User", "Customer"] },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
});
```

##### **Ưu Điểm**

- **Trực quan**: Dễ hiểu vì mỗi role có trường tham chiếu riêng.
- **Truy vấn đơn giản**: Populate dữ liệu theo trường cụ thể.
  ```javascript
  const account = await Account.findOne({ email }).populate("adminId");
  ```

##### **Nhược Điểm**

- **Dữ liệu thừa**: Nhiều trường `null` (ví dụ: tài khoản Admin chỉ có `adminId`, các trường khác là `null`).
- **Khó mở rộng**: Thêm role mới yêu cầu sửa schema (ví dụ: thêm `managerId`).
- **Validation phức tạp**: Cần middleware để kiểm tra tính hợp lệ của các trường.

---

#### **Cách 2: Dùng `refPath` Với Một Trường Tham Chiếu Chung (userId)**

```javascript
const accountSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["Admin", "Shop", "User", "Customer"] },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "role", // Tự động tham chiếu dựa trên giá trị của `role`
  },
});
```

##### **Ưu Điểm**

- **Schema gọn gàng**: Chỉ một trường `userId` thay vì nhiều trường.
- **Dễ mở rộng**: Thêm role mới chỉ cần cập nhật enum `role`, không cần sửa schema.
- **Truy vấn linh hoạt**: Tự động populate dữ liệu dựa trên `role`.
  ```javascript
  const account = await Account.findOne({ email }).populate("userId");
  ```

##### **Nhược Điểm**

- **Phụ thuộc vào `role`**: Giá trị `role` phải khớp tên model (ví dụ: `role: "Shop"` → Model `Shop`).
- **Kiểm tra tính hợp lệ**: Cần đảm bảo `userId` tham chiếu đến document tồn tại.

---

### **2. Lựa Chọn Tối Ưu: Cách 2 (Dùng `refPath`)**

#### **Lý Do Chi Tiết**

1. **Tính Linh Hoạt**

   - Thêm role mới (ví dụ: `Manager`) chỉ cần mở rộng enum `role` và tạo model `Manager`, **không cần sửa schema Account**.
   - Cách 1 yêu cầu thêm trường mới (ví dụ: `managerId`), gây phức tạp.

2. **Hiệu Suất Lưu Trữ**

   - Cách 2 tránh lãng phí bộ nhớ cho các trường `null` như Cách 1.

3. **Truy Vấn Đơn Giản**

   - Chỉ cần dùng một lệnh `populate('userId')` cho mọi trường hợp, không cần kiểm tra `role`.

4. **Tính Thống Nhất**
   - Ràng buộc chặt chẽ giữa `role` và model tham chiếu, giảm rủi ro lỗi logic.

---

### **3. Ví Dụ Thực Tế**

#### **Tạo Tài Khoản Với `refPath`**

```javascript
// Định nghĩa model
const Account = mongoose.model("Account", accountSchema);
const Shop = mongoose.model("Shop", shopSchema);

// Tạo Shop và Account
const newShop = new Shop({ name: "Tech Store" });
await newShop.save();

const account = new Account({
  email: "shop@example.com",
  password: "hashed_password",
  role: "Shop",
  userId: newShop._id, // Tham chiếu đến Shop
});
await account.save();

// Truy vấn và populate tự động
const foundAccount = await Account.findOne({
  email: "shop@example.com",
}).populate("userId"); // Tự động lấy dữ liệu Shop
```

---

### **4. Kết Luận**

- **Chọn Cách 2 (`refPath`) khi**:

  - Ưu tiên **tính linh hoạt** và **dễ bảo trì**.
  - Muốn tránh **dư thừa dữ liệu**.
  - Cần **mở rộng hệ thống** trong tương lai.

- **Chỉ dùng Cách 1 nếu**:
  - Các role có **nghiệp vụ khác biệt** và cần tách biệt hoàn toàn.
  - Đòi hỏi **truy vấn riêng biệt** từng role thường xuyên.

---

Hy vọng cách trình bày có tiêu đề này giúp bạn dễ nắm bắt thông tin! 😊
