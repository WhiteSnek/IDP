import { ALL_CHANNELS, NOTIFICATION_PERMISSION } from "../constants";
import { Permissions } from "../types/permissions";
import { generateOAuthToken } from "./generateToken";

export const generateIDPToken = () => {
    const permissions: Permissions = {
        notification: NOTIFICATION_PERMISSION,
        channels: ALL_CHANNELS
    }
    const token = generateOAuthToken(
        {
          sub: "idp",
          permissions,
          type: "client_credentials",
        },
        {
          audience: ["notification_service"],
          expiresIn: 3600,
        }
      );
    return token;
}
