# Phan quyen trong he thong quan ly tai khoan user

### Middleware handle:
```js
const checkPermission = (resourceSlug, action) => {
  return async (req, res, next) => {
    const account = await Account.findById(req.user.id)
      .populate("userId")
      .populate({
        path: "role",
        populate: { path: "grants.resource" }
      });

    // Kiểm tra quyền từ Role
    const hasPermission = account.role.grants.some(grant => 
      grant.resource.slug === resourceSlug && 
      grant.actions.includes(action)
    );

    if (!hasPermission) return res.status(403).json({ error: "Forbidden" });
    next();
  };
};
```