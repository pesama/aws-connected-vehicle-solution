# CVS Auth module reference

The authentication module of the Connected Vehicle solution handles all authentication and authorization processes required by users upon any operation performed within the system. This module is therefore leverage by any user-interfacing module that want to operate with other parts of the system.

## Architecture

Most of the features of this module are provided by Amazon Cognito. Amazon Cognito relies on IAM for storing the roles and performing the ultimate authentication for resource usage. These are the components of the Auth module:

* **User Pool**: Stores all the user and group information.
* **Default User Pool Client:** Enables the UserPool to perform authentication tasks.
* **Default Identity Pool:** Provides identity federation to the users from the UserPool, to be assigned with IAM roles for service usage.
* **Default roles:** IAM roles for _authenticated_ and _unauthenticated_ users, that define what they can do in the platform.