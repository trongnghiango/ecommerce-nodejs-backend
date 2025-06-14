const { getAccessControlInstance } = require('../auth/accesscontrol');
const { ApiError } = require('../core/api-error');
const { logger } = require('../utils/logger.util');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 */

/**
 * Middleware to authorize requests using AccessControl.
 * Assumes `req.user.roles` is an array of role strings set by a preceding authentication middleware.
 *
 * @param {string} actionWithPossession - The action to perform, including possession (e.g., 'create:own', 'read:any').
 * @param {string} resource - The resource being accessed (e.g., 'profile', 'articles').
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function.
 */
const authorizeAC = (actionWithPossession, resource) => {
  return (req, res, next) => {
    const ac = getAccessControlInstance();
    if (!ac) {
      logger.error('AccessControl instance not available in authorizeAC middleware.', {
        label: 'AUTHORIZE_AC',
      });
      // Do not call next() without an error here if ac is critical
      return next(ApiError.internalError('Authorization service is not configured.'));
    }

    // Default to 'anonymous' role if no user or roles are found on the request.
    // req.user and req.user.roles should be populated by your authentication middleware.
    const userRoles =
      req.user && Array.isArray(req.user.roles) && req.user.roles.length > 0
        ? req.user.roles
        : ['anonymous'];

    try {
      const parts = actionWithPossession.split(':');
      if (parts.length !== 2) {
        logger.error(
          `Invalid actionWithPossession format: '${actionWithPossession}'. Expected 'action:possession'.`,
          {
            label: 'AUTHORIZE_AC',
            resource,
          }
        );
        return next(ApiError.internalError('Authorization rule configuration error.'));
      }
      const action = parts[0];
      const possession = parts[1];

      let permission;
      // AccessControl's fluent API: ac.can(['role1', 'role2']).createAny('resource')
      const query = ac.can(userRoles);

      switch (possession.toLowerCase()) {
        case 'any':
          permission = query[`${action}Any`](resource);
          break;
        case 'own':
          permission = query[`${action}Own`](resource);
          break;
        default:
          logger.error(
            `Unknown possession type: '${possession}' in action '${actionWithPossession}'.`,
            {
              label: 'AUTHORIZE_AC',
              resource,
            }
          );
          return next(ApiError.internalError('Invalid authorization rule (possession type).'));
      }

      if (permission.granted) {
        logger.info(
          `Authorization GRANTED: Roles='${userRoles.join(',')}', Resource='${resource}', Action='${actionWithPossession}'`,
          { label: 'ACCESS_CONTROL' }
        );
        /**
         * For ':own' possession, additional checks might be needed
         * to verify if the current user is indeed the owner of the resource.
         * This typically involves comparing req.user.id with a field on the resource.
         * This middleware only checks if the role *can* perform an 'own' action.
         * The actual ownership check should happen in the service or controller.
         *
         * Example (conceptual, to be done in service/controller):
         * if (possession.toLowerCase() === 'own') {
         *   // const resourceInstance = await getResourceById(req.params.id);
         *   // if (resourceInstance.ownerId !== req.user.id) {
         *   //   return next(ApiError.forbidden(`You can only ${action} your own ${resource}.`));
         *   // }
         * }
         */
        req.permission = permission; // Attach permission object for potential attribute filtering
        next();
      } else {
        logger.warn(
          `Authorization DENIED: Roles='${userRoles.join(',')}', Resource='${resource}', Action='${actionWithPossession}'`,
          { label: 'ACCESS_CONTROL' }
        );
        next(
          ApiError.forbidden(
            'You do not have permission to perform this action or access this resource.'
          )
        );
      }
    } catch (error) {
      // This catch is for unexpected errors within the try block itself,
      // not for 'permission.granted === false'.
      logger.error('Error during AccessControl enforcement:', {
        message: error.message,
        stack: error.stack,
        roles: userRoles,
        resource,
        action: actionWithPossession,
        label: 'ACCESS_CONTROL',
      });
      next(ApiError.internalError('An error occurred while checking permissions.'));
    }
  };
};

module.exports = { authorizeAC };
