import { ETicketUsage, LoginHint, TicketUsage } from "../types";

export const TicketChallengeRequestSchema = {
  $id: 'TicketChallenge',
  type: 'object',
  properties: {
    client_id: {
      type: 'string'
    },
    client_secret: {
      type: 'string'
    },
    redirect_uri: {
      type: 'string'
    },
    usage: {
      type: 'string',
      enum: Object.values(ETicketUsage),
    },
    connection: {
      type: 'string'
    },
    login_hint: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          required: false,
        },
        username: {
          type: 'string',
          required: false,
        },
      }
    }
  },
  required: ['client_id', 'client_secret', 'redirect_uri', 'usage', 'connection']
};

export type TicketChallengeRequest = {
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  usage: TicketUsage;
  connection: string;
  login_hint?: LoginHint;
};
export const TicketChallengeRequest = (() => {
  function check_TicketChallengeRequest(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.client_id === 'string' &&
      typeof value.client_secret === 'string' &&
      typeof value.redirect_uri === 'string' &&
      typeof value.usage === 'string' &&
      typeof value.connection === 'string' &&
      (value.login_hint !== undefined
        ? (typeof value.login_hint === 'object' &&
          value.login_hint !== null &&
          !Array.isArray(value.login_hint)) ||
        value.login_hint === null
        : true)
    );
  }
  return function check(value: any): value is TicketChallengeRequest {
    return check_TicketChallengeRequest(value);
  };
})();
