const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Role'
const COLLECTION_NAME = 'roles'

const grantList = [
  { role: 'admin', resource: 'profile', action: 'update:any', attributes: '*'},
  { role: 'admin', resource: 'profile', action: 'update:any', attributes: '*'},

  { role: 'admin', resource: 'profile', action: 'update:any', attributes: '*'},
  { role: 'admin', resource: 'profile', action: 'update:any', attributes: '*'},
  { role: 'admin', resource: 'profile', action: 'update:any', attributes: '*'},
]

const roleSchema = new Schema(
  {
    rol_name: { type: String, default: 'user', enum: ['user', 'shop', 'admin'] },
    rol_slug: { type: String, required: true },
    rol_status: { type: String, enum: ['active', 'block', 'pending'] },
    rol_description: { type: String, default: '' },
    rol_grants: [
      {
        resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
        actions: [{ type: String, required: true }],
        attributes: { type: String, default: '*' },
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
)
module.exports = model(DOCUMENT_NAME, roleSchema)
