const AccessControl = require('accesscontrol');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger.util');
// const { db, rolesTable, permissionsTable, rolePermissionsTable } = require('../databases/drizzle'); // Uncomment for DB option
// const { eq } = require('drizzle-orm'); // Uncomment for DB option

/**
 * AccessControl instance.
 * @type {AccessControl | undefined}
 */
let ac;

/**
 * @typedef {Object} GrantItem
 * @property {string} role - The role name.
 * @property {string} [resource] - The resource name (optional if defining inheritance).
 * @property {string} [action] - The action (e.g., 'create:own', 'read:any') (optional if defining inheritance).
 * @property {string} [attributes] - The attributes (e.g., '*', '!password').
 * @property {string[]} [inherits] - Array of roles this role inherits from.
 */

/**
 * Loads grants from the JSON configuration file.
 * @private
 * @returns {GrantItem[]} The list of grant items.
 * @throws {Error} If the grants file cannot be read or parsed.
 */
function _loadGrantsFromJson() {
  const grantsFilePath = path.resolve(__dirname, '../configs/accesscontrol/grants.json');
  if (!fs.existsSync(grantsFilePath)) {
    logger.error(`Grants file not found at: ${grantsFilePath}`, { label: 'ACCESS_CONTROL' });
    throw new Error(`Grants file not found: ${grantsFilePath}`);
  }
  const grantsData = fs.readFileSync(grantsFilePath, 'utf-8');
  return JSON.parse(grantsData);
}

/**
 * Placeholder function to load grants from the database using Drizzle.
 * This function needs to be implemented if you choose the database option.
 * @async
 * @private
 * @returns {Promise<GrantItem[]>} A promise that resolves to the list of grant items.
 * @throws {Error} If database query fails or data mapping is incorrect.
 */
// async function _loadGrantsFromDatabase() {
//   logger.info('Loading grants from database...', { label: 'ACCESS_CONTROL_DB' });
//   /**
//    * TODO: Implement Drizzle queries to fetch roles, permissions,
//    * and their relationships. Then, transform this data into the
//    * grantList format expected by AccessControl.
//    *
//    * Example structure for grantList:
//    * [
//    *   { role: 'admin', resource: 'user', action: 'create:any', attributes: '*' },
//    *   { role: 'editor', inherits: ['viewer'] },
//    *   ...
//    * ]
//    */
//   // const dbRolePermissions = await db.select({
//   //     roleName: rolesTable.name, // Assuming rolesTable has a 'name' field for role identifier
//   //     resource: permissionsTable.resource, // Assuming permissionsTable has 'resource'
//   //     action: permissionsTable.action, // Assuming permissionsTable has 'action' (e.g., 'create:own')
//   //     attributes: permissionsTable.attributes // Assuming permissionsTable has 'attributes' (e.g., '*')
//   //   })
//   //   .from(rolePermissionsTable) // Your join table for roles and permissions
//   //   .innerJoin(rolesTable, eq(rolePermissionsTable.roleId, rolesTable.id))
//   //   .innerJoin(permissionsTable, eq(rolePermissionsTable.permissionId, permissionsTable.id));

//   // const grants = dbRolePermissions.map(rp => ({
//   //   role: rp.roleName,
//   //   resource: rp.resource,
//   //   action: rp.action,
//   //   attributes: rp.attributes || '*', // Default to '*' if not specified
//   // }));

//   // // Handle role inheritance (assuming you have a table for this or a way to define it)
//   // // Example:
//   // // const roleInheritance = await db.select(...).from(roleInheritanceTable);
//   // // roleInheritance.forEach(inheritance => {
//   // //   grants.push({ role: inheritance.childRole, inherits: [inheritance.parentRole] });
//   // // });

//   // logger.info(`Loaded ${grants.length} grant items from database.`, { label: 'ACCESS_CONTROL_DB' });
//   // return grants;
//   throw new Error("_loadGrantsFromDatabase not implemented yet.");
// }

/**
 * Initializes the AccessControl instance.
 * It tries to load grants from JSON by default.
 * Can be configured to load from DB by uncommenting and implementing `_loadGrantsFromDatabase`.
 * @param {boolean} [useDatabase=false] - If true, attempts to load grants from the database.
 * @returns {AccessControl} The initialized AccessControl instance.
 * @throws {Error} If initialization fails.
 */
function initializeAccessControl(useDatabase = false) {
  if (ac && !useDatabase) {
    // If already initialized with JSON and not forced to use DB
    return ac;
  }
  // If forced to use DB or not initialized
  if (ac && useDatabase && ac._source === 'database') {
    // If already initialized with DB
    return ac;
  }

  try {
    let grantList;
    let source = 'json';
    if (useDatabase) {
      // grantList = await _loadGrantsFromDatabase(); // This would make initializeAccessControl async
      // For sync version with DB, _loadGrantsFromDatabase should be called elsewhere and pass grants
      // Or make this function async and await it in app.js
      logger.warn(
        'Database option for AccessControl grants is configured but _loadGrantsFromDatabase needs async handling or pre-loading.',
        { label: 'ACCESS_CONTROL' }
      );
      throw new Error(
        'Async DB loading for AccessControl needs adjustment in initialization flow.'
      );
      // source = 'database';
    } else {
      grantList = _loadGrantsFromJson();
    }

    ac = new AccessControl(grantList);
    ac._source = source; // Store the source for re-initialization logic
    logger.info(`AccessControl initialized successfully from ${source}.`, {
      label: 'ACCESS_CONTROL',
    });
  } catch (error) {
    logger.error('Failed to initialize AccessControl:', {
      message: error.message,
      stack: error.stack,
      label: 'ACCESS_CONTROL',
    });
    // Propagate the error to be handled by the application startup
    throw error;
  }
  return ac;
}

/**
 * Gets the initialized AccessControl instance.
 * If not initialized, it will initialize from JSON by default.
 * @returns {AccessControl} The AccessControl instance.
 * @throws {Error} If initialization fails.
 */
function getAccessControlInstance() {
  if (!ac) {
    return initializeAccessControl(); // Initialize with default (JSON)
  }
  return ac;
}

module.exports = {
  initializeAccessControl,
  getAccessControlInstance,
};
